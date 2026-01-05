import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { OracleProvider } from "@/contexts/OracleContext";
import { BottomNav } from "@/components/BottomNav";
import { HomePage } from "@/pages/HomePage";
import { EnvironmentsPage } from "@/pages/EnvironmentsPage";
import { SignalsPage } from "@/pages/SignalsPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { SettingsPage } from "@/pages/SettingsPage";

const queryClient = new QueryClient();

const App = () => {
  const [activeTab, setActiveTab] = useState('home');

  const renderPage = () => {
    switch (activeTab) {
      case 'home': return <HomePage />;
      case 'environments': return <EnvironmentsPage />;
      case 'signals': return <SignalsPage />;
      case 'profile': return <ProfilePage />;
      case 'settings': return <SettingsPage />;
      default: return <HomePage />;
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
