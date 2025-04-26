
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
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { UserRole } from '@shared/schema';
import { cn } from '@/lib/utils';

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
};

export function NavBar() {
  const { t } = useTranslation();
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Define navigation items
  const navItems: NavItem[] = [
    { href: '/dashboard', label: t('nav.dashboard'), icon: <LayoutDashboard className="h-5 w-5" /> },
    { href: '/actions', label: t('nav.actions'), icon: <ListTodo className="h-5 w-5" /> },
    { href: '/reports', label: t('nav.reports'), icon: <BarChart3 className="h-5 w-5" /> },
    { href: '/family', label: t('nav.family'), icon: <Users className="h-5 w-5" /> },
  ];

  // Only show suggestions for parents and heads
  if (user?.role !== UserRole.CHILD) {
    navItems.push({ 
      href: '/suggestions', 
      label: t('nav.suggestions'), 
      icon: <MessagesSquare className="h-5 w-5" /> 
    });
  }

  navItems.push({ href: '/settings', label: t('nav.settings'), icon: <Settings className="h-5 w-5" /> });

  useEffect(() => {
    // Close mobile menu when location changes
    setIsMobileMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">
            <span>FP</span>
          </div>
          <span className="ml-3 text-xl font-semibold hidden md:block">{t('app.name')}</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant={location === item.href ? "default" : "ghost"}
                className={cn(
                  "h-9",
                  location === item.href ? "bg-primary text-primary-foreground" : ""
                )}
                size="sm"
              >
                <span className="flex items-center">
                  {item.icon}
                  <span className="ml-2">{item.label}</span>
                </span>
              </Button>
            </Link>
          ))}
        </nav>

        {/* User and Language Controls */}
        <div className="hidden md:flex items-center space-x-2">
          <LanguageSwitch />
          {user && (
            <Button 
              variant="ghost" 
              className="text-sm text-red-600 ml-2"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 mr-2" />
              <span>{t('nav.logout')}</span>
            </Button>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </Button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t">
          <div className="container px-4 py-2">
            <nav className="grid gap-2">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={location === item.href ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start",
                      location === item.href ? "bg-primary text-primary-foreground" : ""
                    )}
                  >
                    <span className="flex items-center">
                      {item.icon}
                      <span className="ml-2">{item.label}</span>
                    </span>
                  </Button>
                </Link>
              ))}
              <div className="pt-2 border-t mt-2">
                <div className="flex items-center justify-between py-2">
                  <LanguageSwitch />
                  {user && (
                    <Button 
                      variant="ghost" 
                      className="text-sm text-red-600"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-5 w-5 mr-2" />
                      <span>{t('nav.logout')}</span>
                    </Button>
                  )}
                </div>
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
