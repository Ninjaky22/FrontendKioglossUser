import { Link } from 'react-router-dom';

export default function Breadcrumb({ items = [{ label: 'Inicio', path: '/' }] }) {
    return (
        <div className="container py-4 flex items-center gap-3">
            {items.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                    {item.path ? (
                        <Link to={item.path} className="text-primary text-base hover:underline">
                            {item.icon ? <i className={item.icon}></i> : item.label}
                        </Link>
                    ) : (
                        <p className="text-gray-600 font-medium">{item.label}</p>
                    )}
                    {i < items.length - 1 && (
                        <span className="text-sm text-gray-400"><i className="fa-solid fa-chevron-right"></i></span>
                    )}
                </div>
            ))}
        </div>
    );
}
