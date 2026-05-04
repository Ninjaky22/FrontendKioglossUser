import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import authService from '../services/authService';

const passwordRules = {
    minLength: (v) => v.length >= 8,
    maxLength: (v) => v.length <= 20,
    hasUppercase: (v) => /[A-Z]/.test(v),
    hasNumber: (v) => /[0-9]/.test(v),
    hasSpecialChar: (v) => /[!@#$%^&*(),;?":{}|<>+-]/.test(v),
};

export default function ResetPasswordPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token') || '';

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (!token) navigate('/forgot-password', { replace: true });
    }, [token, navigate]);

    const validationState = {
        minLength: passwordRules.minLength(newPassword),
        maxLength: newPassword.length > 0 && passwordRules.maxLength(newPassword),
        hasUppercase: passwordRules.hasUppercase(newPassword),
        hasNumber: passwordRules.hasNumber(newPassword),
        hasSpecialChar: passwordRules.hasSpecialChar(newPassword),
    };

    const rulesList = [
        { key: 'minLength', label: 'Mínimo 8 caracteres', ok: validationState.minLength },
        { key: 'maxLength', label: 'Máximo 20 caracteres', ok: validationState.maxLength },
        { key: 'hasUppercase', label: 'Al menos una mayúscula', ok: validationState.hasUppercase },
        { key: 'hasNumber', label: 'Al menos un número', ok: validationState.hasNumber },
        { key: 'hasSpecialChar', label: 'Al menos un carácter especial: !@#$%^&*(),;?":{}|<>+-', ok: validationState.hasSpecialChar },
    ];

    const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;
    const allRulesPass = Object.values(validationState).every(Boolean);
    const isSubmitDisabled = loading || !allRulesPass || !passwordsMatch;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!token) {
            navigate('/forgot-password', { replace: true });
            return;
        }

        if (!allRulesPass) {
            Swal.fire({
                icon: 'warning',
                title: 'Contraseña inválida',
                text: 'Asegúrate de cumplir todos los requisitos de contraseña.',
                confirmButtonColor: '#610361',
            });
            return;
        }

        if (!passwordsMatch) {
            Swal.fire({
                icon: 'warning',
                title: 'Las contraseñas no coinciden',
                text: 'Verifica que ambas contraseñas sean iguales.',
                confirmButtonColor: '#610361',
            });
            return;
        }

        setLoading(true);
        try {
            await authService.resetPassword(token, newPassword);
            setSuccess('Tu contraseña ha sido restablecida.');
            Swal.fire({
                icon: 'success',
                title: '¡Contraseña actualizada!',
                text: 'Tu contraseña ha sido restablecida. Redirigiendo al login...',
                confirmButtonColor: '#610361',
                timer: 2000,
                showConfirmButton: false,
            }).then(() => navigate('/login'));
        } catch (err) {
            const backendMessage = err.response?.data?.message || 'Ocurrió un error al restablecer la contraseña.';
            setError(backendMessage);
            Swal.fire({
                icon: 'error',
                title: 'Enlace inválido',
                text: backendMessage,
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
                <p className="text-gray-600 font-medium font-winkySans">Nueva contraseña</p>
            </div>

            {/* Main */}
            <div
                className="min-h-screen py-8 sm:py-10 flex items-center justify-center relative overflow-hidden font-winkySans"
                style={{ background: 'radial-gradient(1200px circle at 8% -10%, #ffffff 0%, #f6e8ff 42%, #fce7f3 100%)' }}
            >
                <div className="relative w-full max-w-[440px] mx-4">
                    {/* Card */}
                    <div className="bg-white/85 backdrop-blur rounded-3xl shadow-[0_28px_70px_rgba(97,3,97,0.22)] border border-white/70 overflow-hidden">
                        {/* Top accent bar */}
                        <div className="h-1.5 w-full" style={{ background: '#610361' }} />

                        <div className="px-6 py-6 sm:px-8 sm:py-7">
                            {/* Header */}
                            <div className="text-center mb-4">
                                <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center shadow-lg" style={{ background: '#610361' }}>
                                    <i className="fa-solid fa-key text-white text-lg"></i>
                                </div>
                                <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#610361] font-winkySans leading-tight">Nueva contraseña</h2>
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
                                    {/* Nueva contraseña */}
                                    <div>
                                        <label htmlFor="newPassword" className="text-xs uppercase tracking-widest font-semibold text-[#610361] mb-2 block font-winkySans">
                                            Nueva contraseña
                                        </label>
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-purple-300 pointer-events-none">
                                                <i className="fa-solid fa-lock text-sm"></i>
                                            </span>
                                            <input
                                                type={showNewPassword ? 'text' : 'password'}
                                                id="newPassword"
                                                value={newPassword}
                                                onChange={(e) => {
                                                    setNewPassword(e.target.value.slice(0, 20));
                                                    if (error) setError('');
                                                    if (success) setSuccess('');
                                                }}
                                                required
                                                maxLength={20}
                                                autoComplete="new-password"
                                                className="block w-full pl-11 pr-12 py-2.5 text-gray-700 bg-purple-50/50 rounded-2xl border border-purple-100 focus:ring-2 focus:ring-[#a21caf]/30 focus:border-[#a21caf] transition font-winkySans text-sm outline-none"
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                className="absolute inset-y-0 right-0 flex items-center justify-center w-12 text-purple-300 hover:text-[#610361] transition-colors duration-200"
                                                aria-label={showNewPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                            >
                                                <i className={`fa-solid ${showNewPassword ? 'fa-eye-slash' : 'fa-eye'} text-sm`}></i>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Confirmar contraseña */}
                                    <div>
                                        <label htmlFor="confirmPassword" className="text-xs uppercase tracking-widest font-semibold text-[#610361] mb-2 block font-winkySans">
                                            Confirmar contraseña
                                        </label>
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-purple-300 pointer-events-none">
                                                <i className="fa-solid fa-lock text-sm"></i>
                                            </span>
                                            <input
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                id="confirmPassword"
                                                value={confirmPassword}
                                                onChange={(e) => {
                                                    setConfirmPassword(e.target.value.slice(0, 20));
                                                    if (error) setError('');
                                                    if (success) setSuccess('');
                                                }}
                                                required
                                                maxLength={20}
                                                autoComplete="new-password"
                                                className="block w-full pl-11 pr-12 py-2.5 text-gray-700 bg-purple-50/50 rounded-2xl border border-purple-100 focus:ring-2 focus:ring-[#a21caf]/30 focus:border-[#a21caf] transition font-winkySans text-sm outline-none"
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute inset-y-0 right-0 flex items-center justify-center w-12 text-purple-300 hover:text-[#610361] transition-colors duration-200"
                                                aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                            >
                                                <i className={`fa-solid ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'} text-sm`}></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Validation rules */}
                                <div className="mt-4 space-y-1.5">
                                    {rulesList.map((rule) => (
                                        <p
                                            key={rule.key}
                                            className={`flex items-center gap-2 text-xs ${rule.ok ? 'text-emerald-600' : 'text-red-400'}`}
                                        >
                                            <i className={`fa-solid ${rule.ok ? 'fa-circle-check' : 'fa-circle-xmark'}`}></i>
                                            {rule.label}
                                        </p>
                                    ))}
                                </div>

                                {/* Submit */}
                                <div className="mt-5">
                                    <button
                                        type="submit"
                                        disabled={isSubmitDisabled}
                                        className="w-full py-2.5 rounded-2xl text-white font-winkySans font-bold tracking-widest uppercase text-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                                        style={{ background: '#610361' }}
                                    >
                                        {loading
                                            ? <><i className="fa-solid fa-spinner fa-spin mr-2"></i>Restableciendo...</>
                                            : <><i className="fa-solid fa-rotate-right mr-2"></i>Restablecer</>
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
