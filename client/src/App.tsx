import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing-page";

// Simple app that just shows the landing page for now
function App() {
  return (
    <TooltipProvider>
      <Toaster />
      <div className="min-h-screen bg-gray-50">
        <Switch>
          <Route path="/" component={LandingPage} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </TooltipProvider>
  );
}

export default App;
