
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Calendar, AlertTriangle, Info, CheckCircle2, Clock } from "lucide-react";
import { useOfficialSurveys, useElderlySurveys, useInventory } from "@/hooks/use-storage";

export default function NotificationCenter() {
  const { surveys: officialSurveys } = useOfficialSurveys();
  const { surveys: elderlySurveys } = useElderlySurveys();
  const { distributions } = useInventory();

  const notifications = [
    {
      id: 1,
      title: "설문 데이터 백업 완료",
      message: `총 ${officialSurveys.length + elderlySurveys.length}건의 설문 데이터가 안전하게 백업되었습니다.`,
      type: "success",
      icon: CheckCircle2,
      time: "방금 전",
      priority: "low"
    },
    {
      id: 2,
      title: "월간 리포트 생성 예정",
      message: "이번 달 분석 리포트가 내일 자동으로 생성됩니다.",
      type: "info",
      icon: Calendar,
      time: "1시간 전",
      priority: "medium"
    },
    {
      id: 3,
      title: "물품 재고 확인 필요",
      message: distributions.length > 50 ? "물품 배분이 활발히 이루어지고 있습니다." : "물품 재고 상태를 확인해주세요.",
      type: distributions.length > 50 ? "info" : "warning",
      icon: distributions.length > 50 ? Info : AlertTriangle,
      time: "2시간 전",
      priority: distributions.length > 50 ? "low" : "high"
    },
    {
      id: 4,
      title: "시스템 업데이트",
      message: "새로운 기능이 추가되었습니다. 대시보드를 확인해보세요.",
      type: "info",
      icon: Info,
      time: "어제",
      priority: "low"
    }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case "success": return "text-green-600 bg-green-50 border-green-200";
      case "warning": return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "error": return "text-red-600 bg-red-50 border-red-200";
      default: return "text-blue-600 bg-blue-50 border-blue-200";
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case "success": return "text-green-500";
      case "warning": return "text-yellow-500";
      case "error": return "text-red-500";
      default: return "text-blue-500";
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high": return <Badge variant="destructive" className="text-xs">중요</Badge>;
      case "medium": return <Badge variant="default" className="text-xs">보통</Badge>;
      default: return <Badge variant="secondary" className="text-xs">일반</Badge>;
    }
  };

  return (
    <Card className="border border-border">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-lg font-semibold text-foreground">
          <div className="flex items-center">
            <Bell className="h-5 w-5 mr-2 text-primary" />
            알림 센터
          </div>
          <Badge variant="secondary" className="text-xs">
            {notifications.filter(n => n.priority === "high").length}건 중요
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {notifications.map((notification) => {
            const IconComponent = notification.icon;
            return (
              <div
                key={notification.id}
                className={`p-3 rounded-lg border ${getTypeColor(notification.type)} transition-colors hover:shadow-sm`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <IconComponent className={`h-4 w-4 ${getIconColor(notification.type)}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-semibold text-foreground truncate">
                        {notification.title}
                      </h4>
                      {getPriorityBadge(notification.priority)}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {notification.time}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-4 border-t border-border">
          <Button variant="outline" size="sm" className="w-full">
            모든 알림 보기
          </Button>
        </div>

        <div className="mt-4 p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">오늘의 활동</span>
            <div className="flex space-x-4 text-xs">
              <span className="text-green-600 font-medium">설문 {elderlySurveys.length}건</span>
              <span className="text-blue-600 font-medium">배분 {distributions.length}건</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
