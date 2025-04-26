import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing-page";
import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/dashboard-page";
import ActionsPage from "@/pages/actions-page";
import ReportsPage from "@/pages/reports-page";
import FamilyPage from "@/pages/family-page";
import SuggestionsPage from "@/pages/suggestions-page";
import SettingsPage from "@/pages/settings-page";

// Simple app with all routes (but without authentication for now)
function App() {
  return (
    <TooltipProvider>
      <Toaster />
      <div className="min-h-screen bg-gray-50">
        <Switch>
          <Route path="/" component={LandingPage} />
          <Route path="/auth" component={AuthPage} />
          <Route path="/dashboard" component={DashboardPage} />
          <Route path="/actions" component={ActionsPage} />
          <Route path="/reports" component={ReportsPage} />
          <Route path="/family" component={FamilyPage} />
          <Route path="/suggestions" component={SuggestionsPage} />
          <Route path="/settings" component={SettingsPage} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </TooltipProvider>
  );
}

export default App;
