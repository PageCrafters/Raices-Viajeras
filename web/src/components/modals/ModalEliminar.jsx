/**
 * Modal de confirmación de eliminación.
 * No usa bootstrap.Modal JS — controlado 100% por React.
 *
 * @param {{ abierto: boolean, onConfirmar: () => void, onCerrar: () => void }} props
 */
export default function ModalEliminar({ abierto, onConfirmar, onCerrar }) {
    if (!abierto) return null;

    return (
        <>
            <div className="modal-backdrop fade show"></div>
            <div className="modal fade show d-block" tabIndex="-1" role="dialog">
                <div className="modal-dialog modal-sm">
                    <div className="modal-content">
                        <div className="modal-header bg-success text-white">
                            <h6 className="modal-title">Confirmar eliminación</h6>
                            <button type="button" className="btn-close btn-close-white" aria-label="Cerrar" onClick={onCerrar}></button>
                        </div>
                        <div className="modal-body">
                            <p className="mb-0">¿Estás seguro de que quieres eliminar este registro?</p>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-sm btn-secondary" onClick={onCerrar}>Cancelar</button>
                            <button type="button" className="btn btn-sm btn-danger" onClick={onConfirmar}>Eliminar</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}