export default function Footer() {
    return (
        <>
            <footer className="bg-[#610361] pt-16 pb-12">
                <div className="container">
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-4 md:gap-12 pb-10">
                        <div className="col-span-1 space-y-4">
                            <img src="/assets/images/logo.png" alt="logo" className="w-48 brightness-200" />
                            <p className="text-white/70 font-swash text-lg">Tu belleza, amplificada.</p>
                            <div className="flex space-x-5">
                                <a href="https://www.tiktok.com/@kiogloss" className="text-white/70 hover:text-white hover:-translate-y-1 transition-all duration-300" target="_blank" rel="noopener noreferrer"><i className="fa-brands fa-tiktok text-2xl"></i></a>
                                <a href="https://www.instagram.com/kio_gloss/?hl=es" className="text-white/70 hover:text-white hover:-translate-y-1 transition-all duration-300" target="_blank" rel="noopener noreferrer"><i className="fa-brands fa-instagram text-2xl"></i></a>
                                <a href="https://api.whatsapp.com/message/X7QVYQOJXRFUA1?autoload=1&app_absent=0" className="text-white/70 hover:text-white hover:-translate-y-1 transition-all duration-300" target="_blank" rel="noopener noreferrer"><i className="fa-brands fa-whatsapp text-2xl"></i></a>
                            </div>
                        </div>
                        <div className="col-span-1">
                            <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-surfer">Redirecciones</h3>
                            <div className="mt-4 space-y-3">
                                <a href="/" className="text-lg text-white/70 hover:text-white hover:translate-x-1 transition-all duration-300 block font-winkySans">Inicio</a>
                                <a href="/shop" className="text-lg text-white/70 hover:text-white hover:translate-x-1 transition-all duration-300 block font-winkySans">Productos</a>
                                <a href="/wishlist" className="text-lg text-white/70 hover:text-white hover:translate-x-1 transition-all duration-300 block font-winkySans">Lista de deseos</a>
                                <a href="/cart" className="text-lg text-white/70 hover:text-white hover:translate-x-1 transition-all duration-300 block font-winkySans">Carrito</a>
                                <a href="/about" className="text-lg text-white/70 hover:text-white hover:translate-x-1 transition-all duration-300 block font-winkySans">Sobre Nosotros</a>
                                <a href="/contact" className="text-lg text-white/70 hover:text-white hover:translate-x-1 transition-all duration-300 block font-winkySans">Contáctanos</a>
                            </div>
                        </div>
                        <div className="col-span-1">
                            <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-surfer">Tu cuenta</h3>
                            <div className="mt-4 space-y-3">
                                <a href="/login" className="text-lg text-white/70 hover:text-white hover:translate-x-1 transition-all duration-300 block font-winkySans">Inicia Sesión</a>
                                <a href="/register" className="text-lg text-white/70 hover:text-white hover:translate-x-1 transition-all duration-300 block font-winkySans">Registrate</a>
                                <a href="/account" className="text-lg text-white/70 hover:text-white hover:translate-x-1 transition-all duration-300 block font-winkySans">Cuenta</a>
                            </div>
                        </div>
                        <div className="col-span-1">
                            <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-surfer">Información</h3>
                            <div className="mt-4 space-y-3">
                                <span className="text-lg text-white/70 block font-winkySans"><i className="fa-solid fa-location-dot mr-2"></i>Campestre D mz 12 Casa 24</span>
                                <span className="text-lg text-white/70 block font-winkySans"><i className="fa-regular fa-clock mr-2"></i>Lunes a Domingo de 9 am a 7 pm</span>
                            </div>
                        </div>
                    </div>
                    <div className="w-full pt-4 border-t border-white/20">
                        <iframe src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d295.49213626279305!2d-75.68478017567728!3d4.829601343349051!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2s!5e0!3m2!1ses-419!2sco!4v1762900268126!5m2!1ses-419!2sco"
                            width="100%" height="200" style={{ border: 0, borderRadius: '10px' }} allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
                    </div>
                </div>
            </footer>
            <div className="bg-[#3d0240] py-4">
                <div className="container flex items-center justify-between">
                    <p className="text-white/60 text-sm">&copy; Kio Gloss - Todos los derechos reservados</p>
                    <img src="/assets/images/methods.png" alt="methods" className="h-5" />
                </div>
            </div>
        </>
    );
}
