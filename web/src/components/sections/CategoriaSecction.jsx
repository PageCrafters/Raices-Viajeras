import { useEffect, useState } from 'react';
import { useCategorias } from '../../hooks/useCategorias';
import { BuscadorTabla, FilaCargando, FilaError, FilaVacia, ThumbImagen } from '../ui';
import ModalCategoria from '../modals/ModalCategoria';
import ModalEliminar from '../modals/ModalEliminar';

export default function CategoriasSection() {
    const { categorias, loading, error, cargar, obtenerDetalle, guardar, eliminar } = useCategorias();
    const [modalCategoria, setModalCategoria] = useState({ abierto: false, id: null });
    const [modalEliminar, setModalEliminar] = useState({ abierto: false, id: null });

    useEffect(() => { cargar(); }, [cargar]);

    const handleGuardar = async (campos, imagen, imagenMovil) => {
        await guardar(campos, imagen, imagenMovil);
        setModalCategoria({ abierto: false, id: null });
    };

    const handleEliminar = async () => {
        await eliminar(modalEliminar.id);
        setModalEliminar({ abierto: false, id: null });
    };

    return (
        <>
            <div className="card border-0 shadow-sm">
                <div className="card-header bg-white d-flex align-items-center justify-content-between flex-wrap gap-2">
                    <h6 className="mb-0 fw-semibold"><i className="bi bi-tag me-2"></i>Categorías / Provincias</h6>
                    <div className="d-flex gap-2">
                        <BuscadorTabla tablaId="tabla-categorias" />
                        <button
                            className="btn btn-success btn-sm"
                            onClick={() => setModalCategoria({ abierto: true, id: null })}
                        >
                            <i className="bi bi-plus-lg me-1"></i>Nueva
                        </button>
                    </div>
                </div>
                <div className="table-responsive">
                    <table className="table table-hover mb-0 align-middle">
                        <thead className="table-light">
                            <tr>
                                {['#', 'Nombre', 'Descripción', 'Imagen', 'Creado', 'Acciones'].map((h) => (
                                    <th key={h} className="small text-uppercase text-muted fw-semibold ps-3">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody id="tabla-categorias">
                            {loading && <FilaCargando cols={6} />}
                            {error && <FilaError cols={6} />}
                            {!loading && !error && categorias.length === 0 && <FilaVacia cols={6} mensaje="Sin categorías" />}
                            {!loading && !error && categorias.map((c) => (
                                <tr key={c.id}>
                                    <td className="ps-3">{c.id}</td>
                                    <td>{c.nombre}</td>
                                    <td className="text-muted small">
                                        {c.descripcion ? `${c.descripcion.substring(0, 60)}...` : '-'}
                                    </td>
                                    <td><ThumbImagen src={c.imagen_preview} alt={`Imagen de ${c.nombre}`} /></td>
                                    <td>{c.created_at?.split(' ')[0] || '-'}</td>
                                    <td>
                                        <div className="d-flex gap-1">
                                            <button
                                                className="btn btn-warning btn-sm"
                                                onClick={() => setModalCategoria({ abierto: true, id: c.id })}
                                            >
                                                <i className="bi bi-pencil"></i>
                                            </button>
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() => setModalEliminar({ abierto: true, id: c.id })}
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

            <ModalCategoria
                abierto={modalCategoria.abierto}
                categoriaId={modalCategoria.id}
                obtenerDetalle={obtenerDetalle}
                onGuardar={handleGuardar}
                onCerrar={() => setModalCategoria({ abierto: false, id: null })}
            />

            <ModalEliminar
                abierto={modalEliminar.abierto}
                onConfirmar={handleEliminar}
                onCerrar={() => setModalEliminar({ abierto: false, id: null })}
            />
        </>
    );
}