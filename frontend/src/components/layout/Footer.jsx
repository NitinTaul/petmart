import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="bg-gray-900 text-gray-300 mt-16">
    <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">🐾</span>
          <span className="font-display font-bold text-xl text-white">PetMart</span>
        </div>
        <p className="text-sm text-gray-400 leading-relaxed">India's most loved online pet store. Premium products for your beloved pets.</p>
        <div className="flex gap-3 mt-4">
          {['📘','📷','🐦','▶️'].map(icon => (
            <button key={icon} className="w-9 h-9 bg-gray-800 hover:bg-primary rounded-full flex items-center justify-center transition-colors text-sm">{icon}</button>
          ))}
        </div>
      </div>

      {[
        { title: 'Shop', links: [['Dogs', '/products?pet_type=dog'], ['Cats', '/products?pet_type=cat'], ['Pharmacy', '/products?category=health'], ['Grooming', '/products?category=grooming']] },
        { title: 'Help', links: [['My Orders', '/orders'], ['Track Order', '/orders'], ['Returns', '#'], ['Contact Us', '#']] },
        { title: 'Company', links: [['About Us', '#'], ['Blog', '#'], ['Careers', '#'], ['Privacy Policy', '#']] },
      ].map(({ title, links }) => (
        <div key={title}>
          <h4 className="font-semibold text-white mb-4">{title}</h4>
          <ul className="space-y-2">
            {links.map(([label, href]) => (
              <li key={label}><Link to={href} className="text-sm hover:text-primary transition-colors">{label}</Link></li>
            ))}
          </ul>
        </div>
      ))}
    </div>

    <div className="border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-2 text-xs text-gray-500">
        <p>© 2025 PetMart. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <span>🔒 100% Secure Payments</span>
          <span>🚚 Fast Delivery</span>
          <span>✅ Authentic Products</span>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
