export function CartStateView({
  title,
  message,
  actionHref,
  actionLabel,
  className = 'rv-cart-state-copy',
}) {
  return (
    <div className="rv-cart-state">
      <h3 className="rv-cart-state-title">{title}</h3>
      <p className={className}>{message}</p>
      {actionHref && actionLabel ? (
        <a href={actionHref} className="btn btn-primario">
          {actionLabel}
        </a>
      ) : null}
    </div>
  )
}
