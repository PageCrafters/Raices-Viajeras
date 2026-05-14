const NAV_ITEMS = [
    { key: 'dashboard', icon: 'bi-speedometer2', label: 'Dashboard', grupo: 'Principal' },
    { key: 'usuarios',  icon: 'bi-people',        label: 'Usuarios',           grupo: 'Gestión' },
    { key: 'viajes',    icon: 'bi-map',            label: 'Productos / Viajes', grupo: 'Gestión' },
    { key: 'categorias',icon: 'bi-tag',            label: 'Categorías',         grupo: 'Gestión' },
    { key: 'pedidos',   icon: 'bi-bag',            label: 'Pedidos',            grupo: 'Gestión' },
];

/**
 * Sidebar del panel de administración.
 *
 * @param {{ seccionActiva: string, onNavegar: (key: string) => void, sidebarOpen: boolean }} props
 */
export default function Sidebar({ seccionActiva, onNavegar, sidebarOpen }) {
    const grupos = [...new Set(NAV_ITEMS.map((i) => i.grupo))];

    const sidebarStyle = {
        width: '260px',
        zIndex: 1000,
        transition: 'transform .3s',
        transform: sidebarOpen ? 'translateX(0)' : undefined,
    };

    return (
        <nav
            id="sidebar"
            className="bg-success text-white flex-shrink-0 d-flex flex-column position-fixed top-0 start-0 vh-100"
            style={sidebarStyle}
        >
            <div className="px-3 py-3 border-bottom border-white border-opacity-25">
                <h6 className="fw-bold mb-0">
                    <i className="bi bi-compass me-2"></i>Raíces Viajeras
                </h6>
                <small className="text-white-50">Panel de Administración</small>
            </div>

            <div className="flex-grow-1 pt-2">
                {grupos.map((grupo) => (
                    <div key={grupo}>
                        <small
                            className="text-white-50 text-uppercase px-3 d-block mb-1 fw-semibold mt-3"
                            style={{ fontSize: '.7rem', letterSpacing: '.08em' }}
                        >
                            {grupo}
                        </small>
                        {NAV_ITEMS.filter((i) => i.grupo === grupo).map((item) => (
                            <a
                                key={item.key}
                                className={`d-flex align-items-center gap-2 px-3 py-2 mx-2 rounded text-white text-decoration-none${seccionActiva === item.key ? ' bg-white bg-opacity-25' : ''}`}
                                style={{ cursor: 'pointer' }}
                                onClick={() => onNavegar(item.key)}
                            >
                                <i className={`bi ${item.icon}`}></i> {item.label}
                            </a>
                        ))}
                    </div>
                ))}
            </div>

            <div className="px-3 py-2 border-top border-white border-opacity-25">
                <small className="text-white-50">v1.0 · Raíces Viajeras</small>
            </div>
        </nav>
    );
}