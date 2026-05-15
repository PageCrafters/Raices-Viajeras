import { useState, useCallback } from 'react';
import { apiFetch, apiPost } from '../api/adminApi';

/**
 * Gestiona el estado y las operaciones CRUD de usuarios.
 */
export function useUsuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const cargar = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await apiFetch({ accion: 'usuarios' });
            setUsuarios(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const guardar = useCallback(async (campos) => {
        const body = {
            accion: campos.id ? 'editar_usuario' : 'crear_usuario',
            ...campos,
            genero: campos.genero || 'o',
        };
        await apiPost(body);
        await cargar();
    }, [cargar]);

    const eliminar = useCallback(async (id) => {
        await apiPost({ accion: 'eliminar', tipo: 'usuario', id });
        await cargar();
    }, [cargar]);

    return { usuarios, loading, error, cargar, guardar, eliminar };
}