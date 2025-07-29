import { Plus, Upload, Truck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOfficialSurveys, useElderlySurveys, useInventory } from "@/hooks/use-storage";
import { History } from "lucide-react";

export default function RecentActivities() {
  const { surveys: elderlySurveys } = useElderlySurveys();
  const { surveys: officialSurveys } = useOfficialSurveys();
  const { distributions } = useInventory();

  // Get recent activities (last 5)
  const recentElderly = elderlySurveys
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 2);
  
  const recentOfficial = officialSurveys
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 1);
  
  const recentDistributions = distributions
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 2);

  const activities = [
    ...recentElderly.map(survey => ({
      id: survey.id,
      type: 'elderly-survey',
      title: `어르신 설문 입력 완료`,
      description: `${survey.organization} · ${formatTimeAgo(survey.createdAt)}`,
      icon: Plus,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100',
      iconBg: 'bg-primary',
      iconColor: 'text-white',
    })),
    ...recentOfficial.map(survey => ({
      id: survey.id,
      type: 'official-survey',
      title: `공무원 설문 등록 완료`,
      description: `${survey.department} · ${formatTimeAgo(survey.createdAt)}`,
      icon: Upload,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-100',
      iconBg: 'bg-green-600',
      iconColor: 'text-white',
    })),
    ...recentDistributions.map(dist => ({
      id: dist.id,
      type: 'inventory',
      title: `물품 ${dist.distributed}개 반출`,
      description: `${dist.organization} · ${formatTimeAgo(dist.createdAt)}`,
      icon: Truck,
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-100',
      iconBg: 'bg-orange-600',
      iconColor: 'text-white',
    })),
  ].sort((a, b) => {
    // Sort by creation time (most recent first)
    const getCreatedAt = (activity: any) => {
      if (activity.type === 'elderly-survey') {
        return recentElderly.find(s => s.id === activity.id)?.createdAt || new Date(0);
      }
      if (activity.type === 'official-survey') {
        return recentOfficial.find(s => s.id === activity.id)?.createdAt || new Date(0);
      }
      if (activity.type === 'inventory') {
        return recentDistributions.find(d => d.id === activity.id)?.createdAt || new Date(0);
      }
      return new Date(0);
    };
    return getCreatedAt(b).getTime() - getCreatedAt(a).getTime();
  }).slice(0, 5);

  function formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `${diffInMinutes}분 전`;
    } else if (diffInHours < 24) {
      return `${diffInHours}시간 전`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}일 전`;
    }
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg font-semibold text-foreground">
            <History className="h-5 w-5 mr-2 text-primary" />
            최근 활동
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">아직 활동 기록이 없습니다.</p>
            <p className="text-sm text-muted-foreground mt-1">설문이나 물품 관리를 시작해보세요.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-lg font-semibold text-foreground">
          <History className="h-5 w-5 mr-2 text-primary" />
          최근 활동
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const IconComponent = activity.icon;
            return (
              <div key={activity.id} className={`flex items-start space-x-3 p-4 ${activity.bgColor} rounded-lg border ${activity.borderColor}`}>
                <div className="flex-shrink-0">
                  <div className={`h-8 w-8 ${activity.iconBg} rounded-full flex items-center justify-center`}>
                    <IconComponent className={`${activity.iconColor} h-4 w-4`} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{activity.title}</p>
                  <p className="text-sm text-muted-foreground">{activity.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
