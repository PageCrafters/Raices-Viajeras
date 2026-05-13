import { APP_PATHS } from '../lib/routes'

export function HomeView() {
  return (
    <main id="contenido-principal">
      <a href="#contenido-principal" className="visually-hidden-focusable">
        Saltar al contenido principal
      </a>

      <div className="container-fluid">
        <section className="encabezado" aria-labelledby="titulo-hero">
          <div className="row align-items-center">
            <div className="col-12 col-lg-7">
              <h1 id="titulo-hero" className="display-6">
                Cada Viaje con Nosotros deja
                <br />
                <em>Huella en tu Memoria no en el Planeta</em>
              </h1>

              <p className="lead">
                Viajes sostenibles, alojamientos con energia renovable y experiencias que apoyan
                a comunidades locales.
              </p>

              <div className="mt-3">
                <a className="btn btn-primario me-2" href={APP_PATHS.login}>
                  Apuntate hoy
                </a>

                <a href={APP_PATHS.conocenos} className="btn btn-primario-outline">
                  Conocenos
                </a>
              </div>
            </div>

            <div className="col-12 col-lg-5 d-none d-lg-block" aria-hidden="true">
              <div className="row g-2 galeria">
                {['landing1.webp', 'landing4.webp', 'landing5.webp', 'landing6.webp'].map((image) => (
                  <div className="col-6" key={image}>
                    <img src={`/Raices-Viajeras/web/img/${image}`} alt="" role="presentation" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="beneficios" className="encabezado" aria-labelledby="titulo-beneficios">
          <div className="row align-items-center">
            <div className="col-12 col-lg-5 d-none d-lg-block" aria-hidden="true">
              <div className="row g-2 galeria">
                {['landing2.webp', 'landing3.webp', 'landing7.webp', 'landing8.webp'].map((image) => (
                  <div className="col-6" key={image}>
                    <img src={`/Raices-Viajeras/web/img/${image}`} alt="" role="presentation" />
                  </div>
                ))}
              </div>
            </div>

            <div className="col-12 col-lg-7">
              <h2 id="titulo-beneficios">
                Sabias que tu escapada de FIN DE SEMANA consume la misma energia que 3 FAMILIAS
                en UN ANO entero?
              </h2>

              <ul className="lista-beneficios" aria-label="Nuestros compromisos sostenibles">
                <li>Alojamientos rurales sostenibles</li>
                <li>Uso de energias renovables en alojamientos</li>
                <li>Actividades respetuosas con el medio ambiente</li>
                <li>Apoyo a comunidades locales</li>
                <li>Gastronomia con productos locales y de temporada</li>
                <li>Autobuses ecologicos</li>
                <li>Educacion ambiental para viajeros</li>
                <li>Compensacion de huella de carbono</li>
              </ul>

              <p>
                Viajar con nosotros no solo es descubrir nuevos destinos, es cuidar de ellos
                mientras lo haces.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
