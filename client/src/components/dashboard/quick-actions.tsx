import { UserPlus, Upload, BarChart3, Package, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Zap } from "lucide-react";

export default function QuickActions() {
  const [, setLocation] = useLocation();

  const actions = [
    {
      title: "어르신 설문",
      description: "새 설문 입력",
      icon: UserPlus,
      color: "bg-gradient-to-br from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 shadow-md",
      textColor: "text-white",
      href: "/elderly-survey",
    },
    {
      title: "공무원 설문",
      description: "엑셀 업로드",
      icon: Upload,
      color: "bg-gradient-to-br from-slate-200 to-slate-300 hover:from-slate-300 hover:to-slate-400 shadow-md",
      textColor: "text-slate-700",
      href: "/official-survey",
    },
    {
      title: "분석 결과",
      description: "실시간 분석",
      icon: BarChart3,
      color: "bg-gradient-to-br from-emerald-400 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 shadow-md",
      textColor: "text-white",
      href: "/analysis",
    },
    {
      title: "물품 관리",
      description: "재고 현황",
      icon: Package,
      color: "bg-gradient-to-br from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 shadow-md",
      textColor: "text-white",
      href: "/inventory",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-lg font-semibold text-foreground">
          <Zap className="h-5 w-5 mr-2 text-primary" />
          빠른 작업
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {actions.map((action, index) => {
            const IconComponent = action.icon;
            return (
              <Button
                key={index}
                onClick={() => setLocation(action.href)}
                className={`${action.color} p-6 h-auto text-left group transition-all duration-200 min-h-[120px] w-full justify-start`}
                variant="ghost"
              >
                <div className="w-full">
                  <div className="flex items-center justify-between mb-3">
                    <IconComponent className={`h-6 w-6 ${action.textColor} flex-shrink-0`} />
                    <ArrowRight className={`h-4 w-4 ${action.textColor} opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all flex-shrink-0`} />
                  </div>
                  <div className="space-y-1 text-left">
                    <p className={`font-semibold text-base ${action.textColor} leading-tight`}>{action.title}</p>
                    <p className={`text-sm ${action.textColor} opacity-80 leading-tight`}>{action.description}</p>
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
