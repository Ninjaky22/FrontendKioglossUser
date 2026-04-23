import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

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

    // Redirect if already logged in
    useEffect(() => {
        if (isAuthenticated) navigate('/account');
    }, [isAuthenticated, navigate]);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await register({
                email, name, password, phoneNumber,
                address: { street, streetNumber, distric },
                account: { pointsPerPurchase: 0, isActive: true },
            });
            navigate('/account');
        } catch (err) {
            setError(err.response?.data?.message || 'Error al registrarse');
        }
    };

    return (
        <>
            <div className="container py-4 flex items-center gap-3">
                <Link to="/" className="text-primary text-base"><i className="fa-solid fa-house"></i></Link>
                <span className="text-sm text-gray-400"><i className="fa-solid fa-chevron-right"></i></span>
                <p className="text-gray-600 font-medium">Register</p>
            </div>
            <div className="bg-gray-50 py-16">
                <div className="container flex items-center justify-center">
                    <div className="max-w-lg w-full bg-white p-8 md:p-10 rounded-xl shadow-xl">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-extrabold text-gray-900 mt-4">Crear una Cuenta</h2>
                            <p className="text-gray-500 mt-2 text-sm">Regístrate para comprar y ver tus pedidos.</p>
                        </div>
                        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">{error}</div>}
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-1 block">Nombre Completo</label>
                                    <input type="text" value={name} onChange={e => setName(e.target.value)} required
                                        className="block w-full px-4 py-3 text-gray-700 bg-gray-50 rounded-lg border border-[#e6c0e6] focus:ring-2 focus:ring-[#d78ac7] focus:border-[#d78ac7] transition placeholder-gray-400" placeholder="Tu nombre completo" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
                                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                                        className="block w-full px-4 py-3 text-gray-700 bg-gray-50 rounded-lg border border-[#e6c0e6] focus:ring-2 focus:ring-[#d78ac7] focus:border-[#d78ac7] transition placeholder-gray-400" placeholder="tucorreo@dominio.com" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-1 block">Contraseña</label>
                                    <div className="relative">
                                        <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                                            className="block w-full px-4 py-3 text-gray-700 bg-gray-50 rounded-lg border border-[#e6c0e6] focus:ring-2 focus:ring-[#d78ac7] focus:border-[#d78ac7] transition pr-12 placeholder-gray-400" placeholder="*******" />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 flex items-center justify-center h-full w-12 text-gray-500 hover:text-[#a84aa7]">
                                            <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-1 block">Teléfono</label>
                                    <input type="tel" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)}
                                        className="block w-full px-4 py-3 text-gray-700 bg-gray-50 rounded-lg border border-[#e6c0e6] focus:ring-2 focus:ring-[#d78ac7] focus:border-[#d78ac7] transition placeholder-gray-400" placeholder="3001234567" />
                                </div>
                                <div className="pt-2">
                                    <label className="text-sm font-medium text-gray-700 mb-1 block">Dirección de Envío</label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2">
                                            <input type="text" value={street} onChange={e => setStreet(e.target.value)}
                                                className="block w-full px-4 py-3 text-gray-700 bg-gray-50 rounded-lg border border-[#e6c0e6] focus:ring-2 focus:ring-[#d78ac7] transition placeholder-gray-400" placeholder="Calle" />
                                        </div>
                                        <input type="text" value={streetNumber} onChange={e => setStreetNumber(e.target.value)}
                                            className="block w-full px-4 py-3 text-gray-700 bg-gray-50 rounded-lg border border-[#e6c0e6] focus:ring-2 focus:ring-[#d78ac7] transition placeholder-gray-400" placeholder="Número" />
                                        <input type="text" value={distric} onChange={e => setDistric(e.target.value)}
                                            className="block w-full px-4 py-3 text-gray-700 bg-gray-50 rounded-lg border border-[#e6c0e6] focus:ring-2 focus:ring-[#d78ac7] transition placeholder-gray-400" placeholder="Barrio" />
                                    </div>
                                </div>
                            </div>
                            <div className="mt-8">
                                <button type="submit" className="block w-full py-3 text-center text-white bg-[#a84aa7] rounded-lg shadow-md hover:bg-opacity-90 transition uppercase font-semibold">Crear Cuenta</button>
                            </div>
                        </form>
                        <p className="mt-6 text-center text-sm text-gray-600">
                            ¿Ya tienes una cuenta? <Link to="/login" className="text-[#a84aa7] font-bold hover:underline">Inicia Sesión</Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
