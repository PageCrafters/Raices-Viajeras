import { useState } from 'react'
import { APP_PATHS, assetPath, backendPath, buildLoginUrl } from '../lib/routes'

function getLoginUrl() {
  return buildLoginUrl(APP_PATHS.paga)
}

function getBadgeLabel(count) {
  if (count > 99) {
    return '99+'
  }

  return String(count)
}

export function HeaderReact({
  session,
  cartCount,
  isDarkMode,
  onToggleTheme,
  onOpenCart,
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const closeMenu = () => setIsMenuOpen(false)

  return (
    <header>
      <nav className="navbar navbar-expand-lg navbar-light navbar-personalizada">
        <div className="container-fluid">
          <a className="navbar-brand d-flex align-items-center" href={APP_PATHS.home} onClick={closeMenu}>
            <img
              src={assetPath('img/raices-viajeras-logo0.webp')}
              alt="Raíces Viajeras"
              style={{ maxWidth: 56 }}
              className="me-2"
            />
            <span>RAÍCES VIAJERAS</span>
          </a>

          <div className="d-flex align-items-center gap-2">
            <button
              className="btn cambiar-tema d-lg-none btn-modo"
              type="button"
              onClick={onToggleTheme}
              aria-label="Cambiar tema"
            >
              <i className={`theme-icon bi ${isDarkMode ? 'bi-sun-fill' : 'bi-moon-fill'}`}></i>
            </button>

            <button
              className="navbar-toggler"
              type="button"
              aria-controls="navMenu"
              aria-expanded={isMenuOpen ? 'true' : 'false'}
              aria-label="Abrir navegación"
              onClick={() => setIsMenuOpen((current) => !current)}
            >
              <span className="navbar-toggler-icon"></span>
            </button>
          </div>

          <div className={`collapse navbar-collapse ${isMenuOpen ? 'show' : ''}`} id="navMenu">
            <ul className="navbar-nav ms-auto align-items-lg-center">
              <li className="nav-item d-none d-lg-flex align-items-center">
                <button
                  className="btn cambiar-tema"
                  type="button"
                  onClick={onToggleTheme}
                  aria-label="Cambiar tema"
                >
                  <i className={`theme-icon bi ${isDarkMode ? 'bi-sun-fill' : 'bi-moon-fill'}`}></i>
                </button>
              </li>

              <li className="nav-item">
                <a className="nav-link" href={APP_PATHS.home} onClick={closeMenu}>
                  Inicio
                </a>
              </li>

              <li className="nav-item">
                <a className="nav-link" href={APP_PATHS.blog} onClick={closeMenu}>
                  Blog
                </a>
              </li>

              <li className="nav-item">
                <a className="nav-link" href={APP_PATHS.provincias} onClick={closeMenu}>
                  Viajes
                </a>
              </li>

              <li className="nav-item">
                <button
                  type="button"
                  className="nav-link btn btn-link header-cart-trigger"
                  aria-label="Abrir cesta"
                  aria-haspopup="dialog"
                  onClick={() => {
                    closeMenu()
                    onOpenCart()
                  }}
                >
                  <i className="bi bi-basket-fill" aria-hidden="true"></i>
                  <span className={`rv-cart-badge ${cartCount > 0 ? '' : 'd-none'}`} aria-live="polite">
                    {getBadgeLabel(cartCount)}
                  </span>
                </button>
              </li>

              <li className="nav-item header-auth-item">
                {session?.logueado ? (
                  <>
                    <span className="nav-link header-user-name">Hola, {session.nombre || 'Usuario'}</span>
                    <a
                      className="nav-link header-logout-link"
                      href={backendPath('/php/cerrar_sesion.php')}
                      onClick={closeMenu}
                    >
                      Cerrar sesión
                    </a>
                  </>
                ) : (
                  <a className="nav-link" href={getLoginUrl()} onClick={closeMenu}>
                    Iniciar sesión
                  </a>
                )}
              </li>

              <li className={`nav-item ${session?.rol === 'admin' ? '' : 'd-none'}`}>
                <a className="btn btn-success btn-sm ms-lg-2" href={APP_PATHS.admin} onClick={closeMenu}>
                  <i className="bi bi-speedometer2 me-1"></i>Panel Admin
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  )
}
