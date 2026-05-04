import { Link } from 'react-router-dom';
import { useState } from 'react';
import Swal from 'sweetalert2';
import authService from '../services/authService';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailInvalid = error === 'Ingresa un correo válido';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const trimmedEmail = email.trim();
        if (!emailRegex.test(trimmedEmail)) {
            setError('Ingresa un correo válido');
            return;
        }

        setLoading(true);
        try {
            await authService.forgotPassword(trimmedEmail);
            setSuccess('Revisa tu bandeja de entrada y sigue las instrucciones.');
            Swal.fire({
                icon: 'success',
                title: '¡Correo enviado!',
                text: 'Revisa tu bandeja de entrada y sigue las instrucciones.',
                confirmButtonColor: '#610361',
            });
            setEmail('');
        } catch {
            setError('No se pudo enviar el correo. Intenta de nuevo.');
            Swal.fire({
                icon: 'error',
                title: 'Algo salió mal',
                text: 'No se pudo enviar el correo. Intenta de nuevo.',
                confirmButtonColor: '#610361',
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
                <p className="text-gray-600 font-medium font-winkySans">Recuperar contraseña</p>
            </div>

            {/* Main */}
            <div
                className="min-h-screen py-8 sm:py-10 flex items-center justify-center relative overflow-hidden font-winkySans"
                style={{ background: 'radial-gradient(1200px circle at 8% -10%, #ffffff 0%, #f6e8ff 42%, #fce7f3 100%)' }}
            >
                <div className="relative w-full max-w-[420px] mx-4">
                    {/* Card */}
                    <div className="bg-white/85 backdrop-blur rounded-3xl shadow-[0_28px_70px_rgba(97,3,97,0.22)] border border-white/70 overflow-hidden">
                        {/* Top accent bar */}
                        <div className="h-1.5 w-full" style={{ background: '#610361' }} />

                        <div className="px-6 py-6 sm:px-8 sm:py-7">
                            {/* Header */}
                            <div className="text-center mb-4">
                                <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center shadow-lg" style={{ background: '#610361' }}>
                                    <i className="fa-solid fa-envelope text-white text-lg"></i>
                                </div>
                                <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#610361] font-winkySans leading-tight">Recuperar contraseña</h2>
                                <p className="text-sm text-gray-400 font-winkySans sm:block hidden">Ingresa tu correo y te enviaremos un enlace.</p>
                            </div>

                            {error && (
                                <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600" aria-live="polite">
                                    <i className="fa-solid fa-circle-exclamation mr-2"></i>
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className="mb-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700" aria-live="polite">
                                    <i className="fa-solid fa-circle-check mr-2"></i>
                                    {success}
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
                                                    if (success) setSuccess('');
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
                                            ? <><i className="fa-solid fa-spinner fa-spin mr-2"></i>Enviando...</>
                                            : <><i className="fa-solid fa-paper-plane mr-2"></i>Enviar enlace</>
                                        }
                                    </button>
                                </div>
                            </form>

                            {/* Back to login */}
                            <p className="mt-4 text-center text-xs text-gray-400 font-winkySans">
                                <Link to="/login" className="text-[#a21caf] font-bold hover:underline transition-colors duration-150">
                                    ← Volver al inicio de sesión
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
