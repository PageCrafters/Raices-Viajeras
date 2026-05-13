import { useState, useEffect } from 'react';

const ESTADOS = ['pendiente', 'procesando', 'completado', 'cancelado'];

/**
 * @param {{
 *   abierto: boolean,
 *   estadoActual: string,
 *   onGuardar: (nuevoEstado: string) => Promise<void>,
 *   onCerrar: () => void
 * }} props
 */
export default function ModalEstadoPedido({ abierto, estadoActual, onGuardar, onCerrar }) {
    const [estado, setEstado] = useState(estadoActual);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (abierto) {
            setEstado(estadoActual);
            setError(null);
        }
    }, [abierto, estadoActual]);

    const handleGuardar = async () => {
        setGuardando(true);
        setError(null);
        try {
            await onGuardar(estado);
        } catch {
            setError('Error al actualizar el estado');
        } finally {
            setGuardando(false);
        }
    };

    if (!abierto) return null;

    return (
        <>
            <div className="modal-backdrop fade show"></div>
            <div className="modal fade show d-block" tabIndex="-1" role="dialog">
                <div className="modal-dialog modal-sm">
                    <div className="modal-content">
                        <div className="modal-header bg-success text-white">
                            <h6 className="modal-title">Cambiar estado del pedido</h6>
                            <button type="button" className="btn-close btn-close-white" aria-label="Cerrar" onClick={onCerrar}></button>
                        </div>
                        <div className="modal-body">
                            {error && <div className="alert alert-danger py-2 mb-3">{error}</div>}
                            <label className="form-label fw-semibold">Estado</label>
                            <select className="form-select" value={estado} onChange={(e) => setEstado(e.target.value)}>
                                {ESTADOS.map((e) => (
                                    <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>
                                ))}
                            </select>
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