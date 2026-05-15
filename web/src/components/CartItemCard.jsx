import { formatCurrency, truncateText } from '../lib/cartUi'

export function CartItemCard({ item, onRemove, isRemoving }) {
  return (
    <article className="rv-cart-item">
      <img className="rv-cart-item-image" src={item.imagen} alt={item.titulo || 'Viaje'} />

      <div className="rv-cart-item-body">
        <div className="rv-cart-item-top">
          <div className="rv-cart-item-copy">
            <p className="rv-cart-item-kicker">{item.provincia_nombre || 'Experiencia sostenible'}</p>
            <h3 className="rv-cart-item-title">{item.titulo || 'Viaje sin título'}</h3>
            <p className="rv-cart-item-description">
              {truncateText(item.descripcion, 140) || 'Sin descripción disponible.'}
            </p>
          </div>

          <button
            type="button"
            className="btn btn-sm rv-cart-remove"
            aria-label={`Quitar ${item.titulo || 'viaje'} de la cesta`}
            onClick={() => onRemove(item.carrito_viaje_id)}
            disabled={isRemoving}
          >
            {isRemoving ? 'Quitando...' : 'Quitar'}
          </button>
        </div>

        <div className="rv-cart-item-meta">
          <span>
            Cantidad: <strong>{item.cantidad}</strong>
          </span>
          <span>
            Precio unitario: <strong>{formatCurrency(item.precio_unitario)}</strong>
          </span>
          <span>
            Subtotal: <strong>{formatCurrency(item.subtotal)}</strong>
          </span>
        </div>
      </div>
    </article>
  )
}
