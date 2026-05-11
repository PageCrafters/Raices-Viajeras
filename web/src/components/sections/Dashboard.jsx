import { useEffect } from 'react';
import { useDashboard } from '../hooks/useDashboard';
import { BadgeEstado, FilaCargando, FilaError, FilaVacia } from './ui';

const STATS = [
    { key: 'usuarios',       label: 'Usuarios',         icon: 'bi-people-fill',      bg: 'bg-success bg-opacity-10 text-success' },
    { key: 'viajes',         label: 'Viajes',            icon: 'bi-map-fill',         bg: 'bg-primary bg-opacity-10 text-primary' },
    { key: 'pedidos',        label: 'Pedidos',           icon: 'bi-bag-fill',         bg: 'bg-warning bg-opacity-10 text-warning' },
    { key: 'provincias',     label: 'Provincias',        icon: 'bi-geo-alt-fill',     bg: '', style: { background: '#f3e8fd', color: '#7c3aed' } },
    { key: 'entradasTotales',label: 'Entradas totales',  icon: 'bi-bar-chart-line-fill', bg: '', style: { background: '#e8f5fe', color: '#0f5fa8' } },
];

/**
 * @param {{ onVerPedidos: () => void }} props
 */
export default function Dashboard({ onVerPedidos }) {
    const { stats, ultimosPedidos, loading, error, cargar } = useDashboard();

    useEffect(() => {
        cargar();
    }, [cargar]);

    return (
        <>
            {/* Métricas */}
            <div className="row g-3 mb-4">
                {STATS.map((s) => (
                    <div key={s.key} className="col-6 col-xl-3">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-body d-flex align-items-center gap-3">
                                <div
                                    className={`rounded-3 d-flex align-items-center justify-content-center flex-shrink-0 ${s.bg}`}
                                    style={{ width: 48, height: 48, fontSize: '1.3rem', ...(s.style || {}) }}
                                >
                                    <i className={`bi ${s.icon}`}></i>
                                </div>
                                <div>
                                    <h3 className="mb-0 fw-bold">
                                        {loading ? <span className="spinner-border spinner-border-sm text-success"></span> : (stats?.[s.key] ?? '-')}
                                    </h3>
                                    <p className="mb-0 text-muted small">{s.label}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Últimos pedidos */}
            <div className="card border-0 shadow-sm">
                <div className="card-header bg-white d-flex align-items-center justify-content-between">
                    <h6 className="mb-0 fw-semibold">
                        <i className="bi bi-clock-history me-2"></i>Últimos pedidos
                    </h6>
                    <button className="btn btn-sm btn-outline-success" onClick={onVerPedidos}>
                        Ver todos
                    </button>
                </div>
                <div className="table-responsive">
                    <table className="table table-hover mb-0 align-middle">
                        <thead className="table-light">
                            <tr>
                                {['#', 'Usuario', 'Total', 'Estado', 'Fecha'].map((h) => (
                                    <th key={h} className="small text-uppercase text-muted fw-semibold ps-3">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading && <FilaCargando cols={5} />}
                            {error && <FilaError cols={5} />}
                            {!loading && !error && ultimosPedidos.length === 0 && <FilaVacia cols={5} mensaje="Sin pedidos" />}
                            {!loading && !error && ultimosPedidos.map((p) => (
                                <tr key={p.id}>
                                    <td className="ps-3">#{p.id}</td>
                                    <td>{p.usuario_id}</td>
                                    <td>{parseFloat(p.total).toFixed(2)} EUR</td>
                                    <td><BadgeEstado estado={p.estado} /></td>
                                    <td>{p.fecha_pedido?.split(' ')[0] || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}