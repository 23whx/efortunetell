'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { ExternalLink } from 'lucide-react';

export default function Footer() {
  const { t } = useLanguage();
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  // 如果是管理员页面，不显示页脚
  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* About Section */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">
              {t('footer.about')}
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              {t('footer.description')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">
              {t('footer.quickLinks')}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-gray-400 hover:text-[#FF6F61] transition-colors text-sm"
                >
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-gray-400 hover:text-[#FF6F61] transition-colors text-sm"
                >
                  {t('nav.blog')}
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="text-gray-400 hover:text-[#FF6F61] transition-colors text-sm"
                >
                  {t('nav.services')}
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-gray-400 hover:text-[#FF6F61] transition-colors text-sm"
                >
                  {t('nav.contact')}
                </Link>
              </li>
              <li>
                <Link
                  href="/donation"
                  className="text-pink-400 hover:text-pink-300 transition-colors text-sm font-semibold flex items-center gap-1"
                >
                  💖 {t('footer.donation')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">
              {t('footer.contact')}
            </h3>
            <ul className="space-y-2 text-sm">
              <li className="text-gray-400">
                <span className="font-semibold text-white">{t('footer.email')}:</span>{' '}
                <a
                  href="mailto:wanghongxiang23@gmail.com"
                  className="hover:text-[#FF6F61] transition-colors"
                >
                  wanghongxiang23@gmail.com
                </a>
              </li>
              <li className="text-gray-400">
                <span className="font-semibold text-white">X:</span>{' '}
                <a
                  href="https://x.com/Rollkey4"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#FF6F61] transition-colors inline-flex items-center gap-1"
                >
                  @Rollkey4
                  <ExternalLink size={12} />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Friendly Links Section */}
        <div className="border-t border-gray-700 pt-8 mb-8">
          <h3 className="text-lg font-bold text-white mb-4">
            {t('footer.friendlyLinks')}
          </h3>
          <div className="flex flex-wrap gap-4">
            <a
              href="https://oumashu.top/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 hover:border-[#FF6F61] transition-all duration-200 text-sm"
            >
              <span className="text-gray-300 hover:text-white transition-colors">
                {t('footer.toolsNavigation')}
              </span>
              <ExternalLink size={14} className="text-gray-400" />
            </a>
            <a
              href="https://acgn-personality-database.top/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 hover:border-[#FF6F61] transition-all duration-200 text-sm"
            >
              <span className="text-gray-300 hover:text-white transition-colors">
                {t('footer.acgnDatabase')}
              </span>
              <ExternalLink size={14} className="text-gray-400" />
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 pt-6 text-center">
          <p className="text-gray-400 text-sm">
            © {currentYear} {t('footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
}

