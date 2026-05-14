import { useState, useCallback } from 'react';
import { apiFetch, apiPostFormData, apiPost } from '../api/adminApi';

/**
 * Gestiona el estado y las operaciones CRUD de viajes.
 */
export function useViajes() {
    const [viajes, setViajes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const cargar = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await apiFetch({ accion: 'viajes' });
            setViajes(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Carga el detalle completo de un viaje para rellenar el modal de edición.
     * @param {number|string} id
     * @returns {Promise<object>}
     */
    const obtenerDetalle = useCallback(async (id) => {
        return apiFetch({ accion: 'viaje_detalle', id: String(id) });
    }, []);

    /**
     * Guarda un viaje nuevo o actualiza uno existente.
     * @param {object} campos  Campos del formulario
     * @param {File|null} imagen
     * @param {File|null} imagenMovil
     */
    const guardar = useCallback(async (campos, imagen, imagenMovil) => {
        const formData = new FormData();
        formData.append('accion', campos.id ? 'editar_viaje' : 'crear_viaje');
        Object.entries(campos).forEach(([k, v]) => formData.append(k, v ?? ''));
        if (imagen) formData.append('imagen', imagen);
        if (imagenMovil) formData.append('imagen_movil', imagenMovil);
        await apiPostFormData(formData);
        await cargar();
    }, [cargar]);

    const eliminar = useCallback(async (id) => {
        await apiPost({ accion: 'eliminar', tipo: 'viaje', id });
        await cargar();
    }, [cargar]);

    return { viajes, loading, error, cargar, obtenerDetalle, guardar, eliminar };
}