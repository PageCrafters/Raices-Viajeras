import { useState, useCallback } from 'react';
import { apiFetch, apiPostFormData, apiPost } from '../api/adminApi';

/**
 * Gestiona el estado y las operaciones CRUD de categorías (provincias).
 */
export function useCategorias() {
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const cargar = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await apiFetch({ accion: 'provincias' });
            setCategorias(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Carga el detalle completo de una provincia para el modal de edición.
     * @param {number|string} id
     * @returns {Promise<object>}
     */
    const obtenerDetalle = useCallback(async (id) => {
        return apiFetch({ accion: 'provincia_detalle', id: String(id) });
    }, []);

    /**
     * Guarda una categoría nueva o actualiza una existente.
     * @param {object} campos
     * @param {File|null} imagen
     * @param {File|null} imagenMovil
     */
    const guardar = useCallback(async (campos, imagen, imagenMovil) => {
        const formData = new FormData();
        formData.append('accion', campos.id ? 'editar_provincia' : 'crear_provincia');
        Object.entries(campos).forEach(([k, v]) => formData.append(k, v ?? ''));
        if (imagen) formData.append('imagen', imagen);
        if (imagenMovil) formData.append('imagen_movil', imagenMovil);
        await apiPostFormData(formData);
        await cargar();
    }, [cargar]);

    const eliminar = useCallback(async (id) => {
        await apiPost({ accion: 'eliminar', tipo: 'provincia', id });
        await cargar();
    }, [cargar]);

    return { categorias, loading, error, cargar, obtenerDetalle, guardar, eliminar };
}