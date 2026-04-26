import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';

export default function Register() {
    const navigate = useNavigate();
    const { register, isAuthenticated } = useAuth();
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [street, setStreet] = useState('');
    const [streetNumber, setStreetNumber] = useState('');
    const [distric, setDistric] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    // Redirect if already logged in
    useEffect(() => {
        if (isAuthenticated) navigate('/account');
    }, [isAuthenticated, navigate]);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await register({
                email, name, password, phoneNumber,
                address: { street, streetNumber, distric },
                account: { pointsPerPurchase: 0, isActive: true },
            });
            Swal.fire({
                toast: true, position: 'top-end', icon: 'success',
                title: '¡Cuenta creada exitosamente!',
                showConfirmButton: false, timer: 2500, timerProgressBar: true,
            });
            navigate('/account');
        } catch (err) {
            const msg = err.response?.data?.message || 'Error al registrarse';
            setError(msg);
            Swal.fire({
                toast: true, position: 'top-end', icon: 'error',
                title: 'Correo o Número ya registrado. Inicia sesion o usa otro.',
                showConfirmButton: false, timer: 3000, timerProgressBar: true,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Breadcrumb */}
            <div className="container py-4 flex items-center gap-3">
                <Link to="/" className="text-primary text-base">
                    <i className="fa-solid fa-house text-[#610361]"></i>
                </Link>
                <span className="text-sm text-gray-400"><i className="fa-solid fa-chevron-right"></i></span>
                <p className="text-gray-600 font-winkySans font-medium">Register</p>
            </div>

            {/* Main */}
            <div
                className="min-h-screen py-12 flex items-center justify-center relative overflow-hidden font-winkySans"
                style={{ background: 'linear-gradient(160deg, #fdf4ff 0%, #f5e8ff 50%, #fce7f3 100%)' }}
            >
                <div className="relative w-full max-w-lg mx-4">

                    {/* Card */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-purple-100/60 overflow-hidden">

                        {/* Top accent bar */}
                        <div className="h-1.5 w-full" style={{ background: '#610361' }} />

                        <div className="px-8 py-10 md:px-10">

                            {/* Header */}
                            <div className="text-center mb-8">
                                <div
                                    className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg"
                                    style={{ background: '#610361' }}
                                >
                                    <i className="fa-solid fa-user-plus text-white text-2xl"></i>
                                </div>
                                <h2 className="text-3xl font-extrabold text-[#610361] font-winkySans leading-tight">
                                    Crear una Cuenta
                                </h2>
                                <p className="text-gray-400 mt-1 text-sm font-winkySans">
                                    Regístrate para comprar y ver tus pedidos.
                                </p>
                            </div>                           

                            {/* Form */}
                            <form onSubmit={handleSubmit}>
                                <div className="space-y-5">

                                    {/* Nombre */}
                                    <div>
                                        <label className="text-xs uppercase tracking-widest font-semibold text-[#610361] mb-2 block font-winkySans">
                                            Nombre Completo
                                        </label>
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-purple-300 pointer-events-none">
                                                <i className="fa-solid fa-circle-user text-sm"></i>
                                            </span>
                                            <input
                                                type="text" value={name}
                                                onChange={e => setName(e.target.value)} required
                                                className="block w-full pl-11 pr-4 py-3 text-gray-700 bg-purple-50/50 rounded-2xl border border-purple-100 focus:ring-2 focus:ring-[#610361]/30 focus:border-[#610361] transition placeholder-gray-300 font-winkySans text-sm outline-none"
                                                placeholder="Tu nombre completo"
                                            />
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label className="text-xs uppercase tracking-widest font-semibold text-[#610361] mb-2 block font-winkySans">
                                            Email
                                        </label>
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-purple-300 pointer-events-none">
                                                <i className="fa-solid fa-envelope text-sm"></i>
                                            </span>
                                            <input
                                                type="email" value={email}
                                                onChange={e => setEmail(e.target.value)} required
                                                className="block w-full pl-11 pr-4 py-3 text-gray-700 bg-purple-50/50 rounded-2xl border border-purple-100 focus:ring-2 focus:ring-[#610361]/30 focus:border-[#610361] transition placeholder-gray-300 font-winkySans text-sm outline-none"
                                                placeholder="tucorreo@dominio.com"
                                            />
                                        </div>
                                    </div>

                                    {/* Contraseña */}
                                    <div>
                                        <label className="text-xs uppercase tracking-widest font-semibold text-[#610361] mb-2 block font-winkySans">
                                            Contraseña
                                        </label>
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-purple-300 pointer-events-none">
                                                <i className="fa-solid fa-lock text-sm"></i>
                                            </span>
                                            <input
                                                type={showPassword ? 'text' : 'password'} value={password}
                                                onChange={e => setPassword(e.target.value)} required
                                                className="block w-full pl-11 pr-12 py-3 text-gray-700 bg-purple-50/50 rounded-2xl border border-purple-100 focus:ring-2 focus:ring-[#610361]/30 focus:border-[#610361] transition placeholder-gray-300 font-winkySans text-sm outline-none"
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button" onClick={() => setShowPassword(!showPassword)}
                                                className="absolute inset-y-0 right-0 flex items-center justify-center w-12 text-purple-300 hover:text-[#610361] transition-colors duration-200"
                                            >
                                                <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-sm`}></i>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Teléfono */}
                                    <div>
                                        <label className="text-xs uppercase tracking-widest font-semibold text-[#610361] mb-2 block font-winkySans">
                                            Teléfono
                                        </label>
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-purple-300 pointer-events-none">
                                                <i className="fa-solid fa-phone text-sm"></i>
                                            </span>
                                            <input
                                                type="tel" value={phoneNumber}
                                                onChange={e => setPhoneNumber(e.target.value)}
                                                className="block w-full pl-11 pr-4 py-3 text-gray-700 bg-purple-50/50 rounded-2xl border border-purple-100 focus:ring-2 focus:ring-[#610361]/30 focus:border-[#610361] transition placeholder-gray-300 font-winkySans text-sm outline-none"
                                                placeholder="3001234567"
                                            />
                                        </div>
                                    </div>

                                    {/* Dirección */}
                                    <div>
                                        <label className="text-xs uppercase tracking-widest font-semibold text-[#610361] mb-2 block font-winkySans">
                                            Dirección de Envío
                                        </label>
                                        <div className="space-y-3">
                                            <div className="relative">
                                                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-purple-300 pointer-events-none">
                                                    <i className="fa-solid fa-map-pin text-sm"></i>
                                                </span>
                                                <input
                                                    type="text" value={street}
                                                    onChange={e => setStreet(e.target.value)}
                                                    className="block w-full pl-11 pr-4 py-3 text-gray-700 bg-purple-50/50 rounded-2xl border border-purple-100 focus:ring-2 focus:ring-[#610361]/30 focus:border-[#610361] transition placeholder-gray-300 font-winkySans text-sm outline-none"
                                                    placeholder="Calle"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <input
                                                    type="text" value={streetNumber}
                                                    onChange={e => setStreetNumber(e.target.value)}
                                                    className="block w-full px-4 py-3 text-gray-700 bg-purple-50/50 rounded-2xl border border-purple-100 focus:ring-2 focus:ring-[#610361]/30 focus:border-[#610361] transition placeholder-gray-300 font-winkySans text-sm outline-none"
                                                    placeholder="Número"
                                                />
                                                <input
                                                    type="text" value={distric}
                                                    onChange={e => setDistric(e.target.value)}
                                                    className="block w-full px-4 py-3 text-gray-700 bg-purple-50/50 rounded-2xl border border-purple-100 focus:ring-2 focus:ring-[#610361]/30 focus:border-[#610361] transition placeholder-gray-300 font-winkySans text-sm outline-none"
                                                    placeholder="Barrio"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Submit */}
                                <div className="mt-8">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-3 rounded-2xl text-white font-winkySans font-bold tracking-widest uppercase text-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                                        style={{ background: '#610361' }}
                                    >
                                        {loading
                                            ? <><i className="fa-solid fa-spinner fa-spin mr-2"></i>Creando cuenta...</>
                                            : <><i className="fa-solid fa-user-plus mr-2"></i>Crear Cuenta</>
                                        }
                                    </button>
                                </div>
                            </form>

                            {/* Login link */}
                            <p className="mt-6 text-center text-sm text-gray-400 font-winkySans">
                                ¿Ya tienes una cuenta?{' '}
                                <Link to="/login" className="text-[#610361] font-bold hover:underline transition-colors duration-150">
                                    Inicia Sesión
                                </Link>
                            </p>
                        </div>
                    </div>

                    {/* Subtle bottom note */}
                    <p className="text-center text-[11px] text-gray-400 mt-4 font-winkySans tracking-wide">
                        Kio Gloss · Tu tienda de belleza ✦
                    </p>
                </div>
            </div>
        </>
    );
}