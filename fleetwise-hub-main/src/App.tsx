import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/Login";
import AppLayout from "./components/layout/AppLayout";
import DashboardPage from "./pages/Dashboard";
import VehiclesPage from "./pages/Vehicles";
import TripsPage from "./pages/Trips";
import MaintenancePage from "./pages/Maintenance";
import ExpensesPage from "./pages/Expenses";
import DriversPage from "./pages/Drivers";
import AnalyticsPage from "./pages/Analytics";
import NotFound from "./pages/NotFound";
import { useFleetStore } from "./store/fleetStore";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useFleetStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/vehicles" element={<VehiclesPage />} />
            <Route path="/trips" element={<TripsPage />} />
            <Route path="/maintenance" element={<MaintenancePage />} />
            <Route path="/expenses" element={<ExpensesPage />} />
            <Route path="/drivers" element={<DriversPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
