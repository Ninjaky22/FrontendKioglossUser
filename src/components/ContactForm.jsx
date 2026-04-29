import { useState } from 'react';
import Swal from 'sweetalert2';

export default function ContactForm() {
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [asunto, setAsunto] = useState('');
    const [mensaje, setMensaje] = useState('');

    const DESTINATION_EMAIL = 'casanovacristian40@gmail.com';

    // ── Límites de caracteres ──
    const LIMITS = {
        nombre:  { min: 3,  max: 50  },
        asunto:  { min: 5,  max: 80  },
        mensaje: { min: 20, max: 500 },
    };

    const toast = (icon, title, text = '') => Swal.fire({
        toast: true, position: 'top-end', icon, title,
        text: text || undefined,
        showConfirmButton: false,
        timer: 3000, timerProgressBar: true,
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!nombre.trim() || !email.trim() || !asunto.trim() || !mensaje.trim()) {
            toast('warning', 'Completa todos los campos');
            return;
        }
        if (nombre.trim().length < LIMITS.nombre.min) {
            toast('warning', 'Nombre muy corto', `Mínimo ${LIMITS.nombre.min} caracteres`);
            return;
        }
        if (asunto.trim().length < LIMITS.asunto.min) {
            toast('warning', 'Asunto muy corto', `Mínimo ${LIMITS.asunto.min} caracteres`);
            return;
        }
        if (mensaje.trim().length < LIMITS.mensaje.min) {
            toast('warning', 'Mensaje muy corto', `Escribe al menos ${LIMITS.mensaje.min} caracteres`);
            return;
        }

        const body = encodeURIComponent(`Hola, mi nombre es ${nombre}.\n\n${mensaje}\n\nMi correo es: ${email}`);
        const subject = encodeURIComponent(asunto);
        window.open(`mailto:${DESTINATION_EMAIL}?subject=${subject}&body=${body}`, '_blank');

        toast('success', '¡Mensaje listo!', 'Se abrió tu cliente de correo');
        setNombre(''); setEmail(''); setAsunto(''); setMensaje('');
    };

    // ── Contador de caracteres ──
    const CharCount = ({ value, min, max }) => {
        const len = value.length;
        const tooShort = len > 0 && len < min;
        const nearMax  = len >= max * 0.85;
        const atMax    = len >= max;
        return (
            <span className={`text-[10px] font-winkySans tabular-nums transition-colors ${
                atMax    ? 'text-red-500 font-bold' :
                nearMax  ? 'text-amber-500' :
                tooShort ? 'text-red-400' :
                           'text-gray-300'
            }`}>
                {len}/{max}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-linear-to-b flex items-center justify-center py-8 sm:py-10 px-4 sm:px-6 lg:px-8 font-winkySans">
            <div className="w-full max-w-lg lg:max-w-lg transition-all duration-300">

                <div className="bg-white rounded-4xl shadow-2xl border border-purple-100 overflow-hidden">

                    {/* Header */}
                    <div className="relative bg-[#610361] px-6 py-4 sm:px-8 sm:py-6 overflow-hidden">
                        <div className="absolute -top-5 -right-5 w-16 h-16 sm:w-24 sm:h-24 bg-white/10 rounded-full blur-sm"></div>
                        <div className="absolute -bottom-7 -left-4 w-12 h-12 sm:w-16 sm:h-16 bg-white/10 rounded-full blur-sm"></div>
                        <div className="relative flex flex-col items-center gap-1.5 sm:gap-2">
                            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-1 shadow-inner backdrop-blur-sm">
                                <i className="fa-solid fa-envelope text-white text-lg sm:text-xl"></i>
                            </div>
                            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white font-winkySans tracking-tight">Contáctanos</h2>
                            <p className="text-purple-200 text-xs sm:text-sm lg:text-base font-medium">¡Estamos aquí para ayudarte!</p>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="px-6 py-5 sm:px-8 sm:py-6 bg-gray-50/30">
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                            {/* Nombre */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="text-xs font-bold text-gray-600 uppercase tracking-widest">Nombre</label>
                                    <CharCount value={nombre} min={LIMITS.nombre.min} max={LIMITS.nombre.max} />
                                </div>
                                <div className="relative">
                                    <i className="fa-solid fa-user absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400 text-sm pointer-events-none"></i>
                                    <input
                                        type="text" value={nombre}
                                        onChange={e => e.target.value.length <= LIMITS.nombre.max && setNombre(e.target.value)}
                                        required
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-purple-100 bg-purple-50/40 text-gray-700 text-sm placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#9b30a0]/30 focus:border-[#9b30a0] transition-all"
                                        placeholder={`Tu nombre completo (mín. ${LIMITS.nombre.min} caracteres)`}
                                    />
                                </div>
                                {nombre.length > 0 && nombre.trim().length < LIMITS.nombre.min && (
                                    <p className="text-[10px] text-red-400 mt-1 pl-1 flex items-center gap-1">
                                        <i className="fa-solid fa-circle-exclamation text-[9px]"></i>
                                        Mínimo {LIMITS.nombre.min} caracteres
                                    </p>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-1.5">Email</label>
                                <div className="relative">
                                    <i className="fa-solid fa-at absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400 text-sm pointer-events-none"></i>
                                    <input
                                        type="email" value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        required
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-purple-100 bg-purple-50/40 text-gray-700 text-sm placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#9b30a0]/30 focus:border-[#9b30a0] transition-all"
                                        placeholder="ejemplo@dominio.com"
                                    />
                                </div>
                            </div>

                            {/* Asunto */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="text-xs font-bold text-gray-600 uppercase tracking-widest">Asunto</label>
                                    <CharCount value={asunto} min={LIMITS.asunto.min} max={LIMITS.asunto.max} />
                                </div>
                                <div className="relative">
                                    <i className="fa-solid fa-tag absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400 text-sm pointer-events-none"></i>
                                    <input
                                        type="text" value={asunto}
                                        onChange={e => e.target.value.length <= LIMITS.asunto.max && setAsunto(e.target.value)}
                                        required
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-purple-100 bg-purple-50/40 text-gray-700 text-sm placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#9b30a0]/30 focus:border-[#9b30a0] transition-all"
                                        placeholder={`Consulta, colaboración... (mín. ${LIMITS.asunto.min} caracteres)`}
                                    />
                                </div>
                                {asunto.length > 0 && asunto.trim().length < LIMITS.asunto.min && (
                                    <p className="text-[10px] text-red-400 mt-1 pl-1 flex items-center gap-1">
                                        <i className="fa-solid fa-circle-exclamation text-[9px]"></i>
                                        Mínimo {LIMITS.asunto.min} caracteres
                                    </p>
                                )}
                            </div>

                            {/* Mensaje */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="text-xs font-bold text-gray-600 uppercase tracking-widest">Mensaje</label>
                                    <CharCount value={mensaje} min={LIMITS.mensaje.min} max={LIMITS.mensaje.max} />
                                </div>
                                <div className="relative">
                                    <i className="fa-solid fa-comment-dots absolute left-3.5 top-3.5 text-purple-400 text-sm pointer-events-none"></i>
                                    <textarea
                                        value={mensaje}
                                        onChange={e => e.target.value.length <= LIMITS.mensaje.max && setMensaje(e.target.value)}
                                        rows={4} required
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-purple-100 bg-purple-50/40 text-gray-700 text-sm placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#9b30a0]/30 focus:border-[#9b30a0] transition-all resize-none"
                                        placeholder={`Describe tu consulta... (mín. ${LIMITS.mensaje.min} caracteres)`}
                                    />
                                </div>
                                {mensaje.length > 0 && mensaje.trim().length < LIMITS.mensaje.min && (
                                    <p className="text-[10px] text-red-400 mt-1 pl-1 flex items-center gap-1">
                                        <i className="fa-solid fa-circle-exclamation text-[9px]"></i>
                                        Faltan {LIMITS.mensaje.min - mensaje.trim().length} caracteres más
                                    </p>
                                )}
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                className="w-full lg:col-span-2 py-3.5 sm:py-4 mt-2 sm:mt-4 rounded-xl bg-[#9b30a0] hover:bg-[#7b2585] text-white font-bold text-sm sm:text-base tracking-wide shadow-md shadow-purple-200 hover:shadow-lg hover:shadow-purple-300 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5"
                            >
                                <i className="fa-solid fa-paper-plane text-sm sm:text-base -mt-0.5"></i>
                                Enviar mensaje
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}