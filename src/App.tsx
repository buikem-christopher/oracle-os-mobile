import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { OracleProvider } from "@/contexts/OracleContext";
import { BottomNav } from "@/components/BottomNav";
import { HomePage } from "@/pages/HomePage";
import { EnvironmentsPage } from "@/pages/EnvironmentsPage";
import { SignalsPage } from "@/pages/SignalsPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { SettingsPage } from "@/pages/SettingsPage";
import { AuthPage } from "@/pages/AuthPage";
import { LoadingScreen } from "@/components/LoadingScreen";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";

const queryClient = new QueryClient();

const App = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [session, setSession] = useState<Session | null>(null);
  const [showLoadingScreen, setShowLoadingScreen] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setAuthChecked(true);
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthChecked(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLoadingComplete = () => {
    setShowLoadingScreen(false);
  };

  const handleAuthSuccess = () => {
    // Session will be updated by the auth state listener
  };

  const handleLogout = () => {
    setSession(null);
    setActiveTab('home');
  };

  // Show loading screen on initial load
  if (showLoadingScreen) {
    return <LoadingScreen onComplete={handleLoadingComplete} />;
  }

  // Wait for auth check to complete
  if (!authChecked) {
    return <LoadingScreen onComplete={() => setAuthChecked(true)} />;
  }

  // Show auth page if not logged in
  if (!session) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  const renderPage = () => {
    switch (activeTab) {
      case 'home': 
        return <HomePage onSettingsClick={() => setActiveTab('settings')} />;
      case 'environments': 
        return <EnvironmentsPage />;
      case 'signals': 
        return <SignalsPage />;
      case 'profile': 
        return <ProfilePage onLogout={handleLogout} />;
      case 'settings': 
        return <SettingsPage />;
      default: 
        return <HomePage onSettingsClick={() => setActiveTab('settings')} />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <OracleProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <div className="min-h-screen bg-background">
            <main className="px-4 pb-24 max-w-lg mx-auto">
              {renderPage()}
            </main>
            <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
        </TooltipProvider>
      </OracleProvider>
    </QueryClientProvider>
  );
};

export default App;
