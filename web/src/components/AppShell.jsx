import { useCallback, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  addCartItem,
  checkoutCart,
  fetchCartSummary,
  fetchSession,
  removeCartItem,
} from '../api/cartApi'
import { APP_PATHS, buildLoginUrl } from '../lib/routes'
import { CartModal } from './CartModal'
import { FooterReact } from './FooterReact'
import { HeaderReact } from './HeaderReact'
import { ToastStack } from './ToastStack'

export function AppShell({ children, headerTarget = null, footerTarget = null }) {
  const [session, setSession] = useState(null)
  const [summary, setSummary] = useState(null)
  const [isLoadingSession, setIsLoadingSession] = useState(true)
  const [isLoadingSummary, setIsLoadingSummary] = useState(true)
  const [pageError, setPageError] = useState('')
  const [modalError, setModalError] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isModalLoading, setIsModalLoading] = useState(false)
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches

    return savedTheme ? savedTheme === 'dark' : Boolean(prefersDark)
  })
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

  const toggleTheme = useCallback(() => {
    setIsDarkMode((current) => !current)
  }, [])

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
      } catch (error) {
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
    // Sincronizamos la clase global y la preferencia guardada cada vez que cambia el modo.
    document.documentElement.classList.toggle('dark-mode', isDarkMode)
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light')
  }, [isDarkMode])

  useEffect(() => {
    // Marcamos el body como "ya cargado" para que las transiciones del layout entren suaves.
    document.body.classList.add('theme-loaded')

    return () => {
      document.body.classList.remove('theme-loaded')
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    const loadSession = async () => {
      setIsLoadingSession(true)

      try {
        const sessionData = await fetchSession()

        if (!cancelled) {
          setSession(sessionData)
        }
      } catch {
        if (!cancelled) {
          setSession(null)
        }
      } finally {
        if (!cancelled) {
          setIsLoadingSession(false)
        }
      }
    }

    const loadSummary = async () => {
      setIsLoadingSummary(true)
      setPageError('')
      setModalError('')

      try {
        const summaryData = await fetchCartSummary()

        if (!cancelled) {
          setSummary(summaryData)
        }
      } catch {
        if (!cancelled) {
          setPageError('No hemos podido recuperar tu cesta en este momento.')
          setModalError('No hemos podido recuperar tu cesta en este momento.')
        }
      } finally {
        if (!cancelled) {
          setIsLoadingSummary(false)
        }
      }
    }

    loadSession()
    loadSummary()

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
      // Escape funciona como cierre rápido del modal, igual que en una app nativa.
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

  const handleCheckout = useCallback(async () => {
    setIsCheckoutLoading(true)
    setPageError('')
    setModalError('')

    try {
      const nextSummary = await checkoutCart()
      setSummary(nextSummary)
      return nextSummary
    } catch (error) {
      const message = error?.message || 'No se ha podido completar el pago.'
      setPageError(message)
      setModalError(message)
      addToast(message, 'error')
      throw error
    } finally {
      setIsCheckoutLoading(false)
    }
  }, [addToast])

  const modalCta = useMemo(() => {
    if (!summary?.logueado) {
      return {
        href: buildLoginUrl(APP_PATHS.paga),
        label: 'Iniciar sesión o registrarte para comprar',
      }
    }

    return {
      href: APP_PATHS.paga,
      label: 'Ir a pagar',
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
        return nextSummary
      } catch (error) {
        addToast(error.message || 'No se pudo añadir el viaje a la cesta.', 'error')
        throw error
      }
    },
    [addToast]
  )

  useEffect(() => {
    // Este puente deja viva la integración con el JS viejo que sigue llamando a la cesta desde HTML.
    window.rvCartAddItem = handleAddItem
    window.rvCartShowNotice = addToast
    document.dispatchEvent(new CustomEvent('rv:cesta-ready'))

    return () => {
      delete window.rvCartAddItem
      delete window.rvCartShowNotice
    }
  }, [addToast, handleAddItem])

  const header = (
    <HeaderReact
      session={session}
      cartCount={cartCount}
      isDarkMode={isDarkMode}
      onToggleTheme={toggleTheme}
      onOpenCart={handleOpenModal}
    />
  )
  const footer = <FooterReact />
  const shellContext = {
    summary,
    isLoading,
    pageError,
    handleRetryPage,
    handleRemoveItem,
    isRemovingItem,
    handleAddItem,
    handleCheckout,
    isCheckoutLoading,
  }

  return (
    <>
      {headerTarget ? createPortal(header, headerTarget) : header}

      {typeof children === 'function' ? children(shellContext) : children}

      {footerTarget ? createPortal(footer, footerTarget) : footer}

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
