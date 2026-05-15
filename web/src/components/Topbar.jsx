const TITULOS = {
    dashboard: 'Dashboard',
    usuarios: 'Usuarios',
    viajes: 'Productos / Viajes',
    categorias: 'Categorías',
    pedidos: 'Pedidos',
};

/**
 * Barra superior del panel.
 *
 * @param {{ seccionActiva: string, onToggleSidebar: () => void }} props
 */
export default function Topbar({ seccionActiva, onToggleSidebar }) {
    return (
        <div className="bg-white border-bottom px-4 py-2 d-flex align-items-center justify-content-between sticky-top shadow-sm">
            <div className="d-flex align-items-center gap-3">
                <button
                    className="btn btn-sm btn-outline-secondary d-lg-none"
                    aria-label="Abrir menú lateral"
                    onClick={onToggleSidebar}
                >
                    <i className="bi bi-list fs-5"></i>
                </button>
                <h6 className="mb-0 fw-semibold">{TITULOS[seccionActiva] || seccionActiva}</h6>
            </div>
            <div className="d-flex align-items-center gap-2">
                <a href="/Raices-Viajeras/index.html" className="btn btn-sm btn-outline-success">
                    <i className="bi bi-house me-1"></i>Volver al inicio
                </a>
                <div
                    className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center fw-bold"
                    style={{ width: 32, height: 32, fontSize: '.8rem' }}
                >
                    A
                </div>
                <span className="d-none d-sm-inline small">Admin</span>
            </div>
        </div>
    );
}