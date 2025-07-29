import MetricsCards from "@/components/dashboard/metrics-cards";
import RecentActivities from "@/components/dashboard/recent-activities";
import QuickActions from "@/components/dashboard/quick-actions";
import DashboardCharts from "@/components/dashboard/dashboard-charts";
import SystemStatus from "@/components/dashboard/system-status";
import NotificationCenter from "@/components/dashboard/notification-center";
import ScheduleCalendar from "@/components/dashboard/schedule-calendar";

export default function Dashboard() {
  return (
    <div>
      <MetricsCards />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <RecentActivities />
        </div>
        <div>
          <SystemStatus />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <QuickActions />
        </div>
        <div>
          <NotificationCenter />
        </div>
      </div>

      <DashboardCharts />
      
      <div className="mb-8">
        <ScheduleCalendar />
      </div>
    </div>
  );
}