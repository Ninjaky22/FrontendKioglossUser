import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const navigate = useNavigate();
    const { login, isAuthenticated } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    // Redirect if already logged in
    useEffect(() => {
        if (isAuthenticated) navigate('/account');
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login(email, password);
            navigate('/account');
        } catch (err) {
            setError(err.response?.status === 401 ? 'Credenciales incorrectas' : 'Error al iniciar sesión');
        }
    };

    return (
        <>
            <div className="container py-4 flex items-center gap-3">
                <Link to="/" className="text-primary text-base"><i className="fa-solid fa-house"></i></Link>
                <span className="text-sm text-gray-400"><i className="fa-solid fa-chevron-right"></i></span>
                <p className="text-gray-600 font-medium">Login</p>
            </div>
            <div className="bg-gray-50 py-16">
                <div className="container flex items-center justify-center">
                    <div className="max-w-md w-full bg-white p-8 md:p-10 rounded-xl shadow-xl">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-extrabold text-gray-900 mt-4">Inicia Sesión</h2>
                            <p className="text-gray-500 mt-2 text-sm">¡Bienvenido de nuevo!</p>
                        </div>
                        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">{error}</div>}
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-6">
                                <div>
                                    <label htmlFor="email" className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
                                    <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required
                                        className="block w-full px-4 py-3 text-gray-700 bg-gray-50 rounded-lg border border-[#e6c0e6] focus:ring-2 focus:ring-[#d78ac7] focus:border-[#d78ac7] transition placeholder-gray-400"
                                        placeholder="tucorreo@dominio.com" />
                                </div>
                                <div>
                                    <label htmlFor="password" className="text-sm font-medium text-gray-700 mb-1 block">Password</label>
                                    <div className="relative">
                                        <input type={showPassword ? 'text' : 'password'} id="password" value={password} onChange={e => setPassword(e.target.value)} required
                                            className="block w-full px-4 py-3 text-gray-700 bg-gray-50 rounded-lg border border-[#e6c0e6] focus:ring-2 focus:ring-[#d78ac7] focus:border-[#d78ac7] transition pr-12"
                                            placeholder="*****" />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 flex items-center justify-center h-full w-12 text-gray-500 hover:text-[#a84aa7]">
                                            <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-8">
                                <button type="submit" className="block w-full py-3 text-center text-white bg-[#a84aa7] rounded-lg shadow-md hover:bg-opacity-90 transition uppercase font-semibold">
                                    Login
                                </button>
                            </div>
                        </form>
                        <p className="mt-6 text-center text-sm text-gray-600">
                            ¿No tienes una cuenta? <Link to="/register" className="text-[#a84aa7] font-bold hover:underline">Regístrate ahora</Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
