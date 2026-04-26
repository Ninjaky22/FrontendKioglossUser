import Breadcrumb from '../components/Breadcrumb';

export default function About() {
    return (
        <div className="min-h-screen bg-linear-to-b from-[#f5eaff] to-[#fdf4ff] font-winkySans">
            <Breadcrumb items={[
                { label: 'Inicio', path: '/', icon: 'fa-solid fa-house text-[#610361]' },
                { label: 'Sobre Nosotros' },
            ]} />

            <div className="container py-14">
                <div className="max-w-3xl mx-auto space-y-8">

                    {/* ── Título ── */}
                    <div className="text-center space-y-2">
                        <p className="text-xs font-bold text-[#9b30a0] uppercase tracking-widest">Quiénes somos</p>
                        <h1 className="text-5xl font-bold text-[#610361] font-swash">Sobre Kiogloss</h1>
                        <div className="w-12 h-1 bg-[#9b30a0] rounded-full mx-auto mt-3"></div>
                    </div>

                    {/* ── Card principal ── */}
                    <div className="bg-white rounded-3xl shadow-sm border border-purple-100/60 overflow-hidden">

                        {/* Texto intro */}
                        <div className="px-8 pt-8 pb-6 space-y-4 text-gray-600 leading-relaxed text-[20px]">
                            <p>
                                En <strong className="text-[#610361]">Kiogloss</strong>, nos dedicamos a ofrecer los mejores
                                productos de belleza y cuidado personal. Nuestra misión es hacer que cada persona se sienta
                                segura y hermosa con productos de alta calidad a precios accesibles.
                            </p>
                            <p>
                                Contamos con una amplia selección de productos que incluyen cuidado facial,
                                maquillaje, desmaquillantes, tónicos, cuidado capilar y herramientas de belleza profesionales.
                            </p>
                        </div>

                        {/* Divisor */}
                        <div className="mx-8 border-t border-purple-50"></div>

                        {/* ── Cards de valores ── */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 p-8">
                            {[
                                { icon: 'fa-gem',       title: 'Calidad',      text: 'Productos seleccionados de las mejores marcas' },
                                { icon: 'fa-truck-fast', title: 'Envío Rápido', text: 'Entrega a todo el país' },
                                { icon: 'fa-headset',   title: 'Soporte',      text: 'Atención personalizada 24/7' },
                            ].map((item, i) => (
                                <div key={i} className="group flex flex-col items-center text-center p-6 rounded-2xl bg-purple-50 border border-purple-100 hover:bg-[#9b30a0] hover:border-[#9b30a0] hover:shadow-lg hover:shadow-purple-200 hover:-translate-y-1 transition-all duration-300">
                                    <div className="w-14 h-14 rounded-2xl bg-white group-hover:bg-white/20 flex items-center justify-center mb-4 shadow-sm transition-colors duration-300">
                                        <i className={`fa-solid ${item.icon} text-2xl text-[#9b30a0] group-hover:text-white transition-colors duration-300`}></i>
                                    </div>
                                    <h3 className="font-bold text-[#610361] group-hover:text-white mb-1.5 transition-colors duration-300">{item.title}</h3>
                                    <p className="text-[20px] text-gray-500 group-hover:text-purple-100 transition-colors duration-300">{item.text}</p>
                                </div>
                            ))}
                        </div>

                        {/* Divisor */}
                        <div className="mx-8 border-t border-purple-50"></div>

                        {/* Cierre */}
                        <div className="px-8 py-6">
                            <div className="flex items-start gap-3 bg-purple-50 border border-purple-100 rounded-2xl px-5 py-4">
                                <i className="fa-solid fa-heart text-[#9b30a0] mt-0.5 shrink-0"></i>
                                <p className="text-[15px] text-gray-600 leading-relaxed">
                                    Gracias por confiar en nosotros. ¡Estamos aquí para ayudarte a encontrar los productos
                                    perfectos para tu rutina de belleza!
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}