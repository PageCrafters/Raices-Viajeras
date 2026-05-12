import { useEffect, useState } from 'react';

const VACIO = { id: '', nombre_completo: '', correo: '', pwd: '', genero: 'o', rol: 'usuario' };

/**
 * @param {{
 *   abierto: boolean,
 *   usuario: object|null,
 *   onGuardar: (campos: object) => Promise<void>,
 *   onCerrar: () => void
 * }} props
 */
export default function ModalUsuario({ abierto, usuario, onGuardar, onCerrar }) {
    const [campos, setCampos] = useState(VACIO);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!abierto) return;
        setCampos(usuario
            ? { id: usuario.id, nombre_completo: usuario.nombre_completo, correo: usuario.correo, pwd: '', genero: usuario.genero || 'o', rol: usuario.rol || 'usuario' }
            : VACIO
        );
        setError(null);
    }, [abierto, usuario]);

    const set = (field) => (e) => setCampos((prev) => ({ ...prev, [field]: e.target.value }));

    const handleGuardar = async () => {
        setGuardando(true);
        setError(null);
        try {
            await onGuardar(campos);
        } catch (err) {
            setError('Error al guardar el usuario');
        } finally {
            setGuardando(false);
        }
    };

    if (!abierto) return null;

    return (
        <>
            <div className="modal-backdrop fade show"></div>
            <div className="modal fade show d-block" tabIndex="-1" role="dialog">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header bg-success text-white">
                            <h6 className="modal-title">{usuario ? 'Editar usuario' : 'Nuevo usuario'}</h6>
                            <button type="button" className="btn-close btn-close-white" aria-label="Cerrar" onClick={onCerrar}></button>
                        </div>
                        <div className="modal-body">
                            {error && <div className="alert alert-danger py-2">{error}</div>}
                            <div className="mb-3">
                                <label className="form-label fw-semibold">Nombre completo</label>
                                <input type="text" className="form-control" value={campos.nombre_completo} onChange={set('nombre_completo')} />
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-semibold">Correo</label>
                                <input type="email" className="form-control" value={campos.correo} onChange={set('correo')} />
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-semibold">
                                    Contraseña <small className="text-muted">(dejar vacío para no cambiar)</small>
                                </label>
                                <input type="password" className="form-control" value={campos.pwd} onChange={set('pwd')} />
                            </div>
                            <div className="row">
                                <div className="col">
                                    <label className="form-label fw-semibold">Género</label>
                                    <select className="form-select" value={campos.genero} onChange={set('genero')}>
                                        <option value="o">Otro / Prefiero no decirlo</option>
                                        <option value="m">Masculino</option>
                                        <option value="f">Femenino</option>
                                    </select>
                                </div>
                                <div className="col">
                                    <label className="form-label fw-semibold">Rol</label>
                                    <select className="form-select" value={campos.rol} onChange={set('rol')}>
                                        <option value="usuario">Usuario</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-sm btn-secondary" onClick={onCerrar}>Cancelar</button>
                            <button type="button" className="btn btn-sm btn-success" onClick={handleGuardar} disabled={guardando}>
                                {guardando ? <span className="spinner-border spinner-border-sm me-1"></span> : null}
                                Guardar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}