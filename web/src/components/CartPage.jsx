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

export function CartPage({
  summary,
  isLoading,
  error,
  onRetry,
  onRemoveItem,
  isRemovingItem,
}) {
  const isLoggedIn = Boolean(summary?.logueado)
  const count = summary?.carrito?.count ?? 0
  const total = summary?.carrito?.total ?? 0
  const items = summary?.carrito?.items ?? []

  const showItems = !isLoading && !error && isLoggedIn && items.length > 0

  return (
    <main className="container rv-cart-page-shell">
      <div className="rv-cart-page-hero">
        <p className="rv-cart-kicker">Resumen de tu selección</p>
        <h1>Tu cesta de viajes sostenibles</h1>
        <p>
          Revisa tu carrito actual, elimina los viajes que no quieras mantener y deja lista tu
          selección para la siguiente fase.
        </p>
        <span className="rv-cart-count-pill">{getCountLabel(count)}</span>
      </div>

      {isLoading ? (
        <div className="rv-cart-feedback rv-cart-page-feedback" role="status" aria-live="polite">
          <CartStateView
            title="Cargando cesta..."
            message="Estamos recuperando tu resumen actual."
            className="rv-cart-state-copy mb-0"
          />
        </div>
      ) : null}

      {!isLoading && error ? (
        <div className="rv-cart-feedback rv-cart-page-feedback" role="status" aria-live="polite">
          <CartStateView title="No se pudo cargar la cesta" message={error} className="rv-cart-state-copy mb-3" />
          <div className="d-flex justify-content-center mt-3">
            <button type="button" className="btn btn-primario" onClick={onRetry}>
              Reintentar
            </button>
          </div>
        </div>
      ) : null}

      {!isLoading && !error && !isLoggedIn ? (
        <div className="rv-cart-feedback rv-cart-page-feedback" role="status" aria-live="polite">
          <CartStateView
            title="Acceso necesario para ver la cesta"
            message={
              count > 0
                ? 'Tienes viajes guardados temporalmente. Inicia sesión o regístrate para pasarlos a tu cesta real y continuar con la compra.'
                : 'Tu cesta completa estará disponible cuando inicies sesión.'
            }
            actionHref={getLoginUrl()}
            actionLabel="Iniciar sesión o registrarte"
            className="rv-cart-state-copy mb-3"
          />
        </div>
      ) : null}

      {!isLoading && !error && isLoggedIn && items.length === 0 ? (
        <div className="rv-cart-feedback rv-cart-page-feedback" role="status" aria-live="polite">
          <CartStateView
            title="Tu cesta está vacía"
            message="Todavía no hay viajes en tu carrito activo."
            actionHref="/Raices-Viajeras/web/html/provincias.html"
            actionLabel="Explorar viajes"
            className="rv-cart-state-copy mb-3"
          />
        </div>
      ) : null}

      {showItems ? (
        <div className="row g-4">
          <div className="col-12 col-xl-8">
            <div className="rv-cart-items rv-cart-items-page">
              {items.map((item) => (
                <CartItemCard
                  key={`${item.carrito_viaje_id}-${item.viaje_id}`}
                  item={item}
                  onRemove={onRemoveItem}
                  isRemoving={isRemovingItem(item.carrito_viaje_id)}
                />
              ))}
            </div>
          </div>

          <div className="col-12 col-xl-4">
            <aside className="rv-cart-summary rv-cart-summary-page">
              <p className="rv-cart-summary-label mb-1">Total actual</p>
              <div className="rv-cart-total">{formatCurrency(total)}</div>
              <p className="rv-cart-inline-note mt-2">
                El checkout completo llegará en la siguiente fase. Por ahora puedes revisar tu
                cesta y seguir explorando la web.
              </p>

              <div className="d-grid gap-2 mt-4">
                <a href="/Raices-Viajeras/web/html/provincias.html" className="btn btn-primario">
                  Seguir explorando
                </a>
                <button type="button" className="btn btn-outline-secondary" disabled>
                  Pago próximamente
                </button>
              </div>
            </aside>
          </div>
        </div>
      ) : null}
    </main>
  )
}
