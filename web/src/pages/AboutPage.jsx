import { Link, useNavigate } from 'react-router-dom'
import AnimatedNumber from '../components/AnimatedNumber'
import { APP_PATHS, assetPath, buildRegisterUrl } from '../lib/routes'

export default function AboutPage() {
  const navigate = useNavigate()

  function handleVolver() {
    // Si hay historial, volvemos un paso; si no, mandamos a la home para no dejar al usuario colgado.
    if (window.history.length > 1) {
      navigate(-1)
      return
    }

    navigate(APP_PATHS.home)
  }

  return (
    <>
      <section className="hero-conocenos">
        <div className="hero-bg-shape"></div>
        <div className="container-fluid px-4 px-lg-5">
          <div className="row align-items-center g-5">
            <div className="col-12 col-lg-6">
              <p className="hero-eyebrow">Nuestra historia</p>
              <h1 className="hero-title">
                Viajamos con<br />
                <em>propósito,</em>
                <br />
                volvemos con raíces.
              </h1>
              <p className="hero-desc">
                Somos una agencia online nacida de la convicción de que el turismo puede ser una
                fuerza regeneradora: para los destinos, para las comunidades y para quienes viajan.
              </p>
              <div className="hero-stat-row">
                <div className="hero-stat">
                  <strong>+20</strong>
                  <span>Destinos sostenibles</span>
                </div>
                <div className="hero-stat">
                  <strong>100%</strong>
                  <span>Alojamientos certificados</span>
                </div>
                <div className="hero-stat">
                  <strong>0 CO2</strong>
                  <span>Emisiones compensadas</span>
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-6 d-none d-lg-block">
              <div className="hero-img-grid">
                <img src={assetPath('img/conocenos/viajar-naturaleza-deskpot.webp')} alt="Viajeros en la naturaleza" />
                <img src={assetPath('img/conocenos/naturaleza-deskpot.webp')} alt="Viaje responsable" />
                <img src={assetPath('img/conocenos/bus-ecologico-deskpot.webp')} alt="Transporte ecológico" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mision-section">
        <div className="container">
          <p className="mision-quote">
            "El viaje ideal no es aquel que te lleva al lugar más lejano, sino aquel que te acerca
            más a ti mismo y deja el mundo un poco mejor de como lo encontraste."
          </p>
          <p className="mision-autor">- Filosofía de Raíces Viajeras</p>
        </div>
      </section>

      <section className="valores-section">
        <div className="container">
          <div className="row mb-2">
            <div className="col-12 col-lg-7">
              <p className="section-label">Lo que nos mueve</p>
              <h2 className="section-title">Nuestros valores</h2>
            </div>
          </div>
          <div className="row g-4">
            {[
              {
                icon: 'bi-tree-fill',
                titulo: 'Sostenibilidad real',
                texto: 'No greenwashing. Evaluamos cada proveedor con criterios rigurosos: energía renovable, gestión de residuos, huella de carbono y certificaciones verificables.',
              },
              {
                icon: 'bi-people-fill',
                titulo: 'Comunidades primero',
                texto: 'Más del 70 % del precio de cada viaje se queda en la economía local: guías autóctonos, artesanos y restaurantes de kilómetro cero.',
              },
              {
                icon: 'bi-heart-fill',
                titulo: 'Turismo consciente',
                texto: 'Diseñamos experiencias que fomentan la escucha, la presencia y el respeto profundo por la cultura y los ecosistemas de cada destino.',
              },
              {
                icon: 'bi-shield-check',
                titulo: 'Transparencia total',
                texto: 'Publicamos nuestra huella de carbono anual, los destinos de cada euro pagado y los informes de impacto de nuestros viajes.',
              },
              {
                icon: 'bi-lightbulb-fill',
                titulo: 'Innovación verde',
                texto: 'Adoptamos transporte de bajas emisiones, rutas de temporada baja y tecnología para minimizar el impacto de cada desplazamiento.',
              },
              {
                icon: 'bi-globe2',
                titulo: 'Mirada global, acción local',
                texto: 'Conectamos viajeros de todo el mundo con experiencias únicas que refuerzan identidades locales y preservan patrimonios en peligro.',
              },
            ].map((v) => (
              <div key={v.titulo} className="col-12 col-sm-6 col-lg-4">
                <div className="valor-card">
                  <div className="valor-icon">
                    <i className={`bi ${v.icon}`}></i>
                  </div>
                  <h3>{v.titulo}</h3>
                  <p>{v.texto}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="historia-section">
        <div className="container">
          <div className="row g-5 align-items-center">
            <div className="col-12 col-lg-5">
              <div className="historia-img">
                <img src={assetPath('img/conocenos/mochila-deskpot.webp')} alt="Raíces de nuestro proyecto" />
              </div>
            </div>

            <div className="col-12 col-lg-7">
              <h3 className="section-label historia-label">Cómo llegamos aquí</h3>
              <h2 className="section-title historia-title">Nuestra historia</h2>

              <div className="timeline">
                {[
                  {
                    year: '2025 - El inicio',
                    titulo: 'Una mochila y una pregunta',
                    texto: 'Todo comenzó con una viajera que, tras recorrer cinco países, se preguntó: ¿por qué mis viajes dejan solo huellas de carbono y no de cambio positivo?',
                  },
                  {
                    year: '2026 - El lanzamiento',
                    titulo: 'Raíces Viajeras nace online',
                    texto: 'Lanzamos nuestra plataforma digital con los primeros 15 itinerarios verificados y la promesa de compensar el 100 % de las emisiones de cada viaje.',
                  },
                  {
                    year: '2025-2026 - Hoy',
                    titulo: 'Crecemos contigo',
                    texto: 'Más de 20 destinos, cientos de viajeros conscientes y un compromiso renovado: cada ruta que añadimos es una comunidad que apoyamos.',
                  },
                ].map((item) => (
                  <div key={item.year} className="timeline-item">
                    <div className="timeline-dot"></div>
                    <p className="timeline-year">{item.year}</p>
                    <h4>{item.titulo}</h4>
                    <p>{item.texto}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="equipo-section">
        <div className="container">
          <div className="text-center mb-5">
            <p className="section-label">Las personas detrás del viaje</p>
            <h2 className="section-title mb-0">Nuestro equipo</h2>
          </div>
          <div className="row justify-content-center g-4">
            {[
              {
                inicial: 'A',
                clase: 'avatar-ana',
                nombre: 'Ana López',
                rol: 'Fundadora & CEO',
                texto: 'Bióloga de formación y viajera de vocación. Diseña cada ruta pensando en el equilibrio entre experiencia humana e impacto ambiental.',
              },
              {
                inicial: 'M',
                clase: 'avatar-manuel',
                nombre: 'Manuel Moreno',
                rol: 'Experiencia de Viajero',
                texto: 'Ex guía de montaña reconvertido en diseñador de experiencias. Cuida que cada momento del viaje sea memorable y sin rastro.',
              },
              {
                inicial: 'M',
                clase: 'avatar-monica',
                nombre: 'Mónica Cortés',
                rol: 'Responsable de Sostenibilidad',
                texto: 'Experta en certificaciones ambientales y análisis de ciclo de vida. Audita y mejora la huella de cada viaje que ofrecemos.',
              },
            ].map((p) => (
              <div key={p.nombre} className="col-12 col-sm-6 col-lg-3">
                <div className="equipo-card">
                  <div className={`equipo-avatar ${p.clase}`}>{p.inicial}</div>
                  <h3>{p.nombre}</h3>
                  <p className="role">{p.rol}</p>
                  <p>{p.texto}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="compromiso-section">
        <div className="container">
          <div className="row g-5 align-items-center">
            <div className="col-12 col-lg-7">
              <p className="section-label compromiso-label">Lo que prometemos</p>
              <h2 className="section-title compromiso-title">
                Nuestro compromiso contigo
                <br />
                y con el planeta
              </h2>
              {[
                {
                  num: 1,
                  titulo: 'Verificación independiente',
                  texto: 'Todos nuestros alojamientos y proveedores pasan una auditoría anual realizada por organismos externos especializados en turismo responsable.',
                },
                {
                  num: 2,
                  titulo: 'Compensación certificada de CO2',
                  texto: 'Calculamos la huella de cada viaje y la compensamos mediante proyectos de reforestación y energías renovables en los propios destinos visitados.',
                },
                {
                  num: 3,
                  titulo: 'Fondo de impacto local',
                  texto: 'El 5 % de cada reserva se destina a un fondo que financia proyectos educativos, de conservación y de desarrollo en las comunidades anfitrionas.',
                },
                {
                  num: 4,
                  titulo: 'Garantía de satisfacción responsable',
                  texto: 'Si algo no cumple nuestros estándares de sostenibilidad durante tu viaje, actuamos de inmediato y publicamos el incidente en nuestro informe anual.',
                },
              ].map((c) => (
                <div key={c.num} className="compromiso-item">
                  <div className="compromiso-num">{c.num}</div>
                  <div>
                    <h3>{c.titulo}</h3>
                    <p>{c.texto}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="col-12 col-lg-5">
              <div className="compromiso-badge">
                <AnimatedNumber target={95} suffix="%" />
                <p>de nuestros viajeros repetiría con nosotros</p>
              </div>
              <div className="badge-grid">
                <div className="compromiso-badge badge-sm">
                  <AnimatedNumber prefix="+" target={1200} duration={2000} />
                  <p>árboles plantados en 2025</p>
                </div>
                <div className="compromiso-badge badge-sm">
                  <AnimatedNumber prefix="+" target={40} />
                  <p>comunidades beneficiadas</p>
                </div>
                <div className="compromiso-badge badge-sm badge-full">
                  <AnimatedNumber target={100} suffix="%" />
                  <p>proveedores con energía renovable o certificada</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container cta-inner">
          <h2>¿Listo para viajar de otra manera?</h2>
          <p>
            Únete a nuestra comunidad de viajeros conscientes y descubre destinos que te
            transformarán sin dañar el mundo que los hace posibles.
          </p>
          <Link to={APP_PATHS.provincias} className="btn-cta-blanco">
            Ver destinos
          </Link>
          <a href={buildRegisterUrl(APP_PATHS.home)} className="btn-cta-outline-blanco">
            Crear cuenta gratis
          </a>
        </div>
        <div className="container btn-back">
          <button className="back-btn" type="button" onClick={handleVolver}>
            Volver
          </button>
        </div>
      </section>
    </>
  )
}