import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import MainLayout from "@/components/layout/main-layout";
import Dashboard from "@/pages/dashboard";
import OfficialSurvey from "@/pages/official-survey";
import ElderlySurvey from "@/pages/elderly-survey";
import ElderlySurveyList from "@/pages/elderly-survey-list";
import Inventory from "@/pages/inventory";
import Analysis from "@/pages/analysis";
import WorkflowPage from "@/pages/workflow";
import StoragePage from "@/pages/storage";
import DocumentsPage from "@/pages/documents";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <MainLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/official-survey" component={OfficialSurvey} />
        <Route path="/elderly-survey" component={ElderlySurvey} />
        <Route path="/inventory" component={Inventory} />
        <Route path="/documents" component={DocumentsPage} />
        <Route path="/analysis" component={Analysis} />
        <Route path="/workflow" component={WorkflowPage} />
        <Route path="/storage" component={StoragePage} />
        <Route component={NotFound} />
      </Switch>
    </MainLayout>
  );
}

function App() {
  console.log('App component rendered');

  try {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    );
  } catch (error) {
    console.error('App render error:', error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">앱 로드 오류</h1>
          <p className="text-gray-600">콘솔을 확인해주세요.</p>
        </div>
      </div>
    );
  }
}

export default App;