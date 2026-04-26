import ContactForm from '../components/ContactForm';
import Breadcrumb from '../components/Breadcrumb';

export default function Contact() {
    return (
        <div className="bg-[#F7E6FE font-winkySans">
            <Breadcrumb items={[
                { label: 'Inicio', path: '/', icon: 'fa-solid fa-house text-[#610361]' },
                { label: 'Contacto' },
            ]} />
            <ContactForm />
        </div>
    );
}
