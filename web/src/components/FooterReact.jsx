import { Link } from 'react-router-dom'
import { APP_PATHS, buildLoginUrl } from '../lib/routes'

export function FooterReact() {
  return (
    <footer className="pie pie-extenso">
      <div className="container py-5">
        <div className="row g-4 align-items-start">
          <div className="col-12 col-lg-4">
            <div className="footer-brand-block">
              <p className="footer-kicker">Raíces Viajeras</p>
              <h2 className="footer-title">Viajar con propósito, volver con raíces.</h2>
              <p className="footer-copy">
                Diseñamos viajes responsables para que cada escapada deje huella en las personas,
                no en el planeta.
              </p>
            </div>
          </div>

          <div className="col-12 col-md-6 col-lg-4">
            <h3 className="footer-heading">Páginas</h3>
            <ul className="footer-link-list">
              <li><Link to={APP_PATHS.home}>Inicio</Link></li>
              <li><Link to={APP_PATHS.blog}>Blog</Link></li>
              <li><Link to={APP_PATHS.provincias}>Viajes</Link></li>
              <li><Link to={APP_PATHS.destinos}>Destinos</Link></li>
              <li><Link to={APP_PATHS.infoAventura}>Info aventura</Link></li>
              <li><Link to={APP_PATHS.conocenos}>Conócenos</Link></li>
              <li><Link to={APP_PATHS.articulo}>Artículos</Link></li>
              <li><a href={buildLoginUrl(APP_PATHS.home)}>Acceso</a></li>
              <li><Link to={APP_PATHS.paga}>Pagar</Link></li>
            </ul>
          </div>

          <div className="col-12 col-md-6 col-lg-4">
            <h3 className="footer-heading">Contacto</h3>
            <ul className="footer-contact-list">
              <li>
                <span>Correo</span>
                <a href="mailto:admin@raicesviajeras.local">admin@raicesviajeras.local</a>
              </li>
              <li>
                <span>Atención</span>
                <p>Lunes a viernes, de 9:00 a 18:00</p>
              </li>
              <li>
                <span>Soporte</span>
                <p>Respondemos dudas de reservas, accesos y cestas temporales.</p>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2026 Raíces Viajeras. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
