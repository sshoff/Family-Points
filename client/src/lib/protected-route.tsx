import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Route, useLocation, useRouter } from "wouter";
import { useEffect } from "react";

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  return (
    <Route path={path}>
      {(params) => <ProtectedComponent component={Component} params={params} />}
    </Route>
  );
}

function ProtectedComponent({
  component: Component,
  params,
}: {
  component: () => React.JSX.Element;
  params: any;
}) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Use an effect to handle navigation and avoid setState during render
  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/auth");
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  // Don't render the component if we're not authenticated
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  return <Component {...params} />;
}
