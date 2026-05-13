import AmbientPlayer from '../components/AmbientalSound';

const GALERIA_DERECHA = [
    { src: '/web/img/landing1.webp', alt: '' },
    { src: '/web/img/landing4.webp', alt: '' },
    { src: '/web/img/landing5.webp', alt: '' },
    { src: '/web/img/landing6.webp', alt: '' },
];

const GALERIA_IZQUIERDA = [
    { src: '/web/img/landing2.webp', alt: '' },
    { src: '/web/img/landing3.webp', alt: '' },
    { src: '/web/img/landing7.webp', alt: '' },
    { src: '/web/img/landing8.webp', alt: '' },
];

const BENEFICIOS = [
    'Alojamientos rurales sostenibles',
    'Uso de energías renovables en alojamientos',
    'Actividades respetuosas con el medio ambiente',
    'Apoyo a comunidades locales',
    'Gastronomía con productos locales y de temporada',
    'Autobuses ecológicos',
    'Educación ambiental para viajeros',
    'Compensación de huella de carbono',
];

function GaleriaGrid({ imagenes }) {
    return (
        <div className="row g-2 galeria" aria-hidden="true">
            {imagenes.map((img, i) => (
                <div className="col-6" key={i}>
                    <img src={img.src} alt={img.alt} role="presentation" />
                </div>
            ))}
        </div>
    );
}

export default function HomePage() {
    return (
        <main id="contenido-principal">
            <a href="#contenido-principal" className="visually-hidden-focusable">
                Saltar al contenido principal
            </a>

            <div className="container-fluid">

                {/* ── Sección Hero ── */}
                <section className="encabezado" aria-labelledby="titulo-hero">
                    <div className="row align-items-center">
                        <div className="col-12 col-lg-7">
                            <h1 id="titulo-hero" className="display-6">
                                Cada Viaje con Nosotros deja
                                <br />
                                <em>Huella en tu Memoria no en el Planeta</em>
                            </h1>

                            <p className="lead">
                                Viajes sostenibles, alojamientos con energía renovable y
                                experiencias que apoyan a comunidades locales.
                            </p>

                            <div className="mt-3">
                                <a
                                    href="/"
                                    className="btn btn-primario me-2"
                                >
                                    Apúntate hoy
                                </a>
                                <a
                                    href="/conocenos"
                                    className="btn btn-primario-outline"
                                >
                                    Conócenos
                                </a>
                            </div>
                        </div>

                        <div className="col-12 col-lg-5 d-none d-lg-block" aria-hidden="true">
                            <GaleriaGrid imagenes={GALERIA_DERECHA} />
                        </div>
                    </div>
                </section>

                {/* ── Sección Beneficios ── */}
                <section id="beneficios" className="encabezado" aria-labelledby="titulo-beneficios">
                    <div className="row align-items-center">
                        <div className="col-12 col-lg-5 d-none d-lg-block" aria-hidden="true">
                            <GaleriaGrid imagenes={GALERIA_IZQUIERDA} />
                        </div>

                        <div className="col-12 col-lg-7">
                            <h2 id="titulo-beneficios">
                                ¿Sabías que tu escapada de FIN DE SEMANA consume la misma
                                energía que 3 FAMILIAS en UN AÑO entero?
                            </h2>

                            <ul
                                className="lista-beneficios"
                                aria-label="Nuestros compromisos sostenibles"
                            >
                                {BENEFICIOS.map((b) => (
                                    <li key={b}>{b}</li>
                                ))}
                            </ul>

                            <p>
                                Viajar con nosotros no solo es descubrir nuevos destinos, es
                                cuidar de ellos mientras lo haces.
                            </p>
                        </div>
                    </div>
                </section>

                <div className="encabezado pt-0" aria-label="Reproductor de sonidos ambientales">
                    <AmbientPlayer />
                </div>

            </div>
        </main>
    );
}