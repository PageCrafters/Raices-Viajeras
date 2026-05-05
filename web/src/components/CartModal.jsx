import { CartItemCard } from './CartItemCard'
import { CartStateView } from './CartStateView'
import { formatCurrency, getCountLabel } from '../lib/cartUi'

function getLoginUrl() {
  const url = new URL(
    '/Raices-Viajeras/web/Formulario/form.html?modo=login',
    window.location.origin
  )

  url.searchParams.set('redirect', '/Raices-Viajeras/web/html/paga.html')
  return `${url.pathname}${url.search}`
}

function renderModalState({ isLoading, error, summary }) {
  if (isLoading) {
    return (
      <CartStateView
        title="Cargando cesta..."
        message="Estamos recuperando tu resumen actual."
        className="rv-cart-state-copy mb-0"
      />
    )
  }

  if (error) {
    return (
      <CartStateView
        title="No se pudo cargar la cesta"
        message={error}
        className="rv-cart-state-copy mb-0"
      />
    )
  }

  const isLoggedIn = Boolean(summary?.logueado)
  const items = summary?.carrito?.items ?? []

  if (items.length === 0) {
    const message = isLoggedIn
      ? 'Tu carrito activo está listo para recibir nuevas aventuras.'
      : 'Tu cesta temporal está vacía. Puedes seguir explorando viajes antes de iniciar sesión.'

    return (
      <CartStateView
        title="Tu cesta está vacía"
        message={message}
        actionHref="/Raices-Viajeras/web/html/provincias.html"
        actionLabel="Explorar viajes"
        className="rv-cart-state-copy mb-3"
      />
    )
  }

  return null
}

export function CartModal({
  isOpen,
  isLoading,
  error,
  summary,
  cta,
  onClose,
  onRemoveItem,
  isRemovingItem,
}) {
  const stateNode = renderModalState({ isLoading, error, summary })
  const items = summary?.carrito?.items ?? []
  const total = summary?.carrito?.total ?? 0
  const count = summary?.carrito?.count ?? 0
  const isLoggedIn = Boolean(summary?.logueado)

  return (
    <>
      <div
        className={`modal fade rv-cart-modal ${isOpen ? 'show d-block' : 'd-none'}`}
        role="dialog"
        aria-labelledby="cestaModalLabel"
        aria-hidden={isOpen ? 'false' : 'true'}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            onClose()
          }
        }}
      >
        <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
          <div className="modal-content rv-cart-surface">
            <div className="modal-header rv-cart-header">
              <div>
                <p className="rv-cart-kicker mb-1">Raíces Viajeras</p>
                <h2 className="modal-title h4 mb-0" id="cestaModalLabel">
                  Tu cesta
                </h2>
              </div>
              <button type="button" className="btn-close" aria-label="Cerrar" onClick={onClose}></button>
            </div>

            <div className="modal-body">
              {stateNode ? (
                <div className="rv-cart-feedback" role="status" aria-live="polite">
                  {stateNode}
                </div>
              ) : (
                <div>
                  <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                    <p className="rv-cart-inline-note mb-0">
                      {isLoggedIn ? 'Resumen actual de tu selección.' : 'Resumen actual de tu cesta temporal.'}
                    </p>
                    <span className="rv-cart-count-pill">{getCountLabel(count)}</span>
                  </div>

                  <div className="rv-cart-items">
                    {items.map((item) => (
                      <CartItemCard
                        key={`${item.carrito_viaje_id}-${item.viaje_id}`}
                        item={item}
                        onRemove={onRemoveItem}
                        isRemoving={isRemovingItem(item.carrito_viaje_id)}
                      />
                    ))}
                  </div>

                  <div className="rv-cart-summary mt-4">
                    <p className="rv-cart-summary-label mb-1">Total actual</p>
                    <div className="rv-cart-total">{formatCurrency(total)}</div>
                    <p className="rv-cart-inline-note mt-2 mb-3">
                      {isLoggedIn
                        ? 'Puedes revisar la cesta aquí y continuar en la página completa cuando quieras.'
                        : 'Puedes seguir guardando viajes sin registrarte. Para comprar, inicia sesión o regístrate.'}
                    </p>
                    <a href={cta?.href || getLoginUrl()} className="btn btn-primario w-100">
                      {cta?.label || 'Iniciar sesión o registrarte para comprar'}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isOpen ? <div className="modal-backdrop fade show"></div> : null}
    </>
  )
}
