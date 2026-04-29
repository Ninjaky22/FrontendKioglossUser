import { Link } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb';

export default function About() {
    const promiseItems = [
        { icon: 'fa-gem', title: 'Selección curada', text: 'Marcas confiables' },
        { icon: 'fa-leaf', title: 'Rutina consciente', text: 'Productos que miman tu piel día a día.' },
        { icon: 'fa-truck-fast', title: 'Entrega nacional', text: 'Envíos seguros' },
        { icon: 'fa-headset', title: 'Soporte real', text: 'Acompañamiento cercano cuando lo necesites.' },
    ];

    const values = [
        { icon: 'fa-gem', title: 'Calidad', text: 'Productos seleccionados de las mejores marcas.' },
        { icon: 'fa-truck-fast', title: 'Envío Rápido', text: 'Entrega a todo el país con logística segura.' },
        { icon: 'fa-headset', title: 'Soporte', text: 'Atención personalizada y cercana 24/7.' },
    ];

    const steps = [
        { icon: 'fa-magnifying-glass', title: 'Curamos', text: 'Elegimos lo esencial para tu rutina.' },
        { icon: 'fa-bag-shopping', title: 'Preparamos', text: 'Empaques cuidados y listos para ti.' },
        { icon: 'fa-heart', title: 'Acompañamos', text: 'Sugerencias y tips con trato humano.' },
    ];

    return (
        <div className="relative min-h-screen bg-linear-to-b from-[#f5eaff] via-[#fdf4ff] to-[#fff7ff] font-winkySans">

            <Breadcrumb items={[
                { label: 'Inicio', path: '/', icon: 'fa-solid fa-house text-[#610361]' },
                { label: 'Sobre Nosotros' },
            ]} />

            <div className="container mx-auto px-4 py-12 sm:py-14 lg:py-16">
                <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-14 items-center">
                    <div className="space-y-6">
                        <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-1 text-[11px] sm:text-xs font-bold uppercase tracking-[0.35em] text-[#610361]">
                            Quiénes somos
                        </span>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#610361] font-swash tracking-tight">
                            Sobre Kiogloss
                        </h1>
                        <div className="space-y-4 text-sm sm:text-base lg:text-lg text-[#6d3a6f] leading-relaxed">
                            <p>
                                En <strong className="text-[#610361]">Kiogloss</strong>, nos dedicamos a ofrecer los mejores
                                productos de belleza y cuidado personal. Nuestra misión es hacer que cada persona se sienta
                                segura y hermosa con productos de alta calidad a precios accesibles.
                            </p>
                            <p>
                                Contamos con una amplia selección de productos que incluyen cuidado facial, maquillaje,
                                desmaquillantes, tónicos, cuidado capilar y herramientas de belleza profesionales.
                            </p>
                        </div>
                                            
                    </div>

                    <div className="relative">
                        <div className="absolute -top-6 -right-6 h-20 w-20 rounded-3xl bg-[#f7e4ff] blur-xl"></div>
                        <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-[#e7f1ff] blur-2xl"></div>

                        <div className="relative overflow-hidden rounded-3xl border border-[#f1d7ff] bg-white/80 p-6 sm:p-8 shadow-[0_20px_60px_rgba(97,3,97,0.12)]">
                            <div className="flex items-start gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-[#f7e4ff] flex items-center justify-center">
                                    <i className="fa-solid fa-heart text-[#9b30a0] text-xl"></i>
                                </div>
                                <div>
                                    <p className="text-[11px] uppercase tracking-[0.3em] text-[#a05aa0] font-bold">Nuestra promesa</p>
                                    <h2 className="text-2xl sm:text-3xl font-bold text-[#610361] font-swash">Belleza accesible y honesta</h2>
                                </div>
                            </div>

                            <p className="mt-4 text-sm sm:text-base text-[#6d3a6f] leading-relaxed">
                                Queremos que disfrutes productos confiables, fáciles de usar y con resultados que se noten,
                                siempre con una experiencia cálida y transparente.
                            </p>

                            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {promiseItems.map((item, i) => (
                                    <div
                                        key={i}
                                        className="rounded-2xl border border-[#f4d7ff] bg-white/70 px-4 py-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(97,3,97,0.12)]"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-2xl bg-[#f7e4ff] flex items-center justify-center">
                                                <i className={`fa-solid ${item.icon} text-[#9b30a0]`}></i>
                                            </div>
                                            <div>
                                                <p className="font-semibold text-[#610361] text-sm">{item.title}</p>
                                                <p className="text-xs text-[#7a4a7a] mt-1">{item.text}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 flex items-start gap-3 rounded-2xl bg-[#f7e4ff] border border-[#efd1ff] px-4 py-3">
                                <i className="fa-solid fa-shield text-[#9b30a0] mt-0.5"></i>
                                <p className="text-xs sm:text-sm text-[#6d3a6f] leading-relaxed">
                                    Pagos protegidos para que compres con confianza.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-12 sm:mt-16">
                    <div className="text-center space-y-2">
                        <p className="text-xs font-bold text-[#9b30a0] uppercase tracking-widest">Nuestros valores</p>
                        <h2 className="text-3xl sm:text-4xl font-bold text-[#610361] font-swash">Lo que nos mueve</h2>
                        <div className="w-12 h-1 bg-[#9b30a0] rounded-full mx-auto mt-3"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">
                        {values.map((item, i) => (
                            <div
                                key={i}
                                className="group flex flex-col items-center text-center p-6 rounded-2xl bg-white/80 border border-[#f4d7ff]
                                           shadow-[0_14px_35px_rgba(97,3,97,0.1)] transition-all duration-300 hover:-translate-y-1
                                           hover:bg-[#9b30a0] hover:border-[#9b30a0] hover:shadow-[0_18px_40px_rgba(97,3,97,0.18)]"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-[#f7e4ff] group-hover:bg-white/20 flex items-center justify-center mb-4 shadow-sm transition-colors duration-300">
                                    <i className={`fa-solid ${item.icon} text-2xl text-[#9b30a0] group-hover:text-white transition-colors duration-300`}></i>
                                </div>
                                <h3 className="font-bold text-[#610361] group-hover:text-white mb-1.5 transition-colors duration-300">{item.title}</h3>
                                <p className="text-sm sm:text-base text-[#7a4a7a] group-hover:text-purple-100 transition-colors duration-300">{item.text}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-12 sm:mt-16 lg:grid-cols-[0.95fr_1.05fr] gap-8 lg:gap-12 items-start">
                    <div className="rounded-3xl border border-[#f1d7ff] bg-linear-to-br from-white/90 via-white/70 to-[#f7e4ff]/60 p-6 sm:p-8 shadow-[0_18px_45px_rgba(97,3,97,0.1)]">
                        <div className="flex items-start gap-3 rounded-2xl bg-[#f7e4ff] px-4 py-3 ">
                            <i className="fa-solid fa-heart text-[#9b30a0] mt-1"></i>
                            <div>
                                <h3 className="text-2xl sm:text-3xl font-bold text-[#610361] font-swash">Gracias por confiar en nosotros</h3>
                                <p className="mt-2 text-sm sm:text-base text-[#6d3a6f] leading-relaxed">
                                    Estamos aquí para ayudarte a encontrar los productos perfectos para tu rutina de belleza.
                                    Si necesitas ayuda, estaremos encantados de acompañarte.
                                </p>
                            </div>
                        </div>
                        <div className="mt-6 flex flex-col sm:flex-row gap-3">
                            <Link
                                to="/contact"
                                className="inline-flex items-center justify-center rounded-xl bg-[#610361] px-6 py-3 text-white font-semibold shadow-[0_10px_22px_rgba(97,3,97,0.25)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#9b30a0]"
                            >
                                Escríbenos
                            </Link>
                            <Link
                                to="/shop"
                                className="inline-flex items-center justify-center rounded-xl border border-[#e6b7ff] bg-white/80 px-6 py-3 text-[#610361] font-semibold transition-all duration-300 hover:-translate-y-1 hover:bg-white"
                            >
                                Ver catálogo
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}