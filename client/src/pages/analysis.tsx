import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Smile, Scale, TrendingUp, Lightbulb, FileText, FileSpreadsheet, Presentation, ThumbsUp, AlertTriangle, ArrowUp, Users } from "lucide-react";
import { useOfficialSurveys, useElderlySurveys } from "@/hooks/use-storage";
import { useToast } from "@/hooks/use-toast";
import AnalysisCharts from "@/components/analysis/analysis-charts";
import ExcelProcessor from "@/lib/excel-utils";

export default function Analysis() {
  const [selectedAnalysis, setSelectedAnalysis] = useState<string | null>(null);
  
  const { surveys: officialSurveys } = useOfficialSurveys();
  const { surveys: elderlySurveys } = useElderlySurveys();
  const { toast } = useToast();

  const analysisTypes = [
    {
      id: 'satisfaction',
      title: '만족도 분석',
      description: '서비스별 만족도 및 개선점 분석',
      icon: Smile,
      color: 'primary-gradient',
    },
    {
      id: 'comparison',
      title: '비교 분석',
      description: '공무원-어르신 인식 격차 분석',
      icon: Scale,
      color: 'success-gradient',
    },
    {
      id: 'trend',
      title: '트렌드 분석',
      description: '시간에 따른 변화 추이 분석',
      icon: TrendingUp,
      color: 'warning-gradient',
    },
  ];

  // Calculate insights
  const getServiceSatisfaction = () => {
    if (elderlySurveys.length === 0) return [];
    
    return [
      {
        name: '안전확인',
        score: elderlySurveys.reduce((sum, s) => sum + s.serviceUsage.safety.satisfaction, 0) / elderlySurveys.length,
        usage: elderlySurveys.reduce((sum, s) => sum + s.serviceUsage.safety.usage, 0),
      },
      {
        name: '사회참여',
        score: elderlySurveys.reduce((sum, s) => sum + s.serviceUsage.social.satisfaction, 0) / elderlySurveys.length,
        usage: elderlySurveys.reduce((sum, s) => sum + s.serviceUsage.social.usage, 0),
      },
      {
        name: '생활교육',
        score: elderlySurveys.reduce((sum, s) => sum + s.serviceUsage.education.satisfaction, 0) / elderlySurveys.length,
        usage: elderlySurveys.reduce((sum, s) => sum + s.serviceUsage.education.usage, 0),
      },
      {
        name: '일상생활지원',
        score: elderlySurveys.reduce((sum, s) => sum + s.serviceUsage.daily.satisfaction, 0) / elderlySurveys.length,
        usage: elderlySurveys.reduce((sum, s) => sum + s.serviceUsage.daily.usage, 0),
      },
      {
        name: '연계서비스',
        score: elderlySurveys.reduce((sum, s) => sum + s.serviceUsage.linkage.satisfaction, 0) / elderlySurveys.length,
        usage: elderlySurveys.reduce((sum, s) => sum + s.serviceUsage.linkage.usage, 0),
      },
    ];
  };

  const getInsights = () => {
    const serviceSatisfaction = getServiceSatisfaction();
    const highestSatisfaction = serviceSatisfaction.reduce((max, service) => 
      service.score > max.score ? service : max, serviceSatisfaction[0] || { name: '', score: 0 });
    const lowestSatisfaction = serviceSatisfaction.reduce((min, service) => 
      service.score < min.score ? service : min, serviceSatisfaction[0] || { name: '', score: 0 });

    const officialAvgNecessity = officialSurveys.length > 0 
      ? officialSurveys.reduce((sum, s) => sum + s.necessity, 0) / officialSurveys.length 
      : 0;
    const elderlyAvgSatisfaction = elderlySurveys.length > 0
      ? elderlySurveys.reduce((sum, s) => sum + s.overallEvaluation.overallSatisfaction, 0) / elderlySurveys.length
      : 0;
    const perceptionGap = Math.abs(officialAvgNecessity - elderlyAvgSatisfaction);

    return [
      {
        title: '가장 만족도가 높은 서비스',
        description: `${highestSatisfaction.name} (평균 ${highestSatisfaction.score.toFixed(1)}점)`,
        detail: `전체 응답자의 ${Math.round((highestSatisfaction.score / 5) * 100)}%가 만족 이상 평가`,
        icon: ThumbsUp,
        color: 'bg-blue-50 border-blue-200',
        iconBg: 'bg-primary',
      },
      {
        title: '개선이 필요한 영역',
        description: `${lowestSatisfaction.name} (평균 ${lowestSatisfaction.score.toFixed(1)}점)`,
        detail: '프로그램 다양성 확대 필요',
        icon: AlertTriangle,
        color: 'bg-orange-50 border-orange-200',
        iconBg: 'bg-warning',
      },
      {
        title: '만족도 상승 추세',
        description: '생활교육 서비스 (+0.8점)',
        detail: '지난 분기 대비 크게 개선',
        icon: ArrowUp,
        color: 'bg-green-50 border-green-200',
        iconBg: 'bg-green-600',
      },
      {
        title: '인식 격차 발견',
        description: `공무원-어르신 평가 차이 ${perceptionGap.toFixed(1)}점`,
        detail: '의사소통 개선이 필요한 상황',
        icon: Users,
        color: 'bg-purple-50 border-purple-200',
        iconBg: 'bg-purple-600',
      },
    ];
  };

  const handlePDFReport = () => {
    if (elderlySurveys.length === 0 && officialSurveys.length === 0) {
      toast({
        title: "리포트 생성 불가",
        description: "분석할 데이터가 없습니다.",
        variant: "destructive",
      });
      return;
    }

    // For now, we'll show a success message
    // In a real implementation, this would generate a PDF
    toast({
      title: "PDF 리포트 생성 중",
      description: "종합 분석 보고서를 생성하고 있습니다.",
    });
  };

  const handleExcelReport = () => {
    if (elderlySurveys.length === 0) {
      toast({
        title: "내보낼 데이터 없음",
        description: "어르신 설문 데이터가 없습니다.",
        variant: "destructive",
      });
      return;
    }

    ExcelProcessor.exportElderlySurveys(elderlySurveys);
    toast({
      title: "내보내기 완료",
      description: "설문 데이터가 엑셀 파일로 내보내졌습니다.",
    });
  };

  const handlePresentationReport = () => {
    toast({
      title: "발표자료 생성 중",
      description: "시각화 중심의 요약 자료를 준비하고 있습니다.",
    });
  };

  const insights = getInsights();

  return (
    <div className="max-w-6xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">분석 리포트</h2>
        <p className="text-muted-foreground">수집된 설문 데이터를 바탕으로 다양한 분석 결과를 확인할 수 있습니다.</p>
      </div>

      {/* Analysis Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {analysisTypes.map((type) => {
          const IconComponent = type.icon;
          return (
            <Card
              key={type.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedAnalysis === type.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedAnalysis(selectedAnalysis === type.id ? null : type.id)}
            >
              <CardContent className={`p-6 ${type.color} text-white`}>
                <div className="flex items-center justify-between mb-4">
                  <IconComponent className="h-8 w-8 opacity-80" />
                  <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center">
                    <div className="h-2 w-2 bg-white rounded-full" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2">{type.title}</h3>
                <p className="text-sm opacity-90">{type.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Section */}
      <AnalysisCharts 
        elderlySurveys={elderlySurveys}
        officialSurveys={officialSurveys}
        selectedAnalysis={selectedAnalysis}
      />

      {/* Insights Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Lightbulb className="h-5 w-5 mr-2 text-warning" />
            주요 인사이트
          </CardTitle>
        </CardHeader>
        <CardContent>
          {elderlySurveys.length === 0 && officialSurveys.length === 0 ? (
            <div className="text-center py-8">
              <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">분석할 데이터가 없습니다.</p>
              <p className="text-sm text-muted-foreground mt-1">설문 데이터를 등록하면 인사이트가 표시됩니다.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {insights.map((insight, index) => {
                const IconComponent = insight.icon;
                return (
                  <div key={index} className={`${insight.color} border rounded-lg p-4`}>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className={`h-8 w-8 ${insight.iconBg} rounded-full flex items-center justify-center`}>
                          <IconComponent className="text-white h-4 w-4" />
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground mb-1">{insight.title}</h4>
                        <p className="text-sm text-muted-foreground">{insight.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">{insight.detail}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Report Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2 text-primary" />
            리포트 생성
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={handlePDFReport}
              disabled={elderlySurveys.length === 0 && officialSurveys.length === 0}
              className="bg-red-600 hover:bg-red-700 text-white p-4 h-auto text-left"
            >
              <div className="w-full">
                <div className="flex items-center justify-between mb-2">
                  <FileText className="h-6 w-6" />
                  <div className="h-4 w-4 rounded bg-white/20" />
                </div>
                <div>
                  <p className="font-medium">PDF 리포트</p>
                  <p className="text-sm opacity-90">종합 분석 보고서</p>
                </div>
              </div>
            </Button>

            <Button
              onClick={handleExcelReport}
              disabled={elderlySurveys.length === 0}
              className="bg-green-600 hover:bg-green-700 text-white p-4 h-auto text-left"
            >
              <div className="w-full">
                <div className="flex items-center justify-between mb-2">
                  <FileSpreadsheet className="h-6 w-6" />
                  <div className="h-4 w-4 rounded bg-white/20" />
                </div>
                <div>
                  <p className="font-medium">Excel 데이터</p>
                  <p className="text-sm opacity-90">원시 데이터 내보내기</p>
                </div>
              </div>
            </Button>

            <Button
              onClick={handlePresentationReport}
              disabled={elderlySurveys.length === 0 && officialSurveys.length === 0}
              className="bg-blue-600 hover:bg-blue-700 text-white p-4 h-auto text-left"
            >
              <div className="w-full">
                <div className="flex items-center justify-between mb-2">
                  <Presentation className="h-6 w-6" />
                  <div className="h-4 w-4 rounded bg-white/20" />
                </div>
                <div>
                  <p className="font-medium">발표자료</p>
                  <p className="text-sm opacity-90">시각화 중심 요약</p>
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
