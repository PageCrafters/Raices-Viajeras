import { useState, useCallback } from 'react';
import { apiFetch } from '../api/adminApi';

/**
 * Carga las métricas del dashboard y los últimos pedidos.
 */
export function useDashboard() {
    const [stats, setStats] = useState(null);
    const [ultimosPedidos, setUltimosPedidos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const cargar = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await apiFetch({ accion: 'stats' });
            setStats({
                usuarios: data.usuarios ?? '-',
                viajes: data.viajes ?? '-',
                pedidos: data.pedidos ?? '-',
                provincias: data.provincias ?? '-',
                entradasTotales: data.entradas_totales ?? '-',
            });
            setUltimosPedidos(data.ultimos_pedidos ?? []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    return { stats, ultimosPedidos, loading, error, cargar };
}