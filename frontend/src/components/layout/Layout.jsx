import React from 'react';
import Navigation from './Navigation';
import Footer from '../landing/Footer';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

const Layout = ({ children, transparentNav = false, showFooter = true }) => {
  const { user } = useAuth();
  const { currentLanguage, changeLanguage } = useLanguage();

  const handleLanguageChange = (langCode) => {
    changeLanguage(langCode);
  };

  const handleFooterLinkClick = (link) => {
    console.log('Footer link clicked:', link);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navigation transparent={transparentNav} />
      <main className="flex-grow">
        {children}
      </main>
      {showFooter && (
        <Footer
          currentLanguage={currentLanguage}
          onLanguageChange={handleLanguageChange}
          onLinkClick={handleFooterLinkClick}
        />
      )}
    </div>
  );
};

export default Layout;


