export default function Footer() {
    return (
        <>
            <footer className="bg-[#610361] relative overflow-hidden">

                {/* Decorative top gradient border */}
                <div className="w-full h-1 bg-linear-to-r from-transparent via-pink-300/60 to-transparent" />

                {/* Subtle background decoration */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-purple-400/10 blur-3xl" />
                    <div className="absolute -bottom-12 -left-12 w-56 h-56 rounded-full bg-pink-400/10 blur-3xl" />
                </div>

                <div className="relative container px-6 pt-14 pb-10 mx-auto max-w-6xl">

                    {/* ── GRID PRINCIPAL ── */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 pb-10">

                        {/* ── Columna 1: Brand ── */}
                        <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-5 sm:col-span-2 lg:col-span-1">
                            <img
                                src="/assets/images/logo.png"
                                alt="Kio Gloss"
                                className="w-44 brightness-200 drop-shadow-lg"
                            />
                            <p className="text-white font-winkySans font-medium text-lg leading-snug max-w-[230px]">
                                Tu belleza, amplificada.
                            </p>
                            {/* Social icons */}
                            <div className="flex items-center gap-5 pt-1">
                                <a
                                    href="https://www.tiktok.com/@kiogloss"
                                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white hover:-translate-y-1 transition-all duration-300"
                                    target="_blank" rel="noopener noreferrer"
                                    aria-label="TikTok"
                                >
                                    <i className="fa-brands fa-tiktok text-lg" />
                                </a>
                                <a
                                    href="https://www.instagram.com/kio_gloss/?hl=es"
                                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white hover:-translate-y-1 transition-all duration-300"
                                    target="_blank" rel="noopener noreferrer"
                                    aria-label="Instagram"
                                >
                                    <i className="fa-brands fa-instagram text-lg" />
                                </a>
                                <a
                                    href="https://api.whatsapp.com/message/X7QVYQOJXRFUA1?autoload=1&app_absent=0"
                                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white hover:-translate-y-1 transition-all duration-300"
                                    target="_blank" rel="noopener noreferrer"
                                    aria-label="WhatsApp"
                                >
                                    <i className="fa-brands fa-whatsapp text-lg" />
                                </a>
                            </div>
                        </div>

                        {/* ── Columna 2: Redirecciones ── */}
                        <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                            <h3 className="text-sm font-bold text-white uppercase tracking-widest font-winkySans mb-4 after:block after:w-8 after:h-0.5 after:bg-pink-300/60 after:mt-2 after:mx-auto sm:after:mx-0">
                                Redirecciones
                            </h3>
                            <nav className="space-y-2.5">
                                {[
                                    { href: "/", label: "Inicio" },
                                    { href: "/shop", label: "Productos" },
                                    { href: "/wishlist", label: "Lista de deseos" },
                                    { href: "/cart", label: "Carrito" },
                                    { href: "/about", label: "Sobre Nosotros" },
                                    { href: "/contact", label: "Contáctanos" },
                                ].map(({ href, label }) => (
                                    <a
                                        key={href}
                                        href={href}
                                        className="text-base text-white/65 hover:text-white hover:translate-x-1 transition-all duration-300 flex items-center gap-1.5 justify-center sm:justify-start font-winkySans group"
                                    >
                                        <span className="w-0 group-hover:w-3 overflow-hidden transition-all duration-300 text-pink-300 text-xs">›</span>
                                        {label}
                                    </a>
                                ))}
                            </nav>
                        </div>

                        {/* ── Columna 3: Tu cuenta ── */}
                        <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                            <h3 className="text-sm font-bold text-white uppercase tracking-widest font-winkySans mb-4 after:block after:w-8 after:h-0.5 after:bg-pink-300/60 after:mt-2 after:mx-auto sm:after:mx-0">
                                Tu cuenta
                            </h3>
                            <nav className="space-y-2.5">
                                {[
                                    { href: "/login", label: "Inicia Sesión" },
                                    { href: "/register", label: "Registrate" },
                                    { href: "/account", label: "Cuenta" },
                                ].map(({ href, label }) => (
                                    <a
                                        key={href}
                                        href={href}
                                        className="text-base text-white/65 hover:text-white hover:translate-x-1 transition-all duration-300 flex items-center gap-1.5 justify-center sm:justify-start font-winkySans group"
                                    >
                                        <span className="w-0 group-hover:w-3 overflow-hidden transition-all duration-300 text-pink-300 text-xs">›</span>
                                        {label}
                                    </a>
                                ))}
                            </nav>
                        </div>

                        {/* ── Columna 4: Información ── */}
                        <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                            <h3 className="text-sm font-bold text-white uppercase tracking-widest font-winkySans mb-4 after:block after:w-8 after:h-0.5 after:bg-pink-300/60 after:mt-2 after:mx-auto sm:after:mx-0">
                                Información
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-start gap-3 justify-center sm:justify-start">
                                    <span className="mt-0.5 w-8 h-8 shrink-0 flex items-center justify-center rounded-full bg-white/10 text-pink-200">
                                        <i className="fa-solid fa-location-dot text-sm" />
                                    </span>
                                    <span className="text-base text-white/65 font-winkySans leading-snug">
                                        Campestre D mz 12 Casa 24
                                    </span>
                                </div>
                                <div className="flex items-start gap-3 justify-center sm:justify-start">
                                    <span className="mt-0.5 w-8 h-8 shrink-0 flex items-center justify-center rounded-full bg-white/10 text-pink-200">
                                        <i className="fa-regular fa-clock text-sm" />
                                    </span>
                                    <span className="text-base text-white/65 font-winkySans leading-snug">
                                        Lunes a Domingo<br />9 am – 7 pm
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Mapa ── */}
                    <div className="border-t border-white/15 pt-8">
                        <p className="text-xs text-white font-medium uppercase tracking-widest font-winkySans mb-3 text-center">
                            ¿Cómo llegar?
                        </p>
                        <div className="overflow-hidden rounded-2xl shadow-xl shadow-black/30">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d295.49213626279305!2d-75.68478017567728!3d4.829601343349051!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2s!5e0!3m2!1ses-419!2sco!4v1762900268126!5m2!1ses-419!2sco"
                                width="100%"
                                height="200"
                                style={{ border: 0, display: "block" }}
                                allowFullScreen=""
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Ubicación Kio Gloss"
                            />
                        </div>
                    </div>
                </div>
            </footer>

            {/* ── Copyright bar ── */}
            <div className="bg-[#3d0240] py-4 border-t border-white/10">
                <div className="container mx-auto max-w-6xl px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-white/50 text-sm font-winkySans text-center sm:text-left">
                        &copy; {new Date().getFullYear()} Kio Gloss — Todos los derechos reservados
                    </p>
                    <img
                        src="/assets/images/methods.png"
                        alt="Métodos de pago"
                        className="h-5 opacity-70"
                    />
                </div>
            </div>
        </>
    );
}