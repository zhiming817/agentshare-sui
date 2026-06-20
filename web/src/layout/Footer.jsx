import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const translations = {
  zh: {
    tagline: '分享、发现 AI Agent 的精彩对话。',
    platform: '平台',
    browse: '浏览对话',
    skills: '技能市场',
    popular: '热门排行',
    resources: '资源',
    github: 'GitHub',
    apiDocs: 'API 文档',
    register: '注册账号',
    contact: '联系我们',
    issues: 'GitHub Issues',
    builtWith: '使用 React & Sui 构建',
    copyright: 'Agent Share'
  },
  en: {
    tagline: 'Share and discover amazing AI Agent conversations.',
    platform: 'Platform',
    browse: 'Browse Conversations',
    skills: 'Skill Market',
    popular: 'Popular Rankings',
    resources: 'Resources',
    github: 'GitHub',
    apiDocs: 'API Docs',
    register: 'Register Account',
    contact: 'Contact Us',
    issues: 'GitHub Issues',
    builtWith: 'Built with React & Sui',
    copyright: 'Agent Share'
  }
};

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'zh');

  useEffect(() => {
    const handleStorageChange = () => {
      setLang(localStorage.getItem('lang') || 'zh');
    };
    window.addEventListener('storage', handleStorageChange);
    
    // 定时检查 localStorage，实现同窗口同步切换语言
    const interval = setInterval(() => {
      const currentLang = localStorage.getItem('lang') || 'zh';
      if (currentLang !== lang) setLang(currentLang);
    }, 500);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [lang]);

  const t = translations[lang];

  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-2 rounded-lg">
                <span className="text-white text-xl font-bold">🏦</span>
              </div>
              <span className="text-xl font-bold text-gray-900">AgentShare</span>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              {t.tagline}
            </p>
          </div>

          {/* Platform */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              {t.platform}
            </h3>
            <ul className="space-y-3 font-medium">
              <li>
                <Link to="/resumes/browse" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  {t.browse}
                </Link>
              </li>
              <li>
                <Link to="/templates" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  {t.skills}
                </Link>
              </li>
              <li>
                <Link to="/resumes/browse?sort=popular" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  {t.popular}
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              {t.resources}
            </h3>
            <ul className="space-y-3 font-medium">
              <li>
                <a
                  href="https://github.com/dctongsheng/agentshare"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors flex items-center space-x-1"
                >
                  <span>{t.github}</span>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {t.apiDocs}
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              {t.contact}
            </h3>
            <ul className="space-y-3 font-medium">
              <li>
                <a
                  href="https://github.com/dctongsheng/agentshare"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors flex items-center space-x-1"
                >
                  <span>{t.issues}</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500">
          <span>&copy; {currentYear} {t.copyright}</span>
          <span className="mt-2 md:mt-0">{t.builtWith}</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
