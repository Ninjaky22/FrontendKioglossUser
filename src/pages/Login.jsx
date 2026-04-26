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

    useEffect(() => {
        if (isAuthenticated) navigate('/account');
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            Swal.fire({
                toast: true, position: 'top-end', icon: 'success',
                title: '¡Bienvenido de nuevo!',
                showConfirmButton: false, timer: 2000, timerProgressBar: true,
            });
            navigate('/account');
        } catch (err) {
            const msg = err.response?.status === 401
                ? 'Credenciales incorrectas'
                : 'Error al iniciar sesión';
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
            <div className="min-h-screen py-12 flex items-center justify-center relative overflow-hidden font-winkySans"
                style={{ background: 'linear-gradient(160deg, #fdf4ff 0%, #f5e8ff 50%, #fce7f3 100%)' }}>
                
                <div className="relative w-full max-w-md mx-4">

                    {/* Card */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-purple-100/60 overflow-hidden">

                        {/* Top accent bar */}
                        <div className="h-1.5 w-full" style={{ background: '#610361' }} />

                        <div className="px-8 py-10 md:px-10">

                            {/* Header */}
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg"
                                    style={{ background: '#610361' }}>
                                    <i className="fa-solid fa-user text-white text-2xl"></i>
                                </div>
                                <h2 className="text-3xl font-extrabold text-[#610361] font-winkySans leading-tight">Inicia Sesión</h2>
                                <p className="text-gray-400 mt-1 text-sm font-winkySans">¡Bienvenido de nuevo!</p>
                            </div>        

                            {/* Form */}
                            <form onSubmit={handleSubmit}>
                                <div className="space-y-5">

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
                                                type="email" id="email" value={email}
                                                onChange={e => setEmail(e.target.value)} required
                                                className="block w-full pl-11 pr-4 py-3 text-gray-700 bg-purple-50/50 rounded-2xl border border-purple-100 focus:ring-2 focus:ring-[#a21caf]/30 focus:border-[#a21caf] transition placeholder-gray-300 font-winkySans text-sm outline-none"
                                                placeholder="tucorreo@dominio.com"
                                            />
                                        </div>
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
                                                type={showPassword ? 'text' : 'password'} id="password" value={password}
                                                onChange={e => setPassword(e.target.value)} required
                                                className="block w-full pl-11 pr-12 py-3 text-gray-700 bg-purple-50/50 rounded-2xl border border-purple-100 focus:ring-2 focus:ring-[#a21caf]/30 focus:border-[#a21caf] transition font-winkySans text-sm outline-none"
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button" onClick={() => setShowPassword(!showPassword)}
                                                className="absolute inset-y-0 right-0 flex items-center justify-center w-12 text-purple-300 hover:text-[#610361] transition-colors duration-200">
                                                <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-sm`}></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Submit */}
                                <div className="mt-8">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-3 rounded-2xl text-white font-winkySans font-bold tracking-widest uppercase text-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                                        style={{ background: '#610361' }}>
                                        {loading
                                            ? <><i className="fa-solid fa-spinner fa-spin mr-2"></i>Ingresando...</>
                                            : <><i className="fa-solid fa-arrow-right-to-bracket mr-2"></i>Ingresar</>
                                        }
                                    </button>
                                </div>
                            </form>

                            {/* Register link */}
                            <p className="mt-6 text-center text-sm text-gray-400 font-winkySans">
                                ¿No tienes una cuenta?{' '}
                                <Link to="/register" className="text-[#a21caf] font-bold hover:underline transition-colors duration-150">
                                    Regístrate ahora
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