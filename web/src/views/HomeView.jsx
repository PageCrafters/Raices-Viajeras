import { APP_PATHS, assetPath } from '../lib/routes'

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
                Cada viaje con nosotros deja
                <br />
                <em>huella en tu memoria, no en el planeta</em>
              </h1>

              <p className="lead">
                Viajes sostenibles, alojamientos con energía renovable y experiencias que apoyan
                a comunidades locales.
              </p>

              <div className="mt-3">
                <a className="btn btn-primario me-2" href={APP_PATHS.login}>
                  Apúntate hoy
                </a>

                <a href={APP_PATHS.conocenos} className="btn btn-primario-outline">
                  Conócenos
                </a>
              </div>
            </div>

            <div className="col-12 col-lg-5 d-none d-lg-block" aria-hidden="true">
              <div className="row g-2 galeria">
                {['landing1.webp', 'landing4.webp', 'landing5.webp', 'landing6.webp'].map((image) => (
                  <div className="col-6" key={image}>
                    <img src={assetPath(`img/${image}`)} alt="" role="presentation" />
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
                    <img src={assetPath(`img/${image}`)} alt="" role="presentation" />
                  </div>
                ))}
              </div>
            </div>

            <div className="col-12 col-lg-7">
              <h2 id="titulo-beneficios">
                ¿Sabías que tu escapada de fin de semana consume la misma energía que 3 familias
                en un año entero?
              </h2>

              <ul className="lista-beneficios" aria-label="Nuestros compromisos sostenibles">
                <li>Alojamientos rurales sostenibles</li>
                <li>Uso de energías renovables en alojamientos</li>
                <li>Actividades respetuosas con el medio ambiente</li>
                <li>Apoyo a comunidades locales</li>
                <li>Gastronomía con productos locales y de temporada</li>
                <li>Autobuses ecológicos</li>
                <li>Educación ambiental para viajeros</li>
                <li>Compensación de huella de carbono</li>
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