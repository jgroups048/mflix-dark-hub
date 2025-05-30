import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import SplashScreen from "./components/SplashScreen";
import HomePage from "./pages/HomePage";
import WatchPage from "./pages/WatchPage";
import MovieDownloadPage from "./pages/MovieDownloadPage";
import AdminAuthGuard from "./components/auth/AdminAuthGuard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [showSplash, setShowSplash] = useState(() => {
    const splashShown = sessionStorage.getItem('entertainment-hub-splash-shown');
    return !splashShown;
  });

  const handleSplashComplete = () => {
    sessionStorage.setItem('entertainment-hub-splash-shown', 'true');
    setShowSplash(false);
  };

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <HashRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/watch/:id" element={<WatchPage />} />
            <Route path="/download/:id" element={<MovieDownloadPage />} />
            <Route path="/super-admin-786" element={<AdminAuthGuard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </HashRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
