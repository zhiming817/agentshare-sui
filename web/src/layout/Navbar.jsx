import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCurrentAccount, ConnectButton } from '@mysten/dapp-kit';

const translations = {
  zh: {
    home: '首页',
    explore: '浏览',
    upload: '上传',
    // skills: '技能',
    // token: '代币',
    // roadmap: '路线图',
    // ppt: 'PPT',
    allowlist: '🔐 权限列表',
    connected: '已连接',
    createVault: '创建保险库'
  },
  en: {
    home: 'Home',
    explore: 'Explore',
    upload: 'Upload',
    // skills: 'Skills',
    // token: 'Token',
    // roadmap: 'Roadmap',
    // ppt: 'PPT',
    allowlist: '🔐 Allowlist',
    connected: 'Connected',
    createVault: 'Create Vault'
  }
};

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'zh');
  const navigate = useNavigate();
  const location = useLocation();
  const currentAccount = useCurrentAccount();

  useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);

  const t = translations[lang];

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const navigation = [
    { name: t.explore, href: '/conversations' },
    { name: t.upload, href: '/conversation/create' },
    { name: t.skills, href: '/templates' },
    { name: t.token, href: '/token' },
    { name: t.roadmap, href: '/roadmap' },
    { name: t.ppt, href: '/pitch.html', external: true },
    { name: t.allowlist, href: '/allowlist' },
  ];

  const createItems = [
    { name: t.createVault, href: '/conversation/create' },
  ];

  const isActive = (href) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname === href;
  };

  const handleNavigation = (href, external) => {
    if (external) {
      window.open(href, '_blank');
    } else {
      navigate(href);
    }
    setIsMenuOpen(false);
  };

  const toggleLang = () => {
    setLang(lang === 'zh' ? 'en' : 'zh');
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm bg-white/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <button
            onClick={() => handleNavigation('/')}
            className="flex items-center space-x-2 cursor-pointer"
          >
            <div className="p-1 rounded-lg">
              <img src="/logo.svg" alt="AgentShare Logo" className="w-10 h-10" />
            </div>
            <span className="text-xl font-bold text-gray-900">AgentShare</span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-8">
            {navigation.map((item) => (
              <button
                key={item.href}
                onClick={() => handleNavigation(item.href, item.external)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1 ${
                  isActive(item.href)
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span>{item.name}</span>
              </button>
            ))}
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Language Switcher */}
            <button
              onClick={toggleLang}
              className="px-2 py-1 text-xs font-bold border border-gray-300 rounded hover:bg-gray-100 transition-colors uppercase"
            >
              {lang === 'zh' ? 'EN' : '中文'}
            </button>

            {currentAccount ? (
              <div className="flex items-center space-x-3">
                <div className="text-right hidden lg:block">
                  <div className="text-sm font-medium text-gray-900">
                    {formatAddress(currentAccount.address)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {t.connected}
                  </div>
                </div>
                <ConnectButton />
              </div>
            ) : (
              <ConnectButton />
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            >
              {isMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 pt-4 pb-4">
            <div className="space-y-2">
              {navigation.map((item) => (
                <button
                  key={item.href}
                  onClick={() => handleNavigation(item.href, item.external)}
                  className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors flex items-center space-x-2 ${
                    isActive(item.href)
                      ? 'text-indigo-600 bg-indigo-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
