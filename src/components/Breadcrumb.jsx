import { Link } from 'react-router-dom';

export default function Breadcrumb({ items = [{ label: 'Inicio', path: '/' }] }) {
    return (
        <div className="container py-4 flex flex-wrap items-center gap-2 md:gap-3 font-winkySans font-medium text-sm md:text-base">
            {items.map((item, i) => (
                <div key={i} className="flex items-center gap-2 md:gap-3">
                    {item.path ? (
                        <Link to={item.path} className="text-primary hover:text-[#9b30a0] transition">
                            {item.icon ? <i className={item.icon}></i> : item.label}
                        </Link>
                    ) : (
                        <p className="text-gray-600 font-medium truncate max-w-[150px] sm:max-w-xs">{item.label}</p>
                    )}
                    {i < items.length - 1 && (
                        <span className="text-xs md:text-sm text-gray-400"><i className="fa-solid fa-chevron-right"></i></span>
                    )}
                </div>
            ))}
        </div>
    );
}
