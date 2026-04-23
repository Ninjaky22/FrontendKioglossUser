import { useState } from 'react';

export default function ContactForm() {
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [asunto, setAsunto] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const DESTINATION_EMAIL = 'casanovacristian40@gmail.com';

    const handleSubmit = (e) => {
        e.preventDefault();
        setSuccessMsg(''); setErrorMsg('');
        if (!nombre.trim() || !email.trim() || !asunto.trim() || !mensaje.trim()) {
            setErrorMsg('Por favor completa todos los campos.');
            return;
        }
        const body = encodeURIComponent(`Hola, mi nombre es ${nombre}.\n\n${mensaje}\n\nMi correo es: ${email}`);
        const subject = encodeURIComponent(asunto);
        window.open(`mailto:${DESTINATION_EMAIL}?subject=${subject}&body=${body}`, '_blank');
        setSuccessMsg('¡Mensaje listo! Se abrió tu cliente de correo.');
        setNombre(''); setEmail(''); setAsunto(''); setMensaje('');
    };

    return (
        <div className="flex justify-center py-12 px-4">
            <div className="w-full max-w-lg">
                <div className="bg-white rounded-xl shadow-2xl border-2 border-[#a84aa7] overflow-hidden">
                    <div className="bg-[#a84aa7] px-6 py-6">
                        <h2 className="text-3xl font-extrabold text-white text-center">Contáctanos</h2>
                        <p className="text-pink-100 mt-2 text-center">¡Estamos aquí para ayudarte!</p>
                    </div>
                    <div className="p-6">
                        {successMsg && <div className="mb-6 p-4 rounded-lg text-green-800 bg-green-100 border border-green-300">{successMsg}</div>}
                        {errorMsg && <div className="mb-6 p-4 rounded-lg text-red-800 bg-red-100 border border-red-300">{errorMsg}</div>}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre *</label>
                                <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} required
                                    className="w-full px-4 py-2 rounded-lg border border-[#e6c0e6] focus:ring-2 focus:ring-[#d78ac7] focus:border-[#d78ac7]" placeholder="Tu nombre" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Email *</label>
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                                    className="w-full px-4 py-2 rounded-lg border border-[#e6c0e6] focus:ring-2 focus:ring-[#d78ac7] focus:border-[#d78ac7]" placeholder="ejemplo@dominio.com" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Asunto *</label>
                                <input type="text" value={asunto} onChange={e => setAsunto(e.target.value)} required
                                    className="w-full px-4 py-2 rounded-lg border border-[#e6c0e6] focus:ring-2 focus:ring-[#d78ac7] focus:border-[#d78ac7]" placeholder="Consulta, colaboración..." />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Mensaje *</label>
                                <textarea value={mensaje} onChange={e => setMensaje(e.target.value)} rows={5} required
                                    className="w-full px-4 py-2 rounded-lg border border-[#e6c0e6] focus:ring-2 focus:ring-[#d78ac7] focus:border-[#d78ac7]" placeholder="Describe tu consulta..." />
                            </div>
                            <button type="submit" className="w-full py-3 rounded-lg bg-[#a84aa7] hover:bg-[#8e398d] text-white text-lg font-bold shadow-md transition">
                                ENVIAR MENSAJE
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
