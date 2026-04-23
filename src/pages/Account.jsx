import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import Breadcrumb from '../components/Breadcrumb';
import Swal from 'sweetalert2';

export default function Account() {
    const navigate = useNavigate();
    const { isAuthenticated, user, logout, refreshUser, loading: authLoading } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [message, setMessage] = useState({ text: '', type: '' });
    const [uploadingImage, setUploadingImage] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (authLoading) return;
        if (!isAuthenticated) { navigate('/login'); return; }
        if (!user) {
            // Token exists but user data not loaded — try to refresh
            refreshUser().then(data => {
                if (!data) navigate('/login');
            });
            return;
        }
        setFormData({
            name: user.name || '',
            email: user.email || '',
            phoneNumber: user.phoneNumber || '',
            street: '',
            streetNumber: '',
            distric: '',
        });
    }, [isAuthenticated, user, authLoading, navigate, refreshUser]);

    const handleLogout = () => { logout(); navigate('/login'); };

    const handleSave = async () => {
        setMessage({ text: '', type: '' });
        try {
            await authService.updateUser({
                name: formData.name,
                phoneNumber: formData.phoneNumber,
                address: {
                    street: formData.street,
                    streetNumber: formData.streetNumber,
                    distric: formData.distric,
                },
            });
            setMessage({ text: 'Perfil actualizado correctamente', type: 'success' });
            setIsEditing(false);
            refreshUser();
        } catch {
            setMessage({ text: 'Error al actualizar el perfil', type: 'error' });
        }
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    };

    const handleImageUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            Swal.fire({ icon: 'error', title: 'Archivo no válido', text: 'Selecciona una imagen', timer: 2000, showConfirmButton: false });
            return;
        }
        setUploadingImage(true);
        const reader = new FileReader();
        reader.onload = async (ev) => {
            try {
                await authService.updateUser({ profileImage: ev.target.result });
                await refreshUser();
                Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Imagen actualizada', showConfirmButton: false, timer: 2000, timerProgressBar: true });
            } catch {
                Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo actualizar la imagen', timer: 2500, showConfirmButton: false });
            } finally {
                setUploadingImage(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        };
        reader.readAsDataURL(file);
    };

    if (authLoading || !user) return (
        <div className="bg-[#F7E6FE] flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#610361]"></div>
        </div>
    );

    return (
        <div className="bg-[#F7E6FE]">
            <Breadcrumb items={[
                { label: 'Inicio', path: '/', icon: 'fa-solid fa-house text-[#610361]' },
                { label: 'Mi Cuenta' },
            ]} />
            <div className="container py-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white rounded-xl shadow p-6">
                        <div className="flex flex-col items-center">
                            <input type="file" ref={fileInputRef} accept="image/*" className="hidden"
                                onChange={handleImageUpload} />
                            <button onClick={() => fileInputRef.current?.click()}
                                className="relative w-20 h-20 rounded-full overflow-hidden group cursor-pointer"
                                disabled={uploadingImage} title="Cambiar foto de perfil">
                                {user.profileImage ? (
                                    <img src={user.profileImage} alt={user.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; e.target.parentElement.querySelector('.fallback')?.classList.remove('hidden'); }} />
                                ) : null}
                                <div className={`fallback w-full h-full rounded-full bg-gradient-to-r from-[#610361] to-[#a84aa7] flex items-center justify-center text-white text-3xl font-bold ${user.profileImage ? 'hidden' : ''}`}>
                                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                                    {uploadingImage ? (
                                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                                    ) : (
                                        <i className="fa-solid fa-camera text-white text-lg"></i>
                                    )}
                                </div>
                            </button>
                            <h3 className="mt-4 font-medium text-lg text-gray-800 font-winkySans">{user.name}</h3>
                            <p className="text-gray-500 text-sm">{user.email}</p>
                        </div>
                        <div className="mt-6 space-y-2">
                            <Link to="/account" className="block w-full text-left px-4 py-2 text-[#610361] bg-[#f3d5ff] rounded font-medium font-winkySans"><i className="fa-regular fa-user mr-2"></i>Mi Perfil</Link>
                            <Link to="/orders" className="block w-full text-left px-4 py-2 text-gray-600 hover:bg-[#f3d5ff] rounded transition font-winkySans"><i className="fa-solid fa-box mr-2"></i>Mis Pedidos</Link>
                            <Link to="/wishlist" className="block w-full text-left px-4 py-2 text-gray-600 hover:bg-[#f3d5ff] rounded transition font-winkySans"><i className="fa-regular fa-heart mr-2"></i>Lista de Deseados</Link>
                            <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-red-500 hover:bg-red-50 rounded transition font-winkySans"><i className="fa-solid fa-right-from-bracket mr-2"></i>Cerrar sesión</button>
                        </div>
                    </div>
                    <div className="md:col-span-3 bg-white rounded-xl shadow p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-[#610361] font-winkySans">Mi Perfil</h2>
                            <button onClick={() => setIsEditing(!isEditing)}
                                className="px-4 py-2 bg-[#f3d5ff] text-[#610361] rounded-lg hover:bg-[#ebbaff] transition font-winkySans">
                                <i className={`fa-solid ${isEditing ? 'fa-xmark' : 'fa-pen-to-square'} mr-1`}></i>
                                {isEditing ? 'Cancelar' : 'Editar'}
                            </button>
                        </div>
                        {message.text && (
                            <div className={`mb-4 p-3 rounded text-sm ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                {message.text}
                            </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-sm text-gray-500 font-winkySans">Nombre</label>
                                <input type="text" value={formData.name || ''} readOnly={!isEditing}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className={`w-full px-4 py-2 mt-1 rounded-lg border ${isEditing ? 'border-[#e6c0e6] bg-white' : 'border-gray-200 bg-gray-50'}`} />
                            </div>
                            <div>
                                <label className="text-sm text-gray-500 font-winkySans">Email</label>
                                <input type="email" value={formData.email || ''} readOnly
                                    className="w-full px-4 py-2 mt-1 rounded-lg border border-gray-200 bg-gray-50" />
                            </div>
                            <div>
                                <label className="text-sm text-gray-500 font-winkySans">Teléfono</label>
                                <input type="text" value={formData.phoneNumber || ''} readOnly={!isEditing}
                                    onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                                    className={`w-full px-4 py-2 mt-1 rounded-lg border ${isEditing ? 'border-[#e6c0e6] bg-white' : 'border-gray-200 bg-gray-50'}`} />
                            </div>
                            {!isEditing ? (
                                <div>
                                    <label className="text-sm text-gray-500 font-winkySans">Dirección</label>
                                    <input type="text" value={user.account?.address || ''} readOnly
                                        className="w-full px-4 py-2 mt-1 rounded-lg border border-gray-200 bg-gray-50" />
                                </div>
                            ) : (
                                <>
                                    <div>
                                        <label className="text-sm text-gray-500 font-winkySans">Dirección antigua</label>
                                        <input type="text" value={user.account?.address || 'Sin dirección'} readOnly
                                            className="w-full px-4 py-2 mt-1 rounded-lg border border-gray-200 bg-gray-50 text-gray-400 italic" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-sm font-semibold text-[#610361] font-winkySans">Dirección nueva</label>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-500 font-winkySans">Calle</label>
                                        <input type="text" value={formData.street || ''}
                                            onChange={e => setFormData({ ...formData, street: e.target.value })}
                                            className="w-full px-4 py-2 mt-1 rounded-lg border border-[#e6c0e6] bg-white"
                                            placeholder="Ej: Calle 50a" />
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-500 font-winkySans">Número</label>
                                        <input type="text" value={formData.streetNumber || ''}
                                            onChange={e => setFormData({ ...formData, streetNumber: e.target.value })}
                                            className="w-full px-4 py-2 mt-1 rounded-lg border border-[#e6c0e6] bg-white"
                                            placeholder="Ej: #19b-22" />
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-500 font-winkySans">Barrio</label>
                                        <input type="text" value={formData.distric || ''}
                                            onChange={e => setFormData({ ...formData, distric: e.target.value })}
                                            className="w-full px-4 py-2 mt-1 rounded-lg border border-[#e6c0e6] bg-white"
                                            placeholder="Ej: Campestre" />
                                    </div>
                                </>
                            )}
                        </div>
                        {isEditing && (
                            <div className="mt-6">
                                <button onClick={handleSave}
                                    className="px-8 py-2.5 bg-[#610361] text-white rounded-lg hover:bg-[#500250] transition font-winkySans">
                                    Guardar Cambios
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
