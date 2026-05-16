import { Link } from 'react-router-dom'
import AmbientPlayer from '../components/AmbientalSound'
import { APP_PATHS, assetPath, buildRegisterUrl } from '../lib/routes'

const GALERIA_DERECHA = [
  'landing1.webp',
  'landing4.webp',
  'landing5.webp',
  'landing6.webp',
]

const GALERIA_IZQUIERDA = [
  'landing2.webp',
  'landing3.webp',
  'landing7.webp',
  'landing8.webp',
]

const BENEFICIOS = [
  'Alojamientos rurales sostenibles',
  'Uso de energias renovables en alojamientos',
  'Actividades respetuosas con el medio ambiente',
  'Apoyo a comunidades locales',
  'Gastronomia con productos locales y de temporada',
  'Autobuses ecologicos',
  'Educacion ambiental para viajeros',
  'Compensacion de huella de carbono',
]

function GaleriaGrid({ imagenes }) {
  return (
    <div className="row g-2 galeria" aria-hidden="true">
      {imagenes.map((img, i) => (
        <div className="col-6" key={i}>
          <img src={assetPath(`img/${img}`)} alt="" role="presentation" />
        </div>
      ))}
    </div>
  )
}

export default function HomePage() {
  return (
    <main id="contenido-principal">
      <a href="#contenido-principal" className="visually-hidden-focusable">
        Saltar al contenido principal
      </a>

      <div className="container-fluid">
        {/* Hero principal: dejamos el gancho y las acciones clave arriba del todo. */}
        <section className="encabezado" aria-labelledby="titulo-hero">
          <div className="row align-items-center">
            <div className="col-12 col-lg-7">
              <h1 id="titulo-hero" className="display-6">
                Cada viaje con nosotros deja
                <br />
                <em>Huella en tu memoria no en el planeta</em>
              </h1>

              <p className="lead">
                Viajes sostenibles, alojamientos con energía renovable y experiencias que apoyan
                a comunidades locales.
              </p>

              <div className="mt-3">
                <a href={buildRegisterUrl(APP_PATHS.home)} className="btn btn-primario me-2">
                  Apúntate hoy
                </a>
                <Link to={APP_PATHS.conocenos} className="btn btn-primario-outline">
                  Conócenos
                </Link>
              </div>
            </div>

            <div className="col-12 col-lg-5 d-none d-lg-block" aria-hidden="true">
              <GaleriaGrid imagenes={GALERIA_DERECHA} />
            </div>
          </div>
        </section>

        <section id="beneficios" className="encabezado" aria-labelledby="titulo-beneficios">
          <div className="row align-items-center">
            <div className="col-12 col-lg-5 d-none d-lg-block" aria-hidden="true">
              <GaleriaGrid imagenes={GALERIA_IZQUIERDA} />
            </div>

            <div className="col-12 col-lg-7">
              <h2 id="titulo-beneficios">
                Sabías que tu escapada de FIN DE SEMANA consume la misma energía que 3 FAMILIAS
                en UN AÑO entero?
              </h2>

              <ul className="lista-beneficios" aria-label="Nuestros compromisos sostenibles">
                {BENEFICIOS.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>

              <p>
                Viajar con nosotros no solo es descubrir nuevos destinos, es cuidar de ellos
                mientras lo haces.
              </p>
            </div>
          </div>
        </section>

        {/* El reproductor ambiental da contexto de marca sin estorbar al contenido. */}
        <div className="encabezado pt-0" aria-label="Reproductor de sonidos ambientales">
          <AmbientPlayer />
        </div>
      </div>
    </main>
  )
}
