import { ClipboardList, UserCheck, Users, Truck, TrendingUp, CheckCircle, Clock, Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useOfficialSurveys, useElderlySurveys, useInventory } from "@/hooks/use-storage";

export default function MetricsCards() {
  const { surveys: officialSurveys } = useOfficialSurveys();
  const { surveys: elderlySurveys } = useElderlySurveys();
  const { summary } = useInventory();

  const totalSurveys = officialSurveys.length + elderlySurveys.length;
  const targetTotal = 300; // 88 officials + 212 elderly (approximate target)
  const completionRate = Math.round((totalSurveys / targetTotal) * 100);

  const metrics = [
    {
      title: "총 설문 완료",
      value: totalSurveys.toString(),
      change: `목표 대비 ${completionRate}%`,
      changeType: "positive" as const,
      icon: ClipboardList,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      title: "공무원 설문",
      value: officialSurveys.length.toString(),
      change: "완료",
      changeType: "positive" as const,
      icon: UserCheck,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      title: "어르신 설문",
      value: elderlySurveys.length.toString(),
      change: "진행 중",
      changeType: "warning" as const,
      icon: Users,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      title: "물품 반출률",
      value: `${summary?.distributionRate.toFixed(0) || 0}%`,
      change: `${summary?.totalDistributed || 0}개 반출`,
      changeType: "neutral" as const,
      icon: Truck,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
    },
  ];

  const getChangeIcon = (type: string) => {
    switch (type) {
      case "positive":
        return <TrendingUp className="h-3 w-3 mr-1" />;
      case "warning":
        return <Clock className="h-3 w-3 mr-1" />;
      default:
        return <Package className="h-3 w-3 mr-1" />;
    }
  };

  const getChangeColor = (type: string) => {
    switch (type) {
      case "positive":
        return "text-green-600";
      case "warning":
        return "text-yellow-600";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
      {metrics.map((metric, index) => {
        const IconComponent = metric.icon;
        return (
          <Card key={index} className="metric-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                  <p className="text-3xl font-bold text-foreground">{metric.value}</p>
                  <p className={`text-sm mt-1 flex items-center ${getChangeColor(metric.changeType)}`}>
                    {getChangeIcon(metric.changeType)}
                    {metric.change}
                  </p>
                </div>
                <div className={`h-12 w-12 ${metric.iconBg} rounded-lg flex items-center justify-center`}>
                  <IconComponent className={`${metric.iconColor} h-6 w-6`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
