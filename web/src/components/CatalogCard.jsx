import { formatCurrency } from '../lib/cartUi'

function joinClasses(...classes) {
  return classes.filter(Boolean).join(' ')
}

function renderActionLabel({ label, href, onClick, disabled }) {
  if (!label) {
    return null
  }

  if (!disabled && href) {
    return (
      <a
        className="ca-card-btn"
        href={href}
        onClick={(event) => {
          event.stopPropagation()
          if (onClick) {
            onClick(event)
          }
        }}
      >
        {label}
      </a>
    )
  }

  return <span className="ca-card-btn">{label}</span>
}

function renderSecondaryAction({ label, onClick, disabled }) {
  if (!label) {
    return null
  }

  return (
    <button
      type="button"
      className="ca-card-btn ca-card-btn-secondary"
      onClick={(event) => {
        event.stopPropagation()
        event.preventDefault()
        if (onClick) {
          onClick(event)
        }
      }}
      disabled={disabled}
    >
      {label}
    </button>
  )
}

export function CatalogCard({
  className = '',
  disabled = false,
  description = '',
  eyebrow = '',
  href,
  imageAlt = '',
  imageSrc,
  primaryActionHref = href,
  primaryActionLabel,
  primaryActionOnClick,
  price,
  secondaryActionDisabled = false,
  secondaryActionLabel,
  secondaryActionOnClick,
  title,
  variant = 'province',
}) {
  const cardHref = href || primaryActionHref
  const isDetailVariant = variant === 'trip' || variant === 'blog'

  const rootClassName = joinClasses(
    'ca-card',
    isDetailVariant && 'ca-card--trip',
    variant === 'blog' && 'ca-card--blog',
    disabled && 'card-disabled',
    className
  )

  const bodyClassName = joinClasses(
    'ca-card-body',
    isDetailVariant && 'ca-card-body--trip',
    variant === 'blog' && 'ca-card-body--blog'
  )

  const handleCardClick = () => {
    if (disabled || !cardHref) {
      return
    }

    window.location.href = cardHref
  }

  return (
    <div className={rootClassName} onClick={handleCardClick}>
      <img className="ca-card-img" alt={imageAlt || title || ''} src={imageSrc} />
      <div className="ca-card-overlay"></div>

      <div className={bodyClassName}>
        {isDetailVariant ? (
          <>
            <div className="ca-card-copy">
              {eyebrow ? <span className="ca-card-eyebrow">{eyebrow}</span> : null}
              <span className="ca-card-name">{title || ''}</span>
              {description ? <p className="ca-card-description">{description}</p> : null}
            </div>

            <div className="ca-card-btn-row ca-card-btn-row--actions">
              {price != null ? <span className="ca-card-price">{formatCurrency(price)}</span> : null}

              <div className="ca-card-actions">
                {renderActionLabel({
                  label: primaryActionLabel,
                  href: primaryActionHref,
                  onClick: primaryActionOnClick,
                  disabled,
                })}

                {renderSecondaryAction({
                  label: secondaryActionLabel,
                  onClick: secondaryActionOnClick,
                  disabled: secondaryActionDisabled,
                })}
              </div>
            </div>
          </>
        ) : (
          <>
            <span className="ca-card-name">{title || ''}</span>

            {renderActionLabel({
              label: primaryActionLabel,
              href: primaryActionHref,
              onClick: primaryActionOnClick,
              disabled,
            })}
          </>
        )}
      </div>
    </div>
  )
}