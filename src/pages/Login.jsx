import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';

export default function Login() {
    const navigate = useNavigate();
    const { login, isAuthenticated } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailInvalid = error === 'Ingresa un correo valido';

    useEffect(() => {
        if (isAuthenticated) navigate('/account');
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const trimmedEmail = email.trim();
        if (!emailRegex.test(trimmedEmail)) {
            setError('Ingresa un correo valido');
            return;
        }
        setLoading(true);
        try {
            await login(trimmedEmail, password);
            Swal.fire({
                toast: true, position: 'top-end', icon: 'success',
                title: '¡Bienvenido de nuevo!',
                showConfirmButton: false, timer: 2000, timerProgressBar: true,
            });
            navigate('/account');
        } catch (err) {
            setError(msg);
            Swal.fire({
                toast: true, position: 'top-end', icon: 'error',
                title: msg,
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
                <Link to="/" className="text-primary text-base"><i className="fa-solid fa-house text-[#610361]"></i></Link>
                <span className="text-sm text-gray-400"><i className="fa-solid fa-chevron-right"></i></span>
                <p className="text-gray-600 font-medium font-winkySans">Login</p>
            </div>

            {/* Main */}
            <div
                className="min-h-screen py-8 sm:py-10 flex items-center justify-center relative overflow-hidden font-winkySans"
                style={{ background: 'radial-gradient(1200px circle at 8% -10%, #ffffff 0%, #f6e8ff 42%, #fce7f3 100%)' }}
            >       

                <div className="relative w-full max-w-[400px] mx-4">
                    {/* Card */}
                    <div className="bg-white/85 backdrop-blur rounded-3xl shadow-[0_28px_70px_rgba(97,3,97,0.22)] border border-white/70 overflow-hidden">
                        {/* Top accent bar */}
                        <div className="h-1.5 w-full" style={{ background: '#610361' }} />

                        <div className="px-6 py-6 sm:px-8 sm:py-7">
                            {/* Header */}
                            <div className="text-center mb-4">
                                <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center shadow-lg" style={{ background: '#610361' }}>
                                    <i className="fa-solid fa-user text-white text-lg"></i>
                                </div>
                                <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#610361] font-winkySans leading-tight">Inicia Sesion</h2>
                                <p className="text-sm text-gray-400 font-winkySans sm:block hidden">Tu rutina te espera.</p>
                            </div>

                            {error && (
                                <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600" aria-live="polite">
                                    <i className="fa-solid fa-circle-exclamation mr-2"></i>
                                    {error}
                                </div>
                            )}

                            {/* Form */}
                            <form onSubmit={handleSubmit}>
                                <div className="space-y-3">
                                    {/* Email */}
                                    <div>
                                        <label htmlFor="email" className="text-xs uppercase tracking-widest font-semibold text-[#610361] mb-2 block font-winkySans">
                                            Email
                                        </label>
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-purple-300 pointer-events-none">
                                                <i className="fa-solid fa-envelope text-sm"></i>
                                            </span>
                                            <input
                                                type="email"
                                                id="email"
                                                value={email}
                                                onChange={(e) => {
                                                    setEmail(e.target.value);
                                                    if (error) setError('');
                                                }}
                                                required
                                                inputMode="email"
                                                autoComplete="email"
                                                aria-invalid={emailInvalid}
                                                className={`block w-full pl-11 pr-4 py-2.5 text-gray-700 bg-purple-50/50 rounded-2xl border ${emailInvalid ? 'border-red-200 focus:ring-red-200/40 focus:border-red-300' : 'border-purple-100 focus:ring-[#a21caf]/30 focus:border-[#a21caf]'} transition placeholder-gray-300 font-winkySans text-sm outline-none`}
                                                placeholder="tucorreo@dominio.com"
                                            />
                                        </div>
                                        {emailInvalid && (
                                            <p className="mt-2 text-xs text-red-500">Revisa el formato del correo.</p>
                                        )}
                                    </div>

                                    {/* Password */}
                                    <div>
                                        <label htmlFor="password" className="text-xs uppercase tracking-widest font-semibold text-[#610361] mb-2 block font-winkySans">
                                            Contraseña
                                        </label>
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-purple-300 pointer-events-none">
                                                <i className="fa-solid fa-lock text-sm"></i>
                                            </span>
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                id="password"
                                                value={password}
                                                onChange={(e) => {
                                                    setPassword(e.target.value);
                                                    if (error) setError('');
                                                }}
                                                required
                                                autoComplete="current-password"
                                                className="block w-full pl-11 pr-12 py-2.5 text-gray-700 bg-purple-50/50 rounded-2xl border border-purple-100 focus:ring-2 focus:ring-[#a21caf]/30 focus:border-[#a21caf] transition font-winkySans text-sm outline-none"
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute inset-y-0 right-0 flex items-center justify-center w-12 text-purple-300 hover:text-[#610361] transition-colors duration-200"
                                                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                            >
                                                <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-sm`}></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Submit */}
                                <div className="mt-5">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-2.5 rounded-2xl text-white font-winkySans font-bold tracking-widest uppercase text-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                                        style={{ background: '#610361' }}
                                    >
                                        {loading
                                            ? <><i className="fa-solid fa-spinner fa-spin mr-2"></i>Ingresando...</>
                                            : <><i className="fa-solid fa-arrow-right-to-bracket mr-2"></i>Ingresar</>
                                        }
                                    </button>
                                </div>
                            </form>

                            {/* Register link */}
                            <p className="mt-4 text-center text-xs text-gray-400 font-winkySans">
                                ¿No tienes una cuenta?{' '}
                                <Link to="/register" className="text-[#a21caf] font-bold hover:underline transition-colors duration-150">
                                    Regístrate ahora
                                </Link>
                            </p>
                        </div>
                    </div>

                    {/* Subtle bottom note */}
                    <p className="hidden sm:block text-center text-[11px] text-gray-400 mt-4 font-winkySans tracking-wide">
                        Kio Gloss · Tu tienda de belleza ✦
                    </p>
                </div>
            </div>
        </>
    );
}