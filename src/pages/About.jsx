import Breadcrumb from '../components/Breadcrumb';

export default function About() {
    return (
        <div className="bg-[#F7E6FE]">
            <Breadcrumb items={[
                { label: 'Inicio', path: '/', icon: 'fa-solid fa-house text-[#610361]' },
                { label: 'Sobre Nosotros' },
            ]} />
            <div className="container py-12">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-4xl font-bold text-[#610361] font-swash mb-8 text-center">Sobre Kiogloss</h1>
                    <div className="bg-white rounded-xl shadow p-8 space-y-6 font-winkySans text-gray-700">
                        <p>
                            En <strong className="text-[#610361]">Kiogloss</strong>, nos dedicamos a ofrecer los mejores
                            productos de belleza y cuidado personal. Nuestra misión es hacer que cada persona se sienta
                            segura y hermosa con productos de alta calidad a precios accesibles.
                        </p>
                        <p>
                            Contamos con una amplia selección de productos que incluyen cuidado facial,
                            maquillaje, desmaquillantes, tónicos, cuidado capilar y herramientas de belleza profesionales.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6">
                            {[
                                { icon: 'fa-gem', title: 'Calidad', text: 'Productos seleccionados de las mejores marcas' },
                                { icon: 'fa-truck-fast', title: 'Envío Rápido', text: 'Entrega a todo el país' },
                                { icon: 'fa-headset', title: 'Soporte', text: 'Atención personalizada 24/7' },
                            ].map((item, i) => (
                                <div key={i} className="text-center p-4 rounded-lg bg-[#f3d5ff]">
                                    <i className={`fa-solid ${item.icon} text-3xl text-[#610361] mb-3`}></i>
                                    <h3 className="font-bold text-[#610361] mb-1">{item.title}</h3>
                                    <p className="text-sm">{item.text}</p>
                                </div>
                            ))}
                        </div>
                        <p>
                            Gracias por confiar en nosotros. ¡Estamos aquí para ayudarte a encontrar los productos
                            perfectos para tu rutina de belleza!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
