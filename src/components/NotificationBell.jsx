import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';

const TYPE_ICON = {
    ORDER_CREATED:        { icon: 'fa-bag-shopping',   color: 'text-[#610361]',   bg: 'bg-[#f3e6f3]' },
    ORDER_STATUS_CHANGED: { icon: 'fa-truck',           color: 'text-blue-500',    bg: 'bg-blue-50'   },
    LOW_STOCK:            { icon: 'fa-triangle-exclamation', color: 'text-amber-500', bg: 'bg-amber-50' },
    OUT_OF_STOCK:         { icon: 'fa-circle-xmark',   color: 'text-red-500',     bg: 'bg-red-50'    },
};

function relativeTime(isoDate) {
    if (!isoDate) return '';
    const diff = Math.floor((Date.now() - new Date(isoDate)) / 1000);
    if (diff < 60)  return 'hace un momento';
    if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`;
    return `hace ${Math.floor(diff / 86400)} días`;
}

function NotificationItem({ notif, onRead, onDelete }) {
    const navigate = useNavigate();
    const { icon, color, bg } = TYPE_ICON[notif.type] || TYPE_ICON.ORDER_STATUS_CHANGED;

    const handleClick = () => {
        if (!notif.read) onRead(notif.id);
        if (notif.relatedEntityType === 'ORDER') {
            navigate('/account');
        }
    };

    return (
        <div
            className={`flex items-start gap-3 px-4 py-3 hover:bg-[#faf0fa] transition cursor-pointer group relative ${!notif.read ? 'bg-[#fdf5fd]' : ''}`}
            onClick={handleClick}
        >
            {/* Dot indicador */}
            {!notif.read && (
                <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#9b30a0]" />
            )}

            {/* Icono */}
            <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
                <i className={`fa-solid ${icon} ${color} text-sm`}></i>
            </div>

            {/* Contenido */}
            <div className="flex-1 min-w-0">
                <p className={`text-sm font-winkySans font-semibold truncate ${notif.read ? 'text-gray-500' : 'text-gray-800'}`}>
                    {notif.title}
                </p>
                <p className={`text-xs font-winkySans mt-0.5 line-clamp-2 ${notif.read ? 'text-gray-400' : 'text-gray-600'}`}>
                    {notif.message}
                </p>
                <p className="text-[10px] text-gray-300 font-winkySans mt-1">{relativeTime(notif.createdAt)}</p>
            </div>

            {/* Botón eliminar */}
            <button
                onClick={(e) => { e.stopPropagation(); onDelete(notif.id); }}
                className="opacity-0 group-hover:opacity-100 transition text-gray-300 hover:text-red-400 p-1 shrink-0"
            >
                <i className="fa-solid fa-xmark text-xs"></i>
            </button>
        </div>
    );
}

export default function NotificationBell() {
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef(null);
    const { notifications, unreadCount, loading, hasMore, markRead, markAllRead, removeNotification, loadMore } = useNotifications();

    // Cerrar al hacer clic fuera
    useEffect(() => {
        const handler = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleMarkAllRead = useCallback(async (e) => {
        e.stopPropagation();
        await markAllRead();
    }, [markAllRead]);

    return (
        <div className="relative" ref={wrapperRef}>
            {/* Campana */}
            <button
                onClick={() => setOpen(o => !o)}
                aria-label={`Notificaciones${unreadCount > 0 ? `, ${unreadCount} sin leer` : ''}`}
                className="text-center text-gray-600 hover:text-[#9b30a0] transition relative font-winkySans font-medium flex flex-col items-center"
            >
                <div className="text-[22px] md:text-2xl relative inline-block">
                    <i className={`${unreadCount > 0 ? 'fa-solid' : 'fa-regular'} fa-bell`}></i>
                    {unreadCount > 0 && (
                        <span className="absolute -top-1.5 -right-2 md:-top-2 md:-right-3 bg-red-500 text-white text-[10px] md:text-[12px] w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center leading-none ring-2 ring-white">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </div>
                <div className="text-[10px] md:text-xs leading-3 mt-1 hidden sm:block">Alertas</div>
            </button>

            {/* Popover */}
            {open && (
                <div className="absolute right-0 top-full mt-2 w-[340px] max-w-[calc(100vw-24px)] bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden origin-top-right animate-in fade-in zoom-in duration-200">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                        <span className="text-sm font-semibold text-gray-700 font-winkySans">Notificaciones</span>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="text-xs text-[#610361] hover:text-[#9b30a0] font-winkySans font-medium transition"
                            >
                                Marcar todas leídas
                            </button>
                        )}
                    </div>

                    {/* Lista */}
                    <div className="max-h-[420px] overflow-y-auto divide-y divide-gray-50">
                        {loading && notifications.length === 0 ? (
                            // Skeleton
                            Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="flex items-start gap-3 px-4 py-3 animate-pulse">
                                    <div className="w-8 h-8 rounded-lg bg-gray-100 shrink-0" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-3 bg-gray-100 rounded w-3/4" />
                                        <div className="h-3 bg-gray-100 rounded w-full" />
                                        <div className="h-2 bg-gray-100 rounded w-1/3" />
                                    </div>
                                </div>
                            ))
                        ) : notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-gray-300">
                                <i className="fa-regular fa-bell-slash text-3xl mb-2"></i>
                                <p className="text-sm font-winkySans font-medium">Sin notificaciones</p>
                            </div>
                        ) : (
                            <>
                                {notifications.map(n => (
                                    <NotificationItem
                                        key={n.id}
                                        notif={n}
                                        onRead={markRead}
                                        onDelete={removeNotification}
                                    />
                                ))}
                                {hasMore && (
                                    <button
                                        onClick={loadMore}
                                        disabled={loading}
                                        className="w-full py-2.5 text-xs text-[#610361] hover:bg-[#faf0fa] transition font-winkySans font-medium"
                                    >
                                        {loading ? 'Cargando...' : 'Ver más'}
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
