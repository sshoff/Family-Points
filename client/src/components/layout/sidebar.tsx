import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/use-auth';
import { LanguageSwitch } from './language-switch';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  ListTodo, 
  BarChart3, 
  Users, 
  MessagesSquare, 
  Settings, 
  LogOut 
} from 'lucide-react';
import { UserRole } from '@shared/schema';

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
};

export const Sidebar = () => {
  const { t } = useTranslation();
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems: NavItem[] = [
    { href: '/', label: t('nav.dashboard'), icon: <LayoutDashboard className="h-5 w-5 mr-3" /> },
    { href: '/actions', label: t('nav.actions'), icon: <ListTodo className="h-5 w-5 mr-3" /> },
    { href: '/reports', label: t('nav.reports'), icon: <BarChart3 className="h-5 w-5 mr-3" /> },
    { href: '/family', label: t('nav.family'), icon: <Users className="h-5 w-5 mr-3" /> },
  ];

  // Only show suggestions for parents and heads
  if (user?.role !== UserRole.CHILD) {
    navItems.push({ 
      href: '/suggestions', 
      label: t('nav.suggestions'), 
      icon: <MessagesSquare className="h-5 w-5 mr-3" /> 
    });
  }

  navItems.push({ href: '/settings', label: t('nav.settings'), icon: <Settings className="h-5 w-5 mr-3" /> });

  useEffect(() => {
    // Close mobile menu when location changes
    setIsMobileMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="fixed top-0 left-0 z-50 block lg:hidden">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-4 text-gray-500 focus:outline-none"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out transform ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 z-40`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold">FP</div>
              <span className="ml-3 text-xl font-semibold">{t('app.name')}</span>
            </div>
          </div>

          {/* User Info */}
          {user && (
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-gray-600">{getInitials(user.name)}</span>
                </div>
                <div className="ml-3">
                  <p className="font-medium text-sm">{user.name}</p>
                  <div className="flex items-center">
                    <span className="text-xs px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full">
                      {t(`roles.${user.role}`)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="px-4 py-2 flex-grow">
            <ul>
              {navItems.map((item) => (
                <li key={item.href} className="my-1">
                  <Link href={item.href}>
                    <a
                      className={`flex items-center px-4 py-2 rounded-md ${
                        location === item.href
                          ? 'bg-primary-100 text-primary-600'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className="ml-auto bg-accent-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer actions */}
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <LanguageSwitch />
              <Button 
                variant="ghost" 
                className="text-sm text-red-600 flex items-center"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5 mr-2" />
                <span>{t('nav.logout')}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
