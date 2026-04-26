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
            await authService.updateUser({
                name: formData.name,
                phoneNumber: formData.phoneNumber,
                address: {
                    street: formData.street,
                    streetNumber: formData.streetNumber,
                    distric: formData.distric,
                },
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
        <div className="bg-[#F7E6FE] flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#610361]"></div>
        </div>
    );

    return (
        <div className="bg-[#F7E6FE] font-winkySans">
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
                                <div className={`fallback w-full h-full rounded-full bg-linear-to-r bg-[#610361] flex items-center justify-center text-white text-3xl font-bold ${user.profileImage ? 'hidden' : ''}`}>
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
                            <Link to="/account" className="block w-full text-left px-4 py-2 text-[#610361] bg-[#f3d5ff] rounded font-medium"><i className="fa-regular fa-user mr-2"></i>Mi Perfil</Link>
                            <Link to="/orders" className="block w-full text-left px-4 py-2 text-gray-600 hover:bg-[#f3d5ff] rounded transition"><i className="fa-solid fa-box mr-2"></i>Mis Pedidos</Link>
                            <Link to="/wishlist" className="block w-full text-left px-4 py-2 text-gray-600 hover:bg-[#f3d5ff] rounded transition"><i className="fa-regular fa-heart mr-2"></i>Lista de Deseados</Link>
                            <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-red-500 hover:bg-red-50 rounded transition"><i className="fa-solid fa-right-from-bracket mr-2"></i>Cerrar sesión</button>
                        </div>
                    </div>
                    <div className="md:col-span-3 bg-white rounded-xl shadow p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-[#610361] font-winkySans">Mi Perfil</h2>
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
                                className="px-4 py-2 bg-[#f3d5ff] text-[#610361] rounded-lg hover:bg-[#ebbaff] transition font-winkySans">
                                <i className={`fa-solid ${isEditing ? 'fa-xmark' : 'fa-pen-to-square'} mr-1`}></i>
                                {isEditing ? 'Cancelar' : 'Editar'}
                            </button>
                        </div>
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
                                <button onClick={handleSave} disabled={savingProfile}
                                    className="px-8 py-2.5 bg-[#610361] text-white rounded-lg hover:bg-[#500250] transition font-winkySans disabled:opacity-60 disabled:cursor-not-allowed">
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