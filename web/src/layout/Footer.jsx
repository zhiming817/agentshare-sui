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
          

          

         

          {/* Contact */}

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
