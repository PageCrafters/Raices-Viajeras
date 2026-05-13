import { useEffect, useState, useRef } from 'react';
import { useImagePreview } from '../../hooks/useImagenPreview';
import { ImagenPreview } from '../ui';

const VACIO = { id: '', nombre: '', descripcion: '' };

/**
 * @param {{
 *   abierto: boolean,
 *   categoriaId: number|null,
 *   obtenerDetalle: (id: number) => Promise<object>,
 *   onGuardar: (campos: object, imagen: File|null, imagenMovil: File|null) => Promise<void>,
 *   onCerrar: () => void
 * }} props
 */
export default function ModalCategoria({ abierto, categoriaId, obtenerDetalle, onGuardar, onCerrar }) {
    const [campos, setCampos] = useState(VACIO);
    const [cargando, setCargando] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState(null);

    const imagenRef = useRef(null);
    const imagenMovilRef = useRef(null);
    const preview = useImagePreview();
    const previewMovil = useImagePreview();

    useEffect(() => {
        if (!abierto) return;

        const cargar = async () => {
            setCargando(true);
            setError(null);
            try {
                if (categoriaId) {
                    const detalle = await obtenerDetalle(categoriaId);
                    setCampos({ id: detalle.id, nombre: detalle.nombre, descripcion: detalle.descripcion || '' });
                    preview.setRemoteUrl(detalle.imagen_preview || null);
                    previewMovil.setRemoteUrl(detalle.imagen_movil_preview || null);
                } else {
                    setCampos(VACIO);
                    preview.clearPreview();
                    previewMovil.clearPreview();
                }
                if (imagenRef.current) imagenRef.current.value = '';
                if (imagenMovilRef.current) imagenMovilRef.current.value = '';
            } catch {
                setError('Error al cargar el formulario');
            } finally {
                setCargando(false);
            }
        };

        cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [abierto, categoriaId]);

    const set = (field) => (e) => setCampos((prev) => ({ ...prev, [field]: e.target.value }));

    const handleGuardar = async () => {
        setGuardando(true);
        setError(null);
        try {
            const imagen = imagenRef.current?.files?.[0] || null;
            const imagenMovil = imagenMovilRef.current?.files?.[0] || null;
            await onGuardar(campos, imagen, imagenMovil);
        } catch {
            setError('Error al guardar la categoría');
        } finally {
            setGuardando(false);
        }
    };

    if (!abierto) return null;

    const isEditing = Boolean(categoriaId);
    const helpText = isEditing
        ? 'Si no subes una imagen nueva, se mantiene la que ya tiene la provincia.'
        : 'La imagen es opcional.';
    const helpTextMovil = isEditing
        ? 'Si no subes una imagen nueva, se mantiene la imagen móvil actual.'
        : 'La imagen móvil es opcional.';

    return (
        <>
            <div className="modal-backdrop fade show"></div>
            <div className="modal fade show d-block" tabIndex="-1" role="dialog">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header bg-success text-white">
                            <h6 className="modal-title">{isEditing ? 'Editar categoría' : 'Nueva categoría'}</h6>
                            <button type="button" className="btn-close btn-close-white" aria-label="Cerrar" onClick={onCerrar}></button>
                        </div>
                        <div className="modal-body">
                            {cargando && <div className="text-center py-4"><div className="spinner-border text-success"></div></div>}
                            {error && <div className="alert alert-danger py-2">{error}</div>}
                            {!cargando && (
                                <>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Nombre</label>
                                        <input type="text" className="form-control" value={campos.nombre} onChange={set('nombre')} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Descripción</label>
                                        <textarea className="form-control" rows="3" value={campos.descripcion} onChange={set('descripcion')}></textarea>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Imagen de la provincia</label>
                                        <input type="file" className="form-control" accept="image/*" ref={imagenRef} onChange={(e) => preview.handleFileChange(e.target.files?.[0] || null)} />
                                        <p className="small text-muted mt-2 mb-2">{helpText}</p>
                                        <ImagenPreview url={preview.previewUrl} alt="Previsualización imagen de la provincia" />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Imagen móvil de la provincia</label>
                                        <input type="file" className="form-control" accept="image/*" ref={imagenMovilRef} onChange={(e) => previewMovil.handleFileChange(e.target.files?.[0] || null)} />
                                        <p className="small text-muted mt-2 mb-2">{helpTextMovil}</p>
                                        <ImagenPreview url={previewMovil.previewUrl} alt="Previsualización imagen móvil de la provincia" />
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-sm btn-secondary" onClick={onCerrar}>Cancelar</button>
                            <button type="button" className="btn btn-sm btn-success" onClick={handleGuardar} disabled={guardando || cargando}>
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