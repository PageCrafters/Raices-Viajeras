import { useEffect, useState, useRef } from 'react';
import { apiFetch } from '../../api/adminApi';
import { useImagePreview } from '../../hooks/useImagenPreview';
import { ImagenPreview } from '../ui';

const VACIO = { id: '', titulo: '', descripcion: '', origen: '', provincia_id: '', fecha_inicio: '', fecha_fin: '', precio: '', plazas: '' };

/**
 * @param {{
 *   abierto: boolean,
 *   viajeId: number|null,
 *   obtenerDetalle: (id: number) => Promise<object>,
 *   onGuardar: (campos: object, imagen: File|null, imagenMovil: File|null) => Promise<void>,
 *   onCerrar: () => void
 * }} props
 */
export default function ModalViaje({ abierto, viajeId, obtenerDetalle, onGuardar, onCerrar }) {
    const [campos, setCampos] = useState(VACIO);
    const [provincias, setProvincias] = useState([]);
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
                const [provs, detalle] = await Promise.all([
                    apiFetch({ accion: 'provincias' }),
                    viajeId ? obtenerDetalle(viajeId) : Promise.resolve(null),
                ]);
                setProvincias(provs);

                if (detalle) {
                    setCampos({ id: detalle.id, titulo: detalle.titulo, descripcion: detalle.descripcion || '', origen: detalle.origen || '', provincia_id: detalle.provincia_id || '', fecha_inicio: detalle.fecha_inicio || '', fecha_fin: detalle.fecha_fin || '', precio: detalle.precio || '', plazas: detalle.plazas || '' });
                    preview.setRemoteUrl(detalle.imagen_preview || null);
                    previewMovil.setRemoteUrl(detalle.imagen_movil_preview || null);
                } else {
                    setCampos(VACIO);
                    preview.clearPreview();
                    previewMovil.clearPreview();
                }

                if (imagenRef.current) imagenRef.current.value = '';
                if (imagenMovilRef.current) imagenMovilRef.current.value = '';
            } catch (err) {
                setError('Error al cargar el formulario');
            } finally {
                setCargando(false);
            }
        };

        cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [abierto, viajeId]);

    const set = (field) => (e) => setCampos((prev) => ({ ...prev, [field]: e.target.value }));

    const handleGuardar = async () => {
        setGuardando(true);
        setError(null);
        try {
            const imagen = imagenRef.current?.files?.[0] || null;
            const imagenMovil = imagenMovilRef.current?.files?.[0] || null;
            await onGuardar(campos, imagen, imagenMovil);
        } catch {
            setError('Error al guardar el viaje');
        } finally {
            setGuardando(false);
        }
    };

    if (!abierto) return null;

    const isEditing = Boolean(viajeId);
    const helpText = isEditing
        ? 'Si no subes una imagen nueva, se mantiene la que ya tiene el viaje.'
        : 'La imagen es opcional.';
    const helpTextMovil = isEditing
        ? 'Si no subes una imagen nueva, se mantiene la imagen móvil actual.'
        : 'La imagen móvil es opcional.';

    return (
        <>
            <div className="modal-backdrop fade show"></div>
            <div className="modal fade show d-block" tabIndex="-1" role="dialog">
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header bg-success text-white">
                            <h6 className="modal-title">{isEditing ? 'Editar viaje' : 'Nuevo viaje'}</h6>
                            <button type="button" className="btn-close btn-close-white" aria-label="Cerrar" onClick={onCerrar}></button>
                        </div>
                        <div className="modal-body">
                            {cargando && <div className="text-center py-4"><div className="spinner-border text-success"></div></div>}
                            {error && <div className="alert alert-danger py-2">{error}</div>}
                            {!cargando && (
                                <div className="row g-3">
                                    <div className="col-12">
                                        <label className="form-label fw-semibold">Título</label>
                                        <input type="text" className="form-control" value={campos.titulo} onChange={set('titulo')} />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label fw-semibold">Descripción</label>
                                        <textarea className="form-control" rows="3" value={campos.descripcion} onChange={set('descripcion')}></textarea>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">Origen</label>
                                        <input type="text" className="form-control" value={campos.origen} onChange={set('origen')} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">Provincia</label>
                                        <select className="form-select" value={campos.provincia_id} onChange={set('provincia_id')}>
                                            <option value="">Selecciona una provincia</option>
                                            {provincias.map((p) => (
                                                <option key={p.id} value={p.id}>{p.nombre}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">Fecha inicio</label>
                                        <input type="date" className="form-control" value={campos.fecha_inicio} onChange={set('fecha_inicio')} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">Fecha fin</label>
                                        <input type="date" className="form-control" value={campos.fecha_fin} onChange={set('fecha_fin')} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">Precio (€)</label>
                                        <input type="number" className="form-control" step="0.01" value={campos.precio} onChange={set('precio')} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">Plazas</label>
                                        <input type="number" className="form-control" value={campos.plazas} onChange={set('plazas')} />
                                    </div>
                                    <div className="col-12 col-lg-6">
                                        <label className="form-label fw-semibold">Imagen del viaje</label>
                                        <input type="file" className="form-control" accept="image/*" ref={imagenRef} onChange={(e) => preview.handleFileChange(e.target.files?.[0] || null)} />
                                        <p className="small text-muted mt-2 mb-2">{helpText}</p>
                                        <ImagenPreview url={preview.previewUrl} alt="Previsualización imagen del viaje" />
                                    </div>
                                    <div className="col-12 col-lg-6">
                                        <label className="form-label fw-semibold">Imagen móvil del viaje</label>
                                        <input type="file" className="form-control" accept="image/*" ref={imagenMovilRef} onChange={(e) => previewMovil.handleFileChange(e.target.files?.[0] || null)} />
                                        <p className="small text-muted mt-2 mb-2">{helpTextMovil}</p>
                                        <ImagenPreview url={previewMovil.previewUrl} alt="Previsualización imagen móvil del viaje" />
                                    </div>
                                </div>
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