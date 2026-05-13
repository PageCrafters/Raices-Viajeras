/**
 * Badge de estado de pedido.
 * @param {{ estado: string }} props
 */
export function BadgeEstado({ estado }) {
    const clases = {
        pendiente:   'bg-warning text-dark',
        completado:  'bg-success text-white',
        cancelado:   'bg-danger text-white',
        procesando:  'bg-primary text-white',
    };
    return (
        <span className={`badge rounded-pill ${clases[estado] || 'bg-secondary text-white'}`}>
            {estado || '-'}
        </span>
    );
}

/**
 * Badge de rol de usuario.
 * @param {{ rol: string }} props
 */
export function BadgeRol({ rol }) {
    return rol === 'admin'
        ? <span className="badge rounded-pill bg-success">Admin</span>
        : <span className="badge rounded-pill bg-secondary">Usuario</span>;
}

/**
 * Fila de carga con spinner.
 * @param {{ cols: number }} props
 */
export function FilaCargando({ cols }) {
    return (
        <tr>
            <td colSpan={cols} className="text-center py-4">
                <div className="spinner-border spinner-border-sm text-success"></div>
            </td>
        </tr>
    );
}

/**
 * Fila de error.
 * @param {{ cols: number }} props
 */
export function FilaError({ cols }) {
    return (
        <tr>
            <td colSpan={cols} className="text-center text-danger py-3">Error al cargar</td>
        </tr>
    );
}

/**
 * Fila vacía.
 * @param {{ cols: number, mensaje?: string }} props
 */
export function FilaVacia({ cols, mensaje = 'Sin resultados' }) {
    return (
        <tr>
            <td colSpan={cols} className="text-center text-muted py-3">{mensaje}</td>
        </tr>
    );
}

/**
 * Input de búsqueda que filtra filas visibles en una tabla del DOM.
 * Mantiene el mismo comportamiento que el vanilla original.
 *
 * @param {{ tablaId: string, placeholder?: string }} props
 */
export function BuscadorTabla({ tablaId, placeholder = 'Buscar...' }) {
    const handleChange = (e) => {
        const query = e.target.value.toLowerCase();
        document.querySelectorAll(`#${tablaId} tr`).forEach((row) => {
            row.style.display = row.textContent.toLowerCase().includes(query) ? '' : 'none';
        });
    };

    return (
        <input
            type="text"
            className="form-control form-control-sm"
            style={{ maxWidth: 220 }}
            placeholder={placeholder}
            onChange={handleChange}
        />
    );
}

/**
 * Miniatura de imagen de tabla.
 * @param {{ src: string|null, alt: string }} props
 */
export function ThumbImagen({ src, alt }) {
    if (!src) return <span className="badge rounded-pill bg-light text-muted border">Sin imagen</span>;
    return (
        <img
            src={src}
            alt={alt}
            className="rounded border"
            style={{ width: 56, height: 56, objectFit: 'cover' }}
        />
    );
}

/**
 * Bloque de previsualización de imagen dentro de un modal.
 * @param {{ url: string|null, alt: string }} props
 */
export function ImagenPreview({ url, alt }) {
    if (!url) return null;
    return (
        <div>
            <p className="small fw-semibold mb-2">Imagen actual</p>
            <img
                src={url}
                alt={alt}
                className="img-fluid rounded border"
                style={{ maxHeight: 180, objectFit: 'cover' }}
            />
        </div>
    );
}