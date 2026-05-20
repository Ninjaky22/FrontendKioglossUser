import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import Breadcrumb from '../components/Breadcrumb';
import AccountSidebar, { useAccountSidebarImageUpload } from '../components/AccountSidebar';
import Swal from 'sweetalert2';

export default function Account() {
    const navigate = useNavigate();
    const { isAuthenticated, user, logout, refreshUser, loading: authLoading } = useAuth();
    const { handleImageUpload, uploadingImage } = useAccountSidebarImageUpload();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [savingProfile, setSavingProfile] = useState(false);
    const LIMITS = {
        nameMax: 50,
        phoneMax: 10,
        streetMax: 60,
        streetNumberMax: 10,
        districMax: 50,
        cityMax: 60,
    };

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
            city: '',
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
            const trimmedCity = (formData.city || '').trim();
            if (hasNewAddress) {
                payload.address = {
                    street: trimmedStreet,
                    streetNumber: trimmedStreetNumber,
                    distric: trimmedDistric,
                    city: trimmedCity,
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
                    <AccountSidebar
                        user={user}
                        allowPhotoUpload={true}
                        onLogout={handleLogout}
                        onImageUpload={handleImageUpload}
                        uploadingImage={uploadingImage}
                    />
                    <div className="min-w-0">
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
                                        onChange={e => setFormData({ ...formData, name: e.target.value.slice(0, LIMITS.nameMax) })}
                                        maxLength={LIMITS.nameMax}
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
                                        onChange={e => setFormData({ ...formData, phoneNumber: e.target.value.slice(0, LIMITS.phoneMax) })}
                                        maxLength={LIMITS.phoneMax}
                                        className={`w-full px-4 py-2.5 mt-2 rounded-xl border ${isEditing ? 'border-[#e6c0e6] bg-white' : 'border-gray-200 bg-[#f7f1fa]'} focus:outline-none focus:ring-2 focus:ring-[#610361]/20`} />
                                </div>
                                {!isEditing ? (
                                    <>
                                        <div>
                                            <label className="text-xs uppercase tracking-widest text-gray-500 font-winkySans">Dirección</label>
                                            <input type="text" value={user.account?.address || ''} readOnly
                                                className="w-full px-4 py-2.5 mt-2 rounded-xl border border-gray-200 bg-[#f7f1fa]" />
                                        </div>
                                        <div>
                                            <label className="text-xs uppercase tracking-widest text-gray-500 font-winkySans">Ciudad</label>
                                            <input type="text" value={user.account?.city || ''} readOnly
                                                className="w-full px-4 py-2.5 mt-2 rounded-xl border border-gray-200 bg-[#f7f1fa]" />
                                        </div>
                                    </>
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
                                                onChange={e => setFormData({ ...formData, street: e.target.value.slice(0, LIMITS.streetMax) })}
                                                maxLength={LIMITS.streetMax}
                                                className="w-full px-4 py-2.5 mt-2 rounded-xl border border-[#e6c0e6] bg-white focus:outline-none focus:ring-2 focus:ring-[#610361]/20"
                                                placeholder="Ej: Calle 50a" />
                                        </div>
                                        <div>
                                            <label className="text-xs uppercase tracking-widest text-gray-500 font-winkySans">Número</label>
                                            <input type="text" value={formData.streetNumber || ''}
                                                onChange={e => setFormData({ ...formData, streetNumber: e.target.value.slice(0, LIMITS.streetNumberMax) })}
                                                maxLength={LIMITS.streetNumberMax}
                                                className="w-full px-4 py-2.5 mt-2 rounded-xl border border-[#e6c0e6] bg-white focus:outline-none focus:ring-2 focus:ring-[#610361]/20"
                                                placeholder="Ej: #19b-22" />
                                        </div>
                                        <div>
                                            <label className="text-xs uppercase tracking-widest text-gray-500 font-winkySans">Barrio</label>
                                            <input type="text" value={formData.distric || ''}
                                                onChange={e => setFormData({ ...formData, distric: e.target.value.slice(0, LIMITS.districMax) })}
                                                maxLength={LIMITS.districMax}
                                                className="w-full px-4 py-2.5 mt-2 rounded-xl border border-[#e6c0e6] bg-white focus:outline-none focus:ring-2 focus:ring-[#610361]/20"
                                                placeholder="Ej: Campestre" />
                                        </div>
                                        <div>
                                            <label className="text-xs uppercase tracking-widest text-gray-500 font-winkySans">Ciudad</label>
                                            <input type="text" value={formData.city || ''}
                                                onChange={e => setFormData({ ...formData, city: e.target.value.slice(0, LIMITS.cityMax) })}
                                                maxLength={LIMITS.cityMax}
                                                className="w-full px-4 py-2.5 mt-2 rounded-xl border border-[#e6c0e6] bg-white focus:outline-none focus:ring-2 focus:ring-[#610361]/20"
                                                placeholder="Ej: Medellín" />
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
        </div>
    );
}