import { useEffect, Component, ErrorInfo, ReactNode } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Home from "@/pages/home";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import Library from "@/pages/library";
import Create from "@/pages/create";
import Edit from "@/pages/edit";
import Play from "@/pages/play";
import Stats from "@/pages/stats";
import Leaderboard from "@/pages/leaderboard";
import Profile from "@/pages/profile";
import Groups from "@/pages/groups";
import CreateGroup from "@/pages/create-group";
import GroupDetail from "@/pages/group-detail";
import GroupLeaderboard from "@/pages/group-leaderboard";
import GroupResults from "@/pages/group-results";
import NotFound from "@/pages/not-found";

class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <Card className="max-w-md w-full border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Something went wrong</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                {this.state.error?.message || "An unexpected error occurred"}
              </p>
              <div className="flex gap-2">
                <Button onClick={() => window.location.reload()}>
                  Refresh Page
                </Button>
                <Button
                  variant="outline"
                  onClick={() => this.setState({ hasError: false, error: null })}
                >
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    window.location.href = "/login";
    return null;
  }

  return <Component />;
}

function ProtectedRouteWrapper({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/login");
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function Router() {
  const { user, isLoading } = useAuth();

  // Always define routes, but protect authenticated routes
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/library">
        <ProtectedRouteWrapper>
          <Library />
        </ProtectedRouteWrapper>
      </Route>
      <Route path="/create">
        <ProtectedRouteWrapper>
          <Create />
        </ProtectedRouteWrapper>
      </Route>
      <Route path="/edit/:id">
        <ProtectedRouteWrapper>
          <Edit />
        </ProtectedRouteWrapper>
      </Route>
      <Route path="/play/:id">
        <ProtectedRouteWrapper>
          <Play />
        </ProtectedRouteWrapper>
      </Route>
      <Route path="/stats">
        <ProtectedRouteWrapper>
          <Stats />
        </ProtectedRouteWrapper>
      </Route>
      <Route path="/leaderboard">
        <ProtectedRouteWrapper>
          <Leaderboard />
        </ProtectedRouteWrapper>
      </Route>
      <Route path="/profile">
        <ProtectedRouteWrapper>
          <Profile />
        </ProtectedRouteWrapper>
      </Route>
      <Route path="/groups">
        <ProtectedRouteWrapper>
          <Groups />
        </ProtectedRouteWrapper>
      </Route>
      <Route path="/groups/create">
        <ProtectedRouteWrapper>
          <CreateGroup />
        </ProtectedRouteWrapper>
      </Route>
      <Route path="/groups/:id">
        <ProtectedRouteWrapper>
          <GroupDetail />
        </ProtectedRouteWrapper>
      </Route>
      <Route path="/groups/:id/leaderboard">
        <ProtectedRouteWrapper>
          <GroupLeaderboard />
        </ProtectedRouteWrapper>
      </Route>
      <Route path="/groups/:id/results">
        <ProtectedRouteWrapper>
          <GroupResults />
        </ProtectedRouteWrapper>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Router />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <AppContent />
            <Toaster />
          </TooltipProvider>
        </QueryClientProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
