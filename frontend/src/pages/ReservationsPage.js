import React, { useState, useEffect } from 'react';
import { getCurrentUser, getAllUsers } from '../services/authService';
import { getReservasByTutor, getReservasByHost, updateReservaStatus, getAllReservations } from '../services/reservationService';
import { Link } from 'react-router-dom';

const ReservationsPage = () => {
    const currentUser = getCurrentUser();
    const [reservations, setReservations] = useState([]);
    const [hostReservations, setHostReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('tutor'); // 'tutor' or 'host'
    const [isHost, setIsHost] = useState(false);
    const [userMap, setUserMap] = useState({});

    useEffect(() => {
        if (currentUser && currentUser.tipo === 'anfitriao') {
            setIsHost(true);
        }
    }, [currentUser]);

    useEffect(() => {
        const fetchData = async () => {
            if (!currentUser) return;
            setLoading(true);
            setError('');
            try {
                // Fetch users for name lookup
                const users = await getAllUsers();
                const map = {};
                users.forEach(u => {
                    map[u.id_usuario || u.id] = u;
                });
                setUserMap(map);

                if (activeTab === 'tutor') {
                    const data = await getReservasByTutor(currentUser.id_usuario || currentUser.id);
                    const sortedData = Array.isArray(data) ? data.sort((a, b) => new Date(b.data_inicio) - new Date(a.data_inicio)) : [];
                    setReservations(sortedData);
                } else if (activeTab === 'host' && isHost) {
                    // Fetch all reservations and filter locally to ensure we catch them
                    // This acts as a fallback if the specific endpoint has issues
                    try {
                        const allReservations = await getAllReservations();
                        const hostId = currentUser.id_usuario || currentUser.id;
                        const data = allReservations.filter(r =>
                            r.id_anfitriao === hostId ||
                            r.id_anfitriao === Number(hostId) ||
                            String(r.id_anfitriao) === String(hostId)
                        );
                        const sortedData = Array.isArray(data) ? data.sort((a, b) => new Date(b.data_inicio) - new Date(a.data_inicio)) : [];
                        setHostReservations(sortedData);
                    } catch (fallbackError) {
                        console.error('Fallback fetch failed, trying direct endpoint:', fallbackError);
                        const data = await getReservasByHost(currentUser.id_usuario || currentUser.id);
                        const sortedData = Array.isArray(data) ? data.sort((a, b) => new Date(b.data_inicio) - new Date(a.data_inicio)) : [];
                        setHostReservations(sortedData);
                    }
                }
            } catch (err) {
                console.error('Erro ao buscar dados:', err);
                setError('Não foi possível carregar as reservas.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser?.id_usuario, currentUser?.id, activeTab, isHost]);

    const handleApprove = async (reservaId) => {
        if (!window.confirm('Deseja aprovar esta reserva?')) return;

        try {
            await updateReservaStatus(reservaId, 'confirmada');
            // Refresh list
            // Re-fetch logic similar to useEffect, but simplified for just the list
            try {
                const allReservations = await getAllReservations();
                const hostId = currentUser.id_usuario || currentUser.id;
                const data = allReservations.filter(r =>
                    r.id_anfitriao === hostId ||
                    r.id_anfitriao === Number(hostId) ||
                    String(r.id_anfitriao) === String(hostId)
                );
                const sortedData = Array.isArray(data) ? data.sort((a, b) => new Date(b.data_inicio) - new Date(a.data_inicio)) : [];
                setHostReservations(sortedData);
            } catch (e) {
                const data = await getReservasByHost(currentUser.id_usuario || currentUser.id);
                const sortedData = Array.isArray(data) ? data.sort((a, b) => new Date(b.data_inicio) - new Date(a.data_inicio)) : [];
                setHostReservations(sortedData);
            }
            alert('Reserva aprovada com sucesso!');
        } catch (err) {
            console.error('Erro ao aprovar reserva:', err);
            alert('Erro ao aprovar reserva.');
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'confirmada': return 'bg-green-100 text-green-800 border-green-200';
            case 'pendente': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'cancelada': return 'bg-red-100 text-red-800 border-red-200';
            case 'concluida': return 'bg-blue-100 text-blue-800 border-blue-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    if (!currentUser) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Acesso Restrito</h2>
                <p className="text-gray-600 mb-6">Você precisa estar logado para ver suas reservas.</p>
                <Link to="/login" className="bg-green-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-600 transition-colors">
                    Fazer Login
                </Link>
            </div>
        );
    }

    const displayedReservations = activeTab === 'tutor' ? reservations : hostReservations;

    return (
        <div className="py-10 max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Reservas</h1>

            {/* Tabs */}
            <div className="flex space-x-4 mb-8 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('tutor')}
                    className={`pb-2 px-4 font-semibold transition-colors ${activeTab === 'tutor'
                        ? 'text-green-600 border-b-2 border-green-600'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Minhas Reservas (Tutor)
                </button>
                {isHost && (
                    <button
                        onClick={() => setActiveTab('host')}
                        className={`pb-2 px-4 font-semibold transition-colors ${activeTab === 'host'
                            ? 'text-green-600 border-b-2 border-green-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Solicitações Recebidas (Host)
                    </button>
                )}
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
                    <p className="text-gray-500">Carregando reservas...</p>
                </div>
            ) : error ? (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center">
                    {error}
                </div>
            ) : displayedReservations.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-200">
                    <span className="text-4xl mb-4 block">📅</span>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Nenhuma reserva encontrada</h3>
                    <p className="text-gray-500 mb-6">
                        {activeTab === 'tutor'
                            ? 'Você ainda não fez nenhuma reserva.'
                            : 'Você não tem solicitações de reserva no momento.'}
                    </p>
                    {activeTab === 'tutor' && (
                        <Link to="/feed" className="bg-green-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-600 transition-colors">
                            Encontrar um Anfitrião
                        </Link>
                    )}
                </div>
            ) : (
                <div className="grid gap-6">
                    {displayedReservations.map((reserva) => (
                        <div key={reserva.id_reserva} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="p-6">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-800">
                                            Reserva #{reserva.id_reserva}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            Solicitado em: {formatDate(reserva.created_at || new Date().toISOString())}
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <span className={`px-4 py-1 rounded-full text-sm font-bold border ${getStatusColor(reserva.status)}`}>
                                            {reserva.status?.toUpperCase() || 'PENDENTE'}
                                        </span>
                                        {activeTab === 'host' && reserva.status === 'pendente' && (
                                            <button
                                                onClick={() => handleApprove(reserva.id_reserva)}
                                                className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-bold hover:bg-green-600 transition-colors shadow-sm"
                                            >
                                                Aprovar
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-xs text-gray-500 uppercase font-bold mb-1">Período</p>
                                        <p className="font-semibold text-gray-800">
                                            {formatDate(reserva.data_inicio)} - {formatDate(reserva.data_fim)}
                                        </p>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {reserva.qtd_dias} diária(s)
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-xs text-gray-500 uppercase font-bold mb-1">Detalhes</p>
                                        <p className="font-semibold text-gray-800">
                                            {reserva.qtd_pets} Pet(s)
                                        </p>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Valor Diária: R$ {Number(reserva.valor_diaria).toFixed(2)}
                                        </p>
                                    </div>
                                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                                        <p className="text-xs text-green-600 uppercase font-bold mb-1">Valor Total</p>
                                        <p className="text-2xl font-bold text-green-700">
                                            R$ {Number(reserva.valor_total_reserva).toFixed(2)}
                                        </p>
                                    </div>
                                </div>

                                {/* User/Host Info */}
                                <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-600">
                                    {activeTab === 'host' ? (
                                        <p><strong>Solicitado por:</strong> {userMap[reserva.id_tutor]?.nome || `Tutor #${reserva.id_tutor}`}</p>
                                    ) : (
                                        <p><strong>Anfitrião:</strong> {userMap[reserva.id_anfitriao]?.nome || `Anfitrião #${reserva.id_anfitriao}`}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ReservationsPage;
