import { useState, useCallback } from 'react';
import { apiFetch, apiPost } from '../api/adminApi';

/**
 * Gestiona el estado y las operaciones de pedidos.
 */
export function usePedidos() {
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * @param {string} [filtroEstado]  Si se pasa, filtra por ese estado en el backend.
     */
    const cargar = useCallback(async (filtroEstado = '') => {
        setLoading(true);
        setError(null);
        try {
            const params = { accion: 'pedidos' };
            if (filtroEstado) params.estado = filtroEstado;
            const data = await apiFetch(params);
            setPedidos(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const actualizarEstado = useCallback(async (id, estado) => {
        await apiPost({ accion: 'actualizar_estado_pedido', id, estado });
    }, []);

    const eliminar = useCallback(async (id) => {
        await apiPost({ accion: 'eliminar', tipo: 'pedido', id });
    }, []);

    return { pedidos, loading, error, cargar, actualizarEstado, eliminar };
}