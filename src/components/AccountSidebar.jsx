import { useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import Swal from 'sweetalert2';

export const useAccountSidebarImageUpload = () => {
    const { refreshUser } = useAuth();
    const [uploadingImage, setUploadingImage] = useState(false);

    const handleImageUpload = (event) => {
        const inputTarget = event.target;
        const file = inputTarget?.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            Swal.fire({
                icon: 'error',
                title: 'Archivo no válido',
                text: 'Selecciona una imagen',
                timer: 2000,
                showConfirmButton: false,
                customClass: {
                    title: 'font-winkySans',
                    htmlContainer: 'font-winkySans',
                    confirmButton: 'font-winkySans',
                    cancelButton: 'font-winkySans',
                },
            });
            if (inputTarget) inputTarget.value = '';
            return;
        }
        setUploadingImage(true);
        const reader = new FileReader();
        reader.onload = async (ev) => {
            try {
                await authService.updateUser({ profileImage: ev.target.result });
                await refreshUser();
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'Imagen actualizada',
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true,
                });
            } catch {
                Swal.fire({
                    icon: 'error',
                    title: 'No se pudo actualizar la imagen',
                    text: 'Debe de tener Máximo 10 mb',
                    timer: 2500,
                    showConfirmButton: false,
                });
            } finally {
                setUploadingImage(false);
                if (inputTarget) inputTarget.value = '';
            }
        };
        reader.readAsDataURL(file);
    };

    return { handleImageUpload, uploadingImage };
};

export default function AccountSidebar({
    user,
    onLogout,
    allowPhotoUpload = false,
    onImageUpload,
    uploadingImage = false,
}) {
    const location = useLocation();
    const fileInputRef = useRef(null);
    const currentPath = location.pathname;

    const getLinkClasses = (path) => {
        const isActive = currentPath === path;
        return `block w-full text-left px-4 py-2 rounded-xl transition ${
            isActive
                ? 'bg-[#f3d5ff] text-[#610361] font-semibold'
                : 'text-gray-600 hover:bg-[#f3d5ff]'
        }`;
    };

    const avatarLetter = user?.name?.charAt(0)?.toUpperCase() || 'U';
    const hasImage = Boolean(user?.profileImage);

    const avatarContent = (
        <>
            {hasImage ? (
                <img
                    src={user.profileImage}
                    alt={user.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                        e.target.parentElement
                            ?.querySelector('.fallback')
                            ?.classList.remove('hidden');
                    }}
                />
            ) : null}
            <div
                className={`fallback w-full h-full rounded-full bg-linear-to-r from-[#610361] to-[#8b2a8b] flex items-center justify-center text-white text-3xl font-bold ${
                    hasImage ? 'hidden' : ''
                }`}
            >
                {avatarLetter}
            </div>
        </>
    );

    return (
        <div className="w-full justify-self-start md:sticky md:top-6 h-fit rounded-3xl border border-white/70 bg-white/85 p-4 md:p-6 shadow-[0_24px_60px_rgba(97,3,97,0.16)] backdrop-blur">
            <div className="flex flex-col items-center sm:flex-row sm:items-center sm:gap-4 md:flex-col md:gap-0">
                {allowPhotoUpload ? (
                    <>
                        <input
                            type="file"
                            ref={fileInputRef}
                            accept="image/*"
                            className="hidden"
                            onChange={onImageUpload}
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="relative w-24 h-24 rounded-full overflow-hidden group cursor-pointer ring-2 ring-[#f1d4ff] shadow-md"
                            disabled={uploadingImage}
                            title="Cambiar foto de perfil"
                        >
                            {avatarContent}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                                {uploadingImage ? (
                                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                                ) : (
                                    <i className="fa-solid fa-camera text-white text-lg"></i>
                                )}
                            </div>
                        </button>
                    </>
                ) : (
                    <div className="relative w-24 h-24 rounded-full overflow-hidden ring-2 ring-[#f1d4ff] shadow-md">
                        {avatarContent}
                    </div>
                )}
                <h3 className="mt-4 font-semibold text-lg text-[#3b0a3b] font-winkySans sm:mt-0 sm:text-left md:mt-4 md:text-center">
                    {user?.name}
                </h3>
                <p className="text-gray-500 text-xs break-all text-center sm:text-left md:text-center">
                    {user?.email}
                </p>
            </div>
            <div className="mt-6 text-sm grid grid-cols-2 gap-2 md:block md:space-y-2">
                <Link to="/account" className={getLinkClasses('/account')}>
                    <i className="fa-regular fa-user mr-2"></i>Mi Perfil
                </Link>
                <Link to="/orders" className={getLinkClasses('/orders')}>
                    <i className="fa-solid fa-box mr-2"></i>Mis Pedidos
                </Link>
                <Link to="/wishlist" className={getLinkClasses('/wishlist')}>
                    <i className="fa-regular fa-heart mr-2"></i>Lista de Deseados
                </Link>
                <button
                    onClick={onLogout}
                    className="block w-full text-left px-4 py-2 text-red-500 hover:bg-red-50 rounded-xl transition"
                >
                    <i className="fa-solid fa-right-from-bracket mr-2"></i>Cerrar sesión
                </button>
            </div>
        </div>
    );
}
