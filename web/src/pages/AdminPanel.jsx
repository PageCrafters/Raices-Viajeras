import { useState, useEffect } from 'react';
import Sidebar from '../components/Siderbar'
import Topbar from '../components/Topbar';
import Dashboard from '../components/sections/Dashboard';
import UsuariosSection from '../components/sections/UsuariosSecction';
import ViajesSection from '../components/sections/ViajesSecction';
import CategoriasSection from '../components/sections/CategoriaSecction';
import PedidosSection from '../components/sections/PedidoSecction';

export default function AdminPanel() {
    const [seccion, setSeccion] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 992);

    // Responsive: ajusta sidebar al cambiar tamaño de ventana
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 992) {
                setSidebarOpen(true);
            } else {
                setSidebarOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleNavegar = (key) => {
        setSeccion(key);
        // En móvil, cierra la sidebar al navegar
        if (window.innerWidth < 992) setSidebarOpen(false);
    };

    // La vista cambia de layout segun el ancho actual; en escritorio la sidebar queda fija.
    const isDesktop = window.innerWidth >= 992;

    return (
        <div className="d-flex">
            {/* Overlay móvil */}
            {sidebarOpen && !isDesktop && (
                <div
                    className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
                    style={{ zIndex: 999 }}
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            <Sidebar
                seccionActiva={seccion}
                onNavegar={handleNavegar}
                sidebarOpen={sidebarOpen}
            />

            <div
                className="flex-grow-1"
                style={{
                    marginLeft: isDesktop ? '260px' : '0',
                    transition: 'margin .3s',
                }}
            >
                <Topbar
                    seccionActiva={seccion}
                    onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
                />

                <div className="p-3 p-md-4">
                    {seccion === 'dashboard'   && <Dashboard onVerPedidos={() => handleNavegar('pedidos')} />}
                    {seccion === 'usuarios'    && <UsuariosSection />}
                    {seccion === 'viajes'      && <ViajesSection />}
                    {seccion === 'categorias'  && <CategoriasSection />}
                    {seccion === 'pedidos'     && <PedidosSection />}
                </div>
            </div>
        </div>
    );
}
