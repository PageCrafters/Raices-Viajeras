import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  addCartItem,
  fetchCartSummary,
  fetchSession,
  removeCartItem,
} from './api/cartApi'
import { CartModal } from './components/CartModal'
import { CartPage } from './components/CartPage'
import { HeaderReact } from './components/HeaderReact'
import { ToastStack } from './components/ToastStack'

function App() {
  const [session, setSession] = useState(null)
  const [summary, setSummary] = useState(null)
  const [isLoadingSession, setIsLoadingSession] = useState(true)
  const [isLoadingSummary, setIsLoadingSummary] = useState(true)
  const [pageError, setPageError] = useState('')
  const [modalError, setModalError] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isModalLoading, setIsModalLoading] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [removingItemIds, setRemovingItemIds] = useState([])
  const [toasts, setToasts] = useState([])

  const isLoading = isLoadingSession || isLoadingSummary
  const cartCount = summary?.carrito?.count ?? 0

  const addToast = useCallback((message, type = 'success') => {
    const toastId = window.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`
    setToasts((current) => [...current, { id: toastId, message, type }])
  }, [])

  const removeToast = useCallback((toastId) => {
    setToasts((current) => current.filter((toast) => toast.id !== toastId))
  }, [])

  const applyTheme = useCallback((nextIsDark) => {
    setIsDarkMode(nextIsDark)
    document.documentElement.classList.toggle('dark-mode', nextIsDark)
    localStorage.setItem('theme', nextIsDark ? 'dark' : 'light')
  }, [])

  const toggleTheme = useCallback(() => {
    applyTheme(!isDarkMode)
  }, [applyTheme, isDarkMode])

  const refreshCartSummary = useCallback(
    async ({ target = 'both', showLoading = false } = {}) => {
      if (showLoading && (target === 'both' || target === 'modal')) {
        setIsModalLoading(true)
      }

      if (target === 'both' || target === 'page') {
        setPageError('')
      }
      if (target === 'both' || target === 'modal') {
        setModalError('')
      }

      try {
        const nextSummary = await fetchCartSummary()
        setSummary(nextSummary)
        return nextSummary
      } catch {
        const message = 'No hemos podido recuperar tu cesta en este momento.'

        if (target === 'both' || target === 'page') {
          setPageError(message)
        }
        if (target === 'both' || target === 'modal') {
          setModalError(message)
        }

        throw error
      } finally {
        if (showLoading && (target === 'both' || target === 'modal')) {
          setIsModalLoading(false)
        }
      }
    },
    []
  )

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    applyTheme(savedTheme === 'dark')
  }, [applyTheme])

  useEffect(() => {
    document.body.classList.add('theme-loaded')

    return () => {
      document.body.classList.remove('theme-loaded')
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    const loadData = async () => {
      setIsLoadingSession(true)
      setIsLoadingSummary(true)
      setPageError('')
      setModalError('')

      try {
        const [sessionData, summaryData] = await Promise.all([
          fetchSession(),
          fetchCartSummary(),
        ])

        if (cancelled) {
          return
        }

        setSession(sessionData)
        setSummary(summaryData)
      } catch {
        if (!cancelled) {
          setPageError('No hemos podido recuperar tu cesta en este momento.')
          setModalError('No hemos podido recuperar tu cesta en este momento.')
        }
      } finally {
        if (!cancelled) {
          setIsLoadingSession(false)
          setIsLoadingSummary(false)
        }
      }
    }

    loadData()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    document.body.classList.toggle('modal-open', isModalOpen)

    if (!isModalOpen) {
      return undefined
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsModalOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.classList.remove('modal-open')
    }
  }, [isModalOpen])

  const handleOpenModal = useCallback(async () => {
    setIsModalOpen(true)

    try {
      await refreshCartSummary({ target: 'modal', showLoading: true })
    } catch {
      addToast('No hemos podido actualizar la cesta.', 'error')
    }
  }, [addToast, refreshCartSummary])

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
  }, [])

  const handleRemoveItem = useCallback(
    async (cartItemId) => {
      setRemovingItemIds((current) => [...current, cartItemId])

      try {
        const nextSummary = await removeCartItem(cartItemId)
        setSummary(nextSummary)
        addToast('Viaje eliminado de la cesta.', 'success')
      } catch {
        setPageError('No se ha podido eliminar el viaje de la cesta.')
        setModalError('No se ha podido eliminar el viaje de la cesta.')
        addToast('No se ha podido eliminar el viaje de la cesta.', 'error')
      } finally {
        setRemovingItemIds((current) =>
          current.filter((currentItemId) => currentItemId !== cartItemId)
        )
      }
    },
    [addToast]
  )

  const isRemovingItem = useCallback(
    (cartItemId) => removingItemIds.includes(cartItemId),
    [removingItemIds]
  )

  const modalCta = useMemo(() => {
    if (!summary?.logueado) {
      return {
        href: `/Raices-Viajeras/web/Formulario/form.html?modo=login&redirect=${encodeURIComponent(
          '/Raices-Viajeras/web/html/paga.html'
        )}`,
        label: 'Iniciar sesión o registrarte para comprar',
      }
    }

    return {
      href: '/Raices-Viajeras/web/html/paga.html',
      label: 'Ir a la cesta',
    }
  }, [summary])

  const handleRetryPage = useCallback(async () => {
    setIsLoadingSummary(true)
    setPageError('')

    try {
      await refreshCartSummary({ target: 'page' })
    } catch {
      addToast('No hemos podido actualizar la cesta.', 'error')
    } finally {
      setIsLoadingSummary(false)
    }
  }, [addToast, refreshCartSummary])

  const handleAddItem = useCallback(
    async (tripId) => {
      try {
        const nextSummary = await addCartItem(tripId)
        setSummary(nextSummary)
        addToast(
          nextSummary.logueado
            ? 'Viaje añadido a la cesta.'
            : 'Viaje añadido a tu cesta temporal.',
          'success'
        )
      } catch (error) {
        addToast(error.message || 'No se pudo añadir el viaje a la cesta.', 'error')
      }
    },
    [addToast]
  )

  useEffect(() => {
    window.rvCartAddItem = handleAddItem
    window.rvCartShowNotice = addToast
    document.dispatchEvent(new CustomEvent('rv:cesta-ready'))

    return () => {
      delete window.rvCartAddItem
      delete window.rvCartShowNotice
    }
  }, [addToast, handleAddItem])

  return (
    <>
      <HeaderReact
        session={session}
        cartCount={cartCount}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        onOpenCart={handleOpenModal}
      />

      <CartPage
        summary={summary}
        isLoading={isLoading}
        error={pageError}
        onRetry={handleRetryPage}
        onRemoveItem={handleRemoveItem}
        isRemovingItem={isRemovingItem}
      />

      <CartModal
        isOpen={isModalOpen}
        isLoading={isModalLoading}
        error={modalError}
        summary={summary}
        cta={modalCta}
        onClose={handleCloseModal}
        onRemoveItem={handleRemoveItem}
        isRemovingItem={isRemovingItem}
      />

      <ToastStack toasts={toasts} onDismiss={removeToast} />
    </>
  )
}

export default App
