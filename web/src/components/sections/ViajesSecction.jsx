import { useEffect, useState } from 'react';
import { useViajes } from '../../hooks/useViajes';
import { BuscadorTabla, FilaCargando, FilaError, FilaVacia, ThumbImagen } from '../ui';
import ModalViaje from '../modals/ModalViaje';
import ModalEliminar from '../modals/ModalEliminar';

export default function ViajesSection() {
    const { viajes, loading, error, cargar, obtenerDetalle, guardar, eliminar } = useViajes();
    const [modalViaje, setModalViaje] = useState({ abierto: false, id: null });
    const [modalEliminar, setModalEliminar] = useState({ abierto: false, id: null });

    useEffect(() => { cargar(); }, [cargar]);

    const handleGuardar = async (campos, imagen, imagenMovil) => {
        await guardar(campos, imagen, imagenMovil);
        setModalViaje({ abierto: false, id: null });
    };

    const handleEliminar = async () => {
        await eliminar(modalEliminar.id);
        setModalEliminar({ abierto: false, id: null });
    };

    return (
        <>
            <div className="card border-0 shadow-sm">
                <div className="card-header bg-white d-flex align-items-center justify-content-between flex-wrap gap-2">
                    <h6 className="mb-0 fw-semibold"><i className="bi bi-map me-2"></i>Viajes</h6>
                    <div className="d-flex gap-2">
                        <BuscadorTabla tablaId="tabla-viajes" />
                        <button
                            className="btn btn-success btn-sm"
                            onClick={() => setModalViaje({ abierto: true, id: null })}
                        >
                            <i className="bi bi-plus-lg me-1"></i>Nuevo
                        </button>
                    </div>
                </div>
                <div className="table-responsive">
                    <table className="table table-hover mb-0 align-middle">
                        <thead className="table-light">
                            <tr>
                                {['#', 'Título', 'Imagen', 'Origen', 'Fecha inicio', 'Precio', 'Plazas', 'Acciones'].map((h) => (
                                    <th key={h} className="small text-uppercase text-muted fw-semibold ps-3">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody id="tabla-viajes">
                            {loading && <FilaCargando cols={8} />}
                            {error && <FilaError cols={8} />}
                            {!loading && !error && viajes.length === 0 && <FilaVacia cols={8} mensaje="Sin viajes" />}
                            {!loading && !error && viajes.map((v) => (
                                <tr key={v.id}>
                                    <td className="ps-3">{v.id}</td>
                                    <td>{v.titulo}</td>
                                    <td><ThumbImagen src={v.imagen_preview} alt={`Imagen de ${v.titulo}`} /></td>
                                    <td>{v.origen || '-'}</td>
                                    <td>{v.fecha_inicio || '-'}</td>
                                    <td>{parseFloat(v.precio).toFixed(2)} EUR</td>
                                    <td>{v.plazas}</td>
                                    <td>
                                        <div className="d-flex gap-1">
                                            <button
                                                className="btn btn-warning btn-sm"
                                                onClick={() => setModalViaje({ abierto: true, id: v.id })}
                                            >
                                                <i className="bi bi-pencil"></i>
                                            </button>
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() => setModalEliminar({ abierto: true, id: v.id })}
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

            <ModalViaje
                abierto={modalViaje.abierto}
                viajeId={modalViaje.id}
                obtenerDetalle={obtenerDetalle}
                onGuardar={handleGuardar}
                onCerrar={() => setModalViaje({ abierto: false, id: null })}
            />

            <ModalEliminar
                abierto={modalEliminar.abierto}
                onConfirmar={handleEliminar}
                onCerrar={() => setModalEliminar({ abierto: false, id: null })}
            />
        </>
    );
}