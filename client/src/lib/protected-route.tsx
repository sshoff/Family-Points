import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route, useLocation } from "wouter";

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
  const [, navigate] = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  if (!user) {
    // Redirect to auth page
    navigate("/auth");
    return null;
  }

  return <Component {...params} />;
}
