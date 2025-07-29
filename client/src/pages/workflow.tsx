import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import InteractiveFlowchart from "@/components/workflow/interactive-flowchart";
import { 
  Workflow, 
  FileText, 
  Users, 
  Package, 
  BarChart3, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  Database,
  Download,
  Upload,
  TrendingUp,
  MapPin,
  Target
} from "lucide-react";

export default function WorkflowPage() {
  const processStages = [
    {
      id: 1,
      title: "데이터 수집 단계",
      icon: Database,
      color: "bg-blue-500",
      steps: [
        {
          name: "공무원 설문조사",
          description: "서비스 필요성, 충분성, 개선사항 등 13개 항목 조사",
          icon: FileText,
          actions: ["Excel 파일 업로드", "직접 입력", "검증 및 저장"],
          status: "active"
        },
        {
          name: "어르신 설문조사", 
          description: "개인정보, 서비스 이용현황, 만족도 등 50+ 항목 조사",
          icon: Users,
          actions: ["6개 섹션 단계별 입력", "실시간 유효성 검증", "자동 저장"],
          status: "active"
        }
      ]
    },
    {
      id: 2,
      title: "관리 및 운영 단계",
      icon: Package,
      color: "bg-green-500", 
      steps: [
        {
          name: "물품 반출 관리",
          description: "55개 기관 대상 물품 배분 및 재고 관리",
          icon: Package,
          actions: ["반출 기록 작성", "수령 확인", "재고 현황 업데이트"],
          status: "active"
        }
      ]
    },
    {
      id: 3,
      title: "분석 및 보고 단계",
      icon: BarChart3,
      color: "bg-purple-500",
      steps: [
        {
          name: "데이터 분석",
          description: "수집된 데이터의 통계 분석 및 시각화",
          icon: TrendingUp,
          actions: ["만족도 분석", "지역별 비교", "추이 분석", "차트 생성"],
          status: "active"
        },
        {
          name: "보고서 생성",
          description: "분석 결과 기반 종합 보고서 작성",
          icon: Download,
          actions: ["Excel 내보내기", "차트 저장", "요약 보고서"],
          status: "planned"
        }
      ]
    }
  ];

  const dataFlow = [
    { from: "공무원 설문", to: "로컬 저장소", type: "실시간" },
    { from: "어르신 설문", to: "로컬 저장소", type: "실시간" },
    { from: "반출 기록", to: "재고 시스템", type: "즉시" },
    { from: "저장된 데이터", to: "분석 엔진", type: "배치" },
    { from: "분석 결과", to: "대시보드", type: "실시간" }
  ];

  const StageCard = ({ stage }: { stage: typeof processStages[0] }) => {
    const StageIcon = stage.icon;
    
    return (
      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="flex items-center text-lg font-semibold text-foreground">
            <div className={`${stage.color} p-2 rounded-lg mr-3`}>
              <StageIcon className="h-5 w-5 text-white" />
            </div>
            {stage.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stage.steps.map((step, index) => {
              const StepIcon = step.icon;
              return (
                <div key={index} className="border border-border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <StepIcon className="h-5 w-5 text-primary" />
                      <div>
                        <h4 className="font-medium text-foreground">{step.name}</h4>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                    <Badge variant={step.status === "active" ? "default" : "secondary"}>
                      {step.status === "active" ? "운영중" : "계획중"}
                    </Badge>
                  </div>
                  
                  <div className="ml-8">
                    <h5 className="text-sm font-medium text-foreground mb-2">주요 작업:</h5>
                    <ul className="space-y-1">
                      {step.actions.map((action, actionIndex) => (
                        <li key={actionIndex} className="flex items-center text-sm text-muted-foreground">
                          <CheckCircle2 className="h-3 w-3 mr-2 text-green-500" />
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">업무 프로세스 워크플로우</h1>
          <p className="text-muted-foreground mt-2">
            노인맞춤돌봄서비스 현장 모니터링 시스템의 전체 업무 흐름도
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          <Clock className="h-4 w-4 mr-1" />
          실시간 모니터링
        </Badge>
      </div>

      {/* Interactive Flowchart */}
      <InteractiveFlowchart />

      {/* Process Overview */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="flex items-center text-xl font-semibold text-foreground">
            <Workflow className="h-6 w-6 mr-2 text-primary" />
            프로세스 개요
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-500 p-4 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                <Database className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold text-foreground">데이터 수집</h3>
              <p className="text-sm text-muted-foreground mt-1">
                공무원 및 어르신 대상 설문조사 실시
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-500 p-4 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                <Package className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold text-foreground">운영 관리</h3>
              <p className="text-sm text-muted-foreground mt-1">
                물품 배분 및 재고 현황 실시간 추적
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-500 p-4 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold text-foreground">분석 보고</h3>
              <p className="text-sm text-muted-foreground mt-1">
                데이터 분석 및 인사이트 도출
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Process Stages */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">상세 프로세스</h2>
        <div className="space-y-6">
          {processStages.map((stage) => (
            <StageCard key={stage.id} stage={stage} />
          ))}
        </div>
      </div>

      {/* Data Flow */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="flex items-center text-xl font-semibold text-foreground">
            <ArrowRight className="h-6 w-6 mr-2 text-primary" />
            데이터 흐름도
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dataFlow.map((flow, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                  <span className="font-medium text-foreground">{flow.from}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <Badge variant="outline" className="text-xs">
                    {flow.type}
                  </Badge>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className="font-medium text-foreground">{flow.to}</span>
                  <div className="w-3 h-3 bg-success rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">총 처리 용량</p>
                <p className="text-2xl font-bold text-foreground">55개 기관</p>
              </div>
              <MapPin className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">설문 항목 수</p>
                <p className="text-2xl font-bold text-foreground">50+ 항목</p>
              </div>
              <Target className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">실시간 처리</p>
                <p className="text-2xl font-bold text-foreground">100% 가용</p>
              </div>
              <TrendingUp className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}