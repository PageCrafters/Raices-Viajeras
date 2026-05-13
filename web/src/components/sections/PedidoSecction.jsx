import { useEffect, useState } from 'react';
import { usePedidos } from '../../hooks/usePedidos';
import { BadgeEstado, BuscadorTabla, FilaCargando, FilaError, FilaVacia } from '../ui';
import ModalEstadoPedido from '../modals/ModalEstadoPedido';
import ModalEliminar from '../modals/ModalEliminar';

export default function PedidosSection() {
    const { pedidos, loading, error, cargar, actualizarEstado, eliminar } = usePedidos();
    const [filtroEstado, setFiltroEstado] = useState('');
    const [modalEstado, setModalEstado] = useState({ abierto: false, id: null, estadoActual: '' });
    const [modalEliminar, setModalEliminar] = useState({ abierto: false, id: null });

    useEffect(() => { cargar(filtroEstado); }, [cargar, filtroEstado]);

    const handleGuardarEstado = async (nuevoEstado) => {
        await actualizarEstado(modalEstado.id, nuevoEstado);
        setModalEstado({ abierto: false, id: null, estadoActual: '' });
        cargar(filtroEstado);
    };

    const handleEliminar = async () => {
        await eliminar(modalEliminar.id);
        setModalEliminar({ abierto: false, id: null });
        cargar(filtroEstado);
    };

    return (
        <>
            <div className="card border-0 shadow-sm">
                <div className="card-header bg-white d-flex align-items-center justify-content-between flex-wrap gap-2">
                    <h6 className="mb-0 fw-semibold"><i className="bi bi-bag me-2"></i>Pedidos</h6>
                    <div className="d-flex gap-2 flex-wrap">
                        <select
                            className="form-select form-select-sm"
                            style={{ width: 140 }}
                            aria-label="Filtrar por estado"
                            value={filtroEstado}
                            onChange={(e) => setFiltroEstado(e.target.value)}
                        >
                            <option value="">Todos</option>
                            <option value="pendiente">Pendiente</option>
                            <option value="procesando">Procesando</option>
                            <option value="completado">Completado</option>
                            <option value="cancelado">Cancelado</option>
                        </select>
                        <BuscadorTabla tablaId="tabla-pedidos" />
                    </div>
                </div>
                <div className="table-responsive">
                    <table className="table table-hover mb-0 align-middle">
                        <thead className="table-light">
                            <tr>
                                {['#', 'Usuario ID', 'Total', 'Estado', 'Dirección', 'Fecha', 'Acciones'].map((h) => (
                                    <th key={h} className="small text-uppercase text-muted fw-semibold ps-3">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody id="tabla-pedidos">
                            {loading && <FilaCargando cols={7} />}
                            {error && <FilaError cols={7} />}
                            {!loading && !error && pedidos.length === 0 && <FilaVacia cols={7} mensaje="Sin pedidos" />}
                            {!loading && !error && pedidos.map((p) => (
                                <tr key={p.id}>
                                    <td className="ps-3">#{p.id}</td>
                                    <td>{p.usuario_id}</td>
                                    <td>{parseFloat(p.total).toFixed(2)} EUR</td>
                                    <td><BadgeEstado estado={p.estado} /></td>
                                    <td className="text-muted small">
                                        {p.direccion_envio ? `${p.direccion_envio.substring(0, 30)}...` : '-'}
                                    </td>
                                    <td>{p.fecha_pedido?.split(' ')[0] || '-'}</td>
                                    <td>
                                        <div className="d-flex gap-1">
                                            <button
                                                className="btn btn-warning btn-sm"
                                                onClick={() => setModalEstado({ abierto: true, id: p.id, estadoActual: p.estado })}
                                            >
                                                <i className="bi bi-pencil"></i>
                                            </button>
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() => setModalEliminar({ abierto: true, id: p.id })}
                                            >
                                                <i className="bi bi-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <ModalEstadoPedido
                abierto={modalEstado.abierto}
                estadoActual={modalEstado.estadoActual}
                onGuardar={handleGuardarEstado}
                onCerrar={() => setModalEstado({ abierto: false, id: null, estadoActual: '' })}
            />

            <ModalEliminar
                abierto={modalEliminar.abierto}
                onConfirmar={handleEliminar}
                onCerrar={() => setModalEliminar({ abierto: false, id: null })}
            />
        </>
    );
}