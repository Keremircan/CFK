import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Brain, 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin,
  Github,
  Heart
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    platform: [
      { name: 'Ana Sayfa', path: '/' },
      { name: 'AI Chat', path: '/chat' },
      { name: 'Sınavlar', path: '/exams' },
      { name: 'Denemeler', path: '/tests' },
      { name: 'İstatistikler', path: '/statistics' },
    ],
    resources: [
      { name: 'YKS Hazırlık', path: '/exams' },
      { name: 'LGS Hazırlık', path: '/exams' },
      { name: 'Konu Anlatımları', path: '/tests' },
      { name: 'Deneme Sınavları', path: '/tests' },
    ],
    support: [
      { name: 'Yardım Merkezi', path: '/help' },
      { name: 'İletişim', path: '/contact' },
      { name: 'SSS', path: '/faq' },
      { name: 'Geri Bildirim', path: '/feedback' },
    ]
  };

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, href: 'https://facebook.com/cfkacademy' },
    { name: 'Twitter', icon: Twitter, href: 'https://twitter.com/cfkacademy' },
    { name: 'Instagram', icon: Instagram, href: 'https://instagram.com/cfkacademy' },
    { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com/company/cfk-academy' },
  ];

  return (
    <footer className="relative bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-pattern opacity-10"></div>
      
      <div className="relative z-10">
        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* Brand Section */}
            <div className="sm:col-span-3 md:col-span-3 lg:col-span-1">
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold gradient-text">CFK Academy</h3>
                  <p className="text-xs text-gray-400">AI Destekli Öğrenme</p>
                </div>
              </div>
              
              <p className="text-gray-300 text-sm mb-3 max-w-xs">
                Yapay zeka destekli öğrenme platformu ile YKS ve LGS sınavlarına hazırlanın.
              </p>
              
              {/* Contact Info */}
              <div className="space-y-1">
                <div className="flex items-center space-x-2 text-gray-300 text-xs">
                  <Mail className="w-3 h-3 text-purple-400" />
                  <span>info@cfkacademy.com</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-300 text-xs">
                  <Phone className="w-3 h-3 text-purple-400" />
                  <span>+90 (212) 555-0123</span>
                </div>
              </div>
            </div>

            {/* Platform Links */}
            <div className="sm:col-span-1 md:col-span-1 lg:col-span-1">
              <h4 className="text-sm font-semibold text-white mb-2">Platform</h4>
              <ul className="space-y-1">
                {footerLinks.platform.map((link) => (
                  <li key={link.name}>
                    <Link 
                      to={link.path}
                      className="text-gray-300 hover:text-white transition-colors duration-200 text-xs"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources Links */}
            <div className="sm:col-span-1 md:col-span-1 lg:col-span-1">
              <h4 className="text-sm font-semibold text-white mb-2">Kaynaklar</h4>
              <ul className="space-y-1">
                {footerLinks.resources.map((link) => (
                  <li key={link.name}>
                    <Link 
                      to={link.path}
                      className="text-gray-300 hover:text-white transition-colors duration-200 text-xs"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Links */}
            <div className="sm:col-span-1 md:col-span-1 lg:col-span-1">
              <h4 className="text-sm font-semibold text-white mb-2">Destek</h4>
              <ul className="space-y-1">
                {footerLinks.support.map((link) => (
                  <li key={link.name}>
                    <Link 
                      to={link.path}
                      className="text-gray-300 hover:text-white transition-colors duration-200 text-xs"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>


          </div>

          {/* Social Links & Copyright */}
          <div className="border-t border-white/10 mt-4 pt-2">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex space-x-3 mb-4 md:mb-0">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all duration-300 group"
                    >
                      <Icon className="w-4 h-4 text-gray-300 group-hover:text-white transition-colors duration-200" />
                    </a>
                  );
                })}
              </div>
              
              <div className="text-center md:text-right">
                <p className="text-gray-400 text-xs">
                  © {currentYear} CFK Academy. Tüm hakları saklıdır.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-1 md:space-y-0">
              <div className="flex items-center space-x-4 text-xs text-gray-400">
                <Link to="/privacy" className="hover:text-white transition-colors duration-200">
                  Gizlilik Politikası
                </Link>
                <Link to="/terms" className="hover:text-white transition-colors duration-200">
                  Kullanım Şartları
                </Link>
                <Link to="/cookies" className="hover:text-white transition-colors duration-200">
                  Çerez Politikası
                </Link>
              </div>
              
              <div className="flex items-center space-x-1 text-xs text-gray-400">
                <span>Made with</span>
                <Heart className="w-3 h-3 text-red-400 animate-pulse" />
                <span>by CFK Academy</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 