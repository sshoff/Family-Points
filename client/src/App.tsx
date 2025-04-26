import { Switch, Route, Redirect } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/hooks/use-auth";
import { useAuth } from "@/hooks/use-auth";
import { queryClient } from "@/lib/queryClient";
import { ProtectedRoute } from "@/lib/protected-route";
import { NavBar } from "@/components/layout/nav-bar";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing-page";
import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/dashboard-page";
import ActionsPage from "@/pages/actions-page";
import ReportsPage from "@/pages/reports-page";
import FamilyPage from "@/pages/family-page";
import SuggestionsPage from "@/pages/suggestions-page";
import SettingsPage from "@/pages/settings-page";

// Layout component that includes the NavBar
function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  // Only show navbar if user is authenticated
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {user && <NavBar />}
      <main className="flex-1 container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}

// Root route that redirects to dashboard if authenticated
function RootRedirect() {
  const { user } = useAuth();
  return user ? <Redirect to="/dashboard" /> : <LandingPage />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <AppLayout>
            <Switch>
              <Route path="/" component={RootRedirect} />
              <Route path="/auth" component={AuthPage} />
              <ProtectedRoute path="/dashboard" component={DashboardPage} />
              <ProtectedRoute path="/actions" component={ActionsPage} />
              <ProtectedRoute path="/reports" component={ReportsPage} />
              <ProtectedRoute path="/family" component={FamilyPage} />
              <ProtectedRoute path="/suggestions" component={SuggestionsPage} />
              <ProtectedRoute path="/settings" component={SettingsPage} />
              <Route component={NotFound} />
            </Switch>
          </AppLayout>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
