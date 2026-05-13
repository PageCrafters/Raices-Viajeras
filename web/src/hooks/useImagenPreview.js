import { useState, useCallback } from 'react';

/**
 * Gestiona la previsualización de una imagen con soporte para
 * Object URLs locales y URLs remotas ya existentes.
 *
 * @returns {{
 *   previewUrl: string|null,
 *   setRemoteUrl: (url: string|null) => void,
 *   handleFileChange: (file: File|null) => void,
 *   clearPreview: () => void,
 * }}
 */
export function useImagePreview() {
    const [previewUrl, setPreviewUrl] = useState(null);
    const [objectUrl, setObjectUrl] = useState(null);

    const revokeObjectUrl = useCallback((url) => {
        if (url) URL.revokeObjectURL(url);
    }, []);

    /** Muestra una URL remota (imagen ya guardada en servidor). */
    const setRemoteUrl = useCallback((url) => {
        revokeObjectUrl(objectUrl);
        setObjectUrl(null);
        setPreviewUrl(url || null);
    }, [objectUrl, revokeObjectUrl]);

    /** Genera un Object URL local cuando el admin elige un archivo nuevo. */
    const handleFileChange = useCallback((file) => {
        revokeObjectUrl(objectUrl);
        if (!file) {
            setObjectUrl(null);
            // No limpiamos previewUrl: si no hay archivo nuevo mantenemos la imagen remota.
            return;
        }
        const newUrl = URL.createObjectURL(file);
        setObjectUrl(newUrl);
        setPreviewUrl(newUrl);
    }, [objectUrl, revokeObjectUrl]);

    /** Limpia todo (al cerrar el modal). */
    const clearPreview = useCallback(() => {
        revokeObjectUrl(objectUrl);
        setObjectUrl(null);
        setPreviewUrl(null);
    }, [objectUrl, revokeObjectUrl]);

    return { previewUrl, setRemoteUrl, handleFileChange, clearPreview };
}