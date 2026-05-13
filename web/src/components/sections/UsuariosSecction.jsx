import { useEffect, useState } from 'react';
import { useUsuarios } from '../../hooks/useUsuarios';
import { BadgeRol, BuscadorTabla, FilaCargando, FilaError, FilaVacia } from '../ui';
import ModalUsuario from '../modals/ModalUsuario';
import ModalEliminar from '../modals/ModalEliminar';

export default function UsuariosSection() {
    const { usuarios, loading, error, cargar, guardar, eliminar } = useUsuarios();
    const [modalUsuario, setModalUsuario] = useState({ abierto: false, usuario: null });
    const [modalEliminar, setModalEliminar] = useState({ abierto: false, id: null });

    useEffect(() => { cargar(); }, [cargar]);

    const handleGuardar = async (campos) => {
        await guardar(campos);
        setModalUsuario({ abierto: false, usuario: null });
    };

    const handleEliminar = async () => {
        await eliminar(modalEliminar.id);
        setModalEliminar({ abierto: false, id: null });
    };

    return (
        <>
            <div className="card border-0 shadow-sm">
                <div className="card-header bg-white d-flex align-items-center justify-content-between flex-wrap gap-2">
                    <h6 className="mb-0 fw-semibold"><i className="bi bi-people me-2"></i>Usuarios</h6>
                    <BuscadorTabla tablaId="tabla-usuarios" />
                </div>
                <div className="table-responsive">
                    <table className="table table-hover mb-0 align-middle">
                        <thead className="table-light">
                            <tr>
                                {['#', 'Nombre', 'Correo', 'Género', 'Rol', 'Entradas', 'Acciones'].map((h) => (
                                    <th key={h} className="small text-uppercase text-muted fw-semibold ps-3">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody id="tabla-usuarios">
                            {loading && <FilaCargando cols={7} />}
                            {error && <FilaError cols={7} />}
                            {!loading && !error && usuarios.length === 0 && <FilaVacia cols={7} mensaje="Sin usuarios" />}
                            {!loading && !error && usuarios.map((u) => (
                                <tr key={u.id}>
                                    <td className="ps-3">{u.id}</td>
                                    <td>{u.nombre_completo}</td>
                                    <td>{u.correo}</td>
                                    <td>{u.genero || '-'}</td>
                                    <td><BadgeRol rol={u.rol} /></td>
                                    <td>{u.entradas_usuario ?? 0}</td>
                                    <td>
                                        <div className="d-flex gap-1">
                                            <button
                                                className="btn btn-warning btn-sm"
                                                onClick={() => setModalUsuario({ abierto: true, usuario: u })}
                                            >
                                                <i className="bi bi-pencil"></i>
                                            </button>
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() => setModalEliminar({ abierto: true, id: u.id })}
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

            <ModalUsuario
                abierto={modalUsuario.abierto}
                usuario={modalUsuario.usuario}
                onGuardar={handleGuardar}
                onCerrar={() => setModalUsuario({ abierto: false, usuario: null })}
            />

            <ModalEliminar
                abierto={modalEliminar.abierto}
                onConfirmar={handleEliminar}
                onCerrar={() => setModalEliminar({ abierto: false, id: null })}
            />
        </>
    );
}