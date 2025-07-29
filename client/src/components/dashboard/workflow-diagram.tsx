import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Workflow, ArrowRight, ArrowDown, CheckCircle, FileText, Users, Package, BarChart3 } from "lucide-react";

export default function WorkflowDiagram() {
  const workflowSteps = [
    {
      id: 1,
      title: "공무원 설문조사",
      description: "Excel 업로드 또는 직접 입력",
      icon: FileText,
      color: "bg-blue-500",
      status: "active"
    },
    {
      id: 2, 
      title: "어르신 설문조사",
      description: "6개 섹션 단계별 입력",
      icon: Users,
      color: "bg-green-500",
      status: "active"
    },
    {
      id: 3,
      title: "물품 반출관리",
      description: "배분 기록 및 재고 추적",
      icon: Package,
      color: "bg-orange-500", 
      status: "active"
    },
    {
      id: 4,
      title: "데이터 분석",
      description: "통계 분석 및 차트 생성",
      icon: BarChart3,
      color: "bg-purple-500",
      status: "active"
    }
  ];

  const FlowStep = ({ step, isLast = false }: { step: typeof workflowSteps[0], isLast?: boolean }) => {
    const Icon = step.icon;
    
    return (
      <div className="flex flex-col items-center">
        <div className="relative">
          <div className={`${step.color} p-4 rounded-full text-white shadow-lg`}>
            <Icon className="h-6 w-6" />
          </div>
          {step.status === "active" && (
            <div className="absolute -top-1 -right-1">
              <CheckCircle className="h-5 w-5 text-green-500 bg-white rounded-full" />
            </div>
          )}
        </div>
        
        <div className="mt-3 text-center max-w-32">
          <h3 className="font-semibold text-sm text-foreground">{step.title}</h3>
          <p className="text-xs text-muted-foreground mt-1">{step.description}</p>
        </div>
        
        {!isLast && (
          <div className="mt-4 hidden md:block">
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
        
        {!isLast && (
          <div className="mt-4 md:hidden">
            <ArrowDown className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="border border-border">
      <CardHeader>
        <CardTitle className="flex items-center text-lg font-semibold text-foreground">
          <Workflow className="h-5 w-5 mr-2 text-primary" />
          업무 프로세스 흐름도
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Desktop Layout */}
        <div className="hidden md:flex items-center justify-between px-4 py-8">
          {workflowSteps.map((step, index) => (
            <FlowStep 
              key={step.id} 
              step={step} 
              isLast={index === workflowSteps.length - 1}
            />
          ))}
        </div>
        
        {/* Mobile Layout */}
        <div className="md:hidden space-y-6 py-4">
          {workflowSteps.map((step, index) => (
            <FlowStep 
              key={step.id} 
              step={step} 
              isLast={index === workflowSteps.length - 1}
            />
          ))}
        </div>
        
        {/* Process Details */}
        <div className="mt-8 pt-6 border-t border-border">
          <h4 className="font-semibold text-foreground mb-4">프로세스 상세 설명</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-medium text-foreground">공무원 설문</p>
                  <p className="text-muted-foreground">서비스 필요성, 충분성 등 13개 항목 평가</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-medium text-foreground">어르신 설문</p>
                  <p className="text-muted-foreground">개인정보, 서비스 이용, 만족도 등 50+ 항목</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-medium text-foreground">반출 관리</p>
                  <p className="text-muted-foreground">물품 배분 기록, 실시간 재고 현황 추적</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-medium text-foreground">데이터 분석</p>
                  <p className="text-muted-foreground">만족도 분석, 지역별 비교, 추이 분석</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Data Flow Indicators */}
        <div className="mt-6 pt-4 border-t border-border">
          <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <span>데이터 수집</span>
            </div>
            <ArrowRight className="h-4 w-4" />
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-success rounded-full"></div>
              <span>저장 및 처리</span>
            </div>
            <ArrowRight className="h-4 w-4" />
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-warning rounded-full"></div>
              <span>분석 및 시각화</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}