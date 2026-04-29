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
    const [uploadingImage, setUploadingImage] = useState(false);
    const [savingProfile, setSavingProfile] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (authLoading) return;
        if (!isAuthenticated) { navigate('/login'); return; }
        if (!user) {
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

    const handleLogout = async () => {
        const result = await Swal.fire({
            title: '¿Cerrar sesión?',
            text: '¿Estás seguro de que deseas salir de tu cuenta?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: '<i class="fa-solid fa-right-from-bracket mr-1"></i> Sí, salir',
            cancelButtonText: '<i class="fa-solid fa-xmark mr-1"></i> Cancelar',
            confirmButtonColor: '#610361',
            cancelButtonColor: '#9ca3af',
            customClass: {
                title: 'font-winkySans',
                htmlContainer: 'font-winkySans',
                confirmButton: 'font-winkySans',
                cancelButton: 'font-winkySans',
            },
        });
        if (result.isConfirmed) { logout(); navigate('/login'); }
    };

    const handleSave = async () => {
        setSavingProfile(true);
        try {
            const trimmedStreet = (formData.street || '').trim();
            const trimmedStreetNumber = (formData.streetNumber || '').trim();
            const trimmedDistric = (formData.distric || '').trim();
            const hasNewAddress = Boolean(trimmedStreet || trimmedStreetNumber || trimmedDistric);
            const payload = {
                name: formData.name,
                phoneNumber: formData.phoneNumber,
            };
            if (hasNewAddress) {
                payload.address = {
                    street: trimmedStreet,
                    streetNumber: trimmedStreetNumber,
                    distric: trimmedDistric,
                };
            }
            await authService.updateUser({
                ...payload,
            });
            setIsEditing(false);
            refreshUser();
            Swal.fire({
                toast: true, position: 'top-end', icon: 'success',
                title: 'Perfil actualizado correctamente',
                showConfirmButton: false, timer: 2500, timerProgressBar: true,
                 customClass: {
                title: 'font-winkySans',
                htmlContainer: 'font-winkySans',
                confirmButton: 'font-winkySans',
                cancelButton: 'font-winkySans',
            }
            });
        } catch {
            Swal.fire({
                toast: true, position: 'top-end', icon: 'error',
                title: 'Error al actualizar el perfil',
                showConfirmButton: false, timer: 3000, timerProgressBar: true,
                 customClass: {
                title: 'font-winkySans',
                htmlContainer: 'font-winkySans',
                confirmButton: 'font-winkySans',
                cancelButton: 'font-winkySans',
            }
            });
        } finally {
            setSavingProfile(false);
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            Swal.fire({ icon: 'error', title: 'Archivo no válido', text: 'Selecciona una imagen', timer: 2000, showConfirmButton: false,  customClass: {
                title: 'font-winkySans',
                htmlContainer: 'font-winkySans',
                confirmButton: 'font-winkySans',
                cancelButton: 'font-winkySans',
            } });
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
        <div className="min-h-screen bg-[radial-gradient(1200px_circle_at_10%_-10%,#ffffff_0%,#f7e8ff_42%,#fce7f3_100%)] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4 rounded-3xl border border-white/70 bg-white/80 px-8 py-10 shadow-[0_24px_60px_rgba(97,3,97,0.18)] backdrop-blur">
                <div className="h-12 w-12 animate-spin rounded-full border-2 border-[#e9c9ff] border-t-[#610361]"></div>
                <p className="text-sm text-[#6b3b73]">Cargando tu cuenta...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[radial-gradient(1200px_circle_at_10%_-10%,#ffffff_0%,#f7e8ff_42%,#fce7f3_100%)] font-winkySans">
            <Breadcrumb items={[
                { label: 'Inicio', path: '/', icon: 'fa-solid fa-house text-[#610361]' },
                { label: 'Mi Cuenta' },
            ]} />
            <div className="container py-8 sm:py-10">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-[280px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-8">
                    <div className="md:sticky md:top-6 h-fit rounded-3xl border border-white/70 bg-white/85 p-6 shadow-[0_24px_60px_rgba(97,3,97,0.16)] backdrop-blur">
                        <div className="flex flex-col items-center sm:flex-row sm:items-center sm:gap-4 md:flex-col md:gap-0">
                            <input type="file" ref={fileInputRef} accept="image/*" className="hidden"
                                onChange={handleImageUpload} />
                            <button onClick={() => fileInputRef.current?.click()}
                                className="relative w-24 h-24 rounded-full overflow-hidden group cursor-pointer ring-2 ring-[#f1d4ff] shadow-md"
                                disabled={uploadingImage} title="Cambiar foto de perfil">
                                {user.profileImage ? (
                                    <img src={user.profileImage} alt={user.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; e.target.parentElement.querySelector('.fallback')?.classList.remove('hidden'); }} />
                                ) : null}
                                <div className={`fallback w-full h-full rounded-full bg-linear-to-r from-[#610361] to-[#8b2a8b] flex items-center justify-center text-white text-3xl font-bold ${user.profileImage ? 'hidden' : ''}`}>
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
                            <h3 className="mt-4 font-semibold text-lg text-[#3b0a3b] font-winkySans sm:mt-0 sm:text-left md:mt-4 md:text-center">{user.name}</h3>
                            <p className="text-gray-500 text-xs break-all text-center sm:text-left md:text-center">{user.email}</p>
                        </div>
                        <div className="mt-6 space-y-2 text-sm sm:grid sm:grid-cols-2 sm:gap-2 sm:space-y-0 md:block md:space-y-2">
                            <Link to="/account" className="block w-full text-left px-4 py-2 text-[#610361] bg-[#f3d5ff] rounded-xl font-semibold"><i className="fa-regular fa-user mr-2"></i>Mi Perfil</Link>
                            <Link to="/orders" className="block w-full text-left px-4 py-2 text-gray-600 hover:bg-[#f3d5ff] rounded-xl transition"><i className="fa-solid fa-box mr-2"></i>Mis Pedidos</Link>
                            <Link to="/wishlist" className="block w-full text-left px-4 py-2 text-gray-600 hover:bg-[#f3d5ff] rounded-xl transition"><i className="fa-regular fa-heart mr-2"></i>Lista de Deseados</Link>
                            <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-red-500 hover:bg-red-50 rounded-xl transition"><i className="fa-solid fa-right-from-bracket mr-2"></i>Cerrar sesión</button>
                        </div>
                    </div>
                    <div className="rounded-3xl border border-white/70 bg-white/90 p-5 sm:p-6 shadow-[0_24px_60px_rgba(97,3,97,0.16)]">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
                            <div>
                                <p className="text-xs uppercase tracking-[0.3em] text-[#9b4fa8]">Perfil</p>
                                <h2 className="mt-2 text-2xl font-bold text-[#610361] font-winkySans">Mi Perfil</h2>
                            </div>
                            <button onClick={async () => {
                                if (isEditing) {
                                    const result = await Swal.fire({
                                        title: '¿Cancelar edición?',
                                        text: 'Los cambios que no hayas guardado se perderán.',
                                        icon: 'warning',
                                        showCancelButton: true,
                                        confirmButtonText: '<i class="fa-solid fa-trash mr-1"></i> Sí, descartar',
                                        cancelButtonText: '<i class="fa-solid fa-pen mr-1"></i> Seguir editando',
                                        confirmButtonColor: '#dc2626',
                                        cancelButtonColor: '#610361',
                                        customClass: {
                                            title: 'font-winkySans',
                                            htmlContainer: 'font-winkySans',
                                            confirmButton: 'font-winkySans',
                                            cancelButton: 'font-winkySans',
                                        },
                                    });
                                    if (!result.isConfirmed) return;
                                }
                                setIsEditing(!isEditing);
                            }}
                                className="px-4 py-2 bg-[#f3d5ff] text-[#610361] rounded-xl hover:bg-[#ebbaff] transition font-winkySans text-sm font-semibold">
                                <i className={`fa-solid ${isEditing ? 'fa-xmark' : 'fa-pen-to-square'} mr-1`}></i>
                                {isEditing ? 'Cancelar' : 'Editar'}
                            </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs uppercase tracking-widest text-gray-500 font-winkySans">Nombre</label>
                                <input type="text" value={formData.name || ''} readOnly={!isEditing}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className={`w-full px-4 py-2.5 mt-2 rounded-xl border ${isEditing ? 'border-[#e6c0e6] bg-white' : 'border-gray-200 bg-[#f7f1fa]'} focus:outline-none focus:ring-2 focus:ring-[#610361]/20`} />
                            </div>
                            <div>
                                <label className="text-xs uppercase tracking-widest text-gray-500 font-winkySans">Email</label>
                                <input type="email" value={formData.email || ''} readOnly
                                    className="w-full px-4 py-2.5 mt-2 rounded-xl border border-gray-200 bg-[#f7f1fa]" />
                            </div>
                            <div>
                                <label className="text-xs uppercase tracking-widest text-gray-500 font-winkySans">Teléfono</label>
                                <input type="text" value={formData.phoneNumber || ''} readOnly={!isEditing}
                                    onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                                    className={`w-full px-4 py-2.5 mt-2 rounded-xl border ${isEditing ? 'border-[#e6c0e6] bg-white' : 'border-gray-200 bg-[#f7f1fa]'} focus:outline-none focus:ring-2 focus:ring-[#610361]/20`} />
                            </div>
                            {!isEditing ? (
                                <div>
                                    <label className="text-xs uppercase tracking-widest text-gray-500 font-winkySans">Dirección</label>
                                    <input type="text" value={user.account?.address || ''} readOnly
                                        className="w-full px-4 py-2.5 mt-2 rounded-xl border border-gray-200 bg-[#f7f1fa]" />
                                </div>
                            ) : (
                                <>
                                    <div>
                                        <label className="text-xs uppercase tracking-widest text-gray-500 font-winkySans">Dirección antigua</label>
                                        <input type="text" value={user.account?.address || 'Sin dirección'} readOnly
                                            className="w-full px-4 py-2.5 mt-2 rounded-xl border border-gray-200 bg-[#f7f1fa] text-gray-400 italic" />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="text-xs uppercase tracking-widest text-[#610361] font-winkySans">Dirección nueva</label>
                                    </div>
                                    <div>
                                        <label className="text-xs uppercase tracking-widest text-gray-500 font-winkySans">Calle</label>
                                        <input type="text" value={formData.street || ''}
                                            onChange={e => setFormData({ ...formData, street: e.target.value })}
                                            className="w-full px-4 py-2.5 mt-2 rounded-xl border border-[#e6c0e6] bg-white focus:outline-none focus:ring-2 focus:ring-[#610361]/20"
                                            placeholder="Ej: Calle 50a" />
                                    </div>
                                    <div>
                                        <label className="text-xs uppercase tracking-widest text-gray-500 font-winkySans">Número</label>
                                        <input type="text" value={formData.streetNumber || ''}
                                            onChange={e => setFormData({ ...formData, streetNumber: e.target.value })}
                                            className="w-full px-4 py-2.5 mt-2 rounded-xl border border-[#e6c0e6] bg-white focus:outline-none focus:ring-2 focus:ring-[#610361]/20"
                                            placeholder="Ej: #19b-22" />
                                    </div>
                                    <div>
                                        <label className="text-xs uppercase tracking-widest text-gray-500 font-winkySans">Barrio</label>
                                        <input type="text" value={formData.distric || ''}
                                            onChange={e => setFormData({ ...formData, distric: e.target.value })}
                                            className="w-full px-4 py-2.5 mt-2 rounded-xl border border-[#e6c0e6] bg-white focus:outline-none focus:ring-2 focus:ring-[#610361]/20"
                                            placeholder="Ej: Campestre" />
                                    </div>
                                </>
                            )}
                        </div>
                        {isEditing && (
                            <div className="mt-6">
                                <button onClick={handleSave} disabled={savingProfile}
                                    className="px-8 py-2.5 bg-[#610361] text-white rounded-xl hover:bg-[#500250] transition font-winkySans disabled:opacity-60 disabled:cursor-not-allowed">
                                    {savingProfile
                                        ? <><i className="fa-solid fa-spinner fa-spin mr-2"></i>Guardando...</>
                                        : <><i className="fa-solid fa-floppy-disk mr-2"></i>Guardar Cambios</>
                                    }
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}