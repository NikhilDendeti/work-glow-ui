import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { RoleProtectedRoute } from "@/components/RoleProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import CEODashboard from "./pages/CEODashboard";
import HODDashboard from "./pages/HODDashboard";
import PodView from "./pages/PodView";
import PodViewPage from "./pages/PodViewPage";
import PodLeadAllocation from "./pages/PodLeadAllocation";
import PodLeadAllocationForm from "./pages/PodLeadAllocationForm";
import AdminDashboard from "./pages/AdminDashboard";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import UploadInitialXLSX from "./pages/admin/UploadInitialXLSX";
import ProcessAllocations from "./pages/admin/ProcessAllocations";
import FinalMasterList from "./pages/admin/FinalMasterList";
import ImportEmployeeData from "./pages/admin/ImportEmployeeData";
import UploadFeatureCSV from "./pages/admin/UploadFeatureCSV";
import GenerateAllPodSheets from "./pages/admin/GenerateAllPodSheets";
import { toast } from "@/hooks/use-toast";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      onError: (error: any) => {
        toast({
          title: "Error",
          description: error?.message || "An error occurred",
          variant: "destructive",
        });
      },
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ceo"
              element={
                <ProtectedRoute>
                  <CEODashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hod"
              element={
                <ProtectedRoute>
                  <HODDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pod/:id"
              element={
                <ProtectedRoute>
                  <PodViewPage />
                </ProtectedRoute>
              }
            />
            {/* Pod Lead Allocation Routes */}
            <Route
              path="/pod-lead/allocations"
              element={
                <RoleProtectedRoute allowedRoles={['PodLead']}>
                  <PodLeadAllocation month={new Date().toISOString().slice(0, 7)} />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/pod-lead/allocations/form"
              element={
                <RoleProtectedRoute allowedRoles={['PodLead']}>
                  <PodLeadAllocationForm month={new Date().toISOString().slice(0, 7)} />
                </RoleProtectedRoute>
              }
            />
            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <RoleProtectedRoute allowedRoles={['Admin', 'Automation']}>
                  <AdminDashboardPage />
                </RoleProtectedRoute>
              }
            />
            {/* Automation-only route: Upload Initial XLSX */}
            <Route
              path="/admin/upload-initial-xlsx"
              element={
                <RoleProtectedRoute allowedRoles={['Admin', 'Automation']}>
                  <UploadInitialXLSX />
                </RoleProtectedRoute>
              }
            />
            {/* Admin-only routes (not Automation) */}
            <Route
              path="/admin/process-allocations"
              element={
                <RoleProtectedRoute allowedRoles={['Admin', 'CEO']}>
                  <ProcessAllocations />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/admin/final-master-list"
              element={
                <RoleProtectedRoute allowedRoles={['Admin', 'CEO']}>
                  <FinalMasterList />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/admin/import-employees"
              element={
                <RoleProtectedRoute allowedRoles={['Admin']}>
                  <ImportEmployeeData />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/admin/upload-features"
              element={
                <RoleProtectedRoute allowedRoles={['Admin']}>
                  <UploadFeatureCSV />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/admin/generate-sheets"
              element={
                <RoleProtectedRoute allowedRoles={['Admin']}>
                  <GenerateAllPodSheets />
                </RoleProtectedRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
