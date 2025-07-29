import { useState, useEffect } from "react";
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Save, RotateCcw, Users, BarChart3, PieChart, TrendingUp, Eye, Edit, Trash2, Search, Filter, Plus, Download, List, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useElderlySurveys } from "@/hooks/use-storage";
import { useSurveyFormStore } from "@/stores/app-store";
import ElderlySurveyFormSections from "@/components/surveys/elderly-form-sections";
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import type { InsertElderlySurvey, ElderlySurvey } from "@shared/schema";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function ElderlySurvey() {
  const [currentSection, setCurrentSection] = useState(0);
  const [showStatistics, setShowStatistics] = useState(false);
  const [activeTab, setActiveTab] = useState("form");
  const [searchTerm, setSearchTerm] = useState("");
  const [organizationFilter, setOrganizationFilter] = useState("all");
  const [ageGroupFilter, setAgeGroupFilter] = useState("all");
  const [dateRangeFilter, setDateRangeFilter] = useState("all");
  const [selectedSurvey, setSelectedSurvey] = useState<ElderlySurvey | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [formData, setFormData] = useState<Partial<InsertElderlySurvey>>({
    serviceUsage: {
      safety: { usage: 0, satisfaction: 1 },
      social: { usage: 0, satisfaction: 1 },
      education: { usage: 0, satisfaction: 1 },
      daily: { usage: 0, satisfaction: 1 },
      linkage: { usage: 0, satisfaction: 1 },
    },
    detailServices: {
      conversation: { used: false },
      housework: { used: false },
      meal: { used: false },
      outing: { used: false },
      counseling: { used: false },
    },
    overallEvaluation: {
      desiredService: 1,
      sufficientService: 1,
      lifeHelp: 1,
      accessibility: 1,
      overallSatisfaction: 1,
    },
    lifeChanges: {
      loneliness: 1,
      safety: 1,
      learning: 1,
      economic: 1,
      social: 1,
      health: 1,
      convenience: 1,
      lifeSatisfaction: 1,
    },
    additionalOpinions: {
      improvements: [],
      additionalServices: [],
    },
  });
  const [selectedOrganization, setSelectedOrganization] = useState("");

  const { saveSurvey, loading, surveys, deleteSurvey } = useElderlySurveys();
  const { toast } = useToast();
  const {
    currentSection: storedSection,
    formData: storedFormData,
    updateFormData: updateStoredFormData,
    saveFormData,
    resetForm,
    setCurrentSection: setStoredSection,
  } = useSurveyFormStore();

  const sections = [
    "기본정보",
    "서비스이용",
    "세부서비스",
    "종합평가",
    "생활변화",
    "추가의견",
  ];

  const organizations: string[] = [];

  // Load saved form data on mount
  useEffect(() => {
    if (Object.keys(storedFormData).length > 0) {
      setFormData({ ...formData, ...storedFormData });
      setCurrentSection(storedSection);
    }
  }, []);

  // Auto-save form data when it changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateStoredFormData("elderlyForm", formData);
      setStoredSection(currentSection);
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [formData, currentSection]);

  const updateFormData = (data: Partial<InsertElderlySurvey>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const validateCurrentSection = (): boolean => {
    switch (currentSection) {
      case 0: // Basic Info
        return !!(formData.name && formData.gender && formData.age && 
                 formData.residence && formData.serviceMonths && formData.careType && 
                 selectedOrganization);
      case 1: // Service Usage
        return true; // All fields have defaults
      case 2: // Detail Services
        return true; // Optional fields
      case 3: // Overall Evaluation
        return true; // All fields have defaults
      case 4: // Life Changes
        return true; // All fields have defaults
      case 5: // Additional Opinions
        return true; // Optional fields
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!validateCurrentSection()) {
      toast({
        title: "입력 확인",
        description: "필수 항목을 모두 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const handleSave = async () => {
    if (!validateCurrentSection()) {
      toast({
        title: "입력 확인",
        description: "필수 항목을 모두 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedOrganization) {
      toast({
        title: "입력 확인",
        description: "방문기관을 선택해주세요.",
        variant: "destructive",
      });
      return;
    }

    try {
      const surveyData: ElderlySurvey = {
        id: `elderly-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...formData as InsertElderlySurvey,
        organization: selectedOrganization,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await saveSurvey(surveyData);

      // Reset form after successful save
      resetForm();
      setFormData({
        serviceUsage: {
          safety: { usage: 0, satisfaction: 1 },
          social: { usage: 0, satisfaction: 1 },
          education: { usage: 0, satisfaction: 1 },
          daily: { usage: 0, satisfaction: 1 },
          linkage: { usage: 0, satisfaction: 1 },
        },
        detailServices: {
          conversation: { used: false },
          housework: { used: false },
          meal: { used: false },
          outing: { used: false },
          counseling: { used: false },
        },
        overallEvaluation: {
          desiredService: 1,
          sufficientService: 1,
          lifeHelp: 1,
          accessibility: 1,
          overallSatisfaction: 1,
        },
        lifeChanges: {
          loneliness: 1,
          safety: 1,
          learning: 1,
          economic: 1,
          social: 1,
          health: 1,
          convenience: 1,
          lifeSatisfaction: 1,
        },
        additionalOpinions: {
          improvements: [],
          additionalServices: [],
        },
      });
      setCurrentSection(0);
      setSelectedOrganization("");

      toast({
        title: "저장 완료",
        description: "어르신 설문이 성공적으로 저장되었습니다.",
      });
    } catch (error) {
      console.error('Failed to save elderly survey:', error);
    }
  };

  const handleReset = () => {
    resetForm();
    setFormData({
      serviceUsage: {
        safety: { usage: 0, satisfaction: 1 },
        social: { usage: 0, satisfaction: 1 },
        education: { usage: 0, satisfaction: 1 },
        daily: { usage: 0, satisfaction: 1 },
        linkage: { usage: 0, satisfaction: 1 },
      },
      detailServices: {
        conversation: { used: false },
        housework: { used: false },
        meal: { used: false },
        outing: { used: false },
        counseling: { used: false },
      },
      overallEvaluation: {
        desiredService: 1,
        sufficientService: 1,
        lifeHelp: 1,
        accessibility: 1,
        overallSatisfaction: 1,
      },
      lifeChanges: {
        loneliness: 1,
        safety: 1,
        learning: 1,
        economic: 1,
        social: 1,
        health: 1,
        convenience: 1,
        lifeSatisfaction: 1,
      },
      additionalOpinions: {
        improvements: [],
        additionalServices: [],
      },
    });
    setCurrentSection(0);
    setSelectedOrganization("");

    toast({
      title: "초기화 완료",
      description: "설문 폼이 초기화되었습니다.",
    });
  };

  const progressPercentage = ((currentSection + 1) / sections.length) * 100;

  // Statistics calculation functions
  const getGenderDistribution = () => {
    const genderCounts = { male: 0, female: 0 };
    surveys.forEach(survey => {
      if (survey.gender) genderCounts[survey.gender]++;
    });

    return {
      labels: ['남성', '여성'],
      datasets: [{
        data: [genderCounts.male, genderCounts.female],
        backgroundColor: ['#3b82f6', '#ef4444'],
        borderWidth: 2,
        borderColor: '#fff',
      }]
    };
  };

  const getAgeDistribution = () => {
    const ageGroups = { '65-74': 0, '75-84': 0, '85+': 0 };
    surveys.forEach(survey => {
      if (survey.age >= 65 && survey.age <= 74) ageGroups['65-74']++;
      else if (survey.age >= 75 && survey.age <= 84) ageGroups['75-84']++;
      else if (survey.age >= 85) ageGroups['85+']++;
    });

    return {
      labels: Object.keys(ageGroups),
      datasets: [{
        label: '연령대별 분포',
        data: Object.values(ageGroups),
        backgroundColor: '#10b981',
        borderColor: '#059669',
        borderWidth: 1,
      }]
    };
  };

  const getServiceSatisfaction = () => {
    if (surveys.length === 0) return null;

    const services = ['safety', 'social', 'education', 'daily', 'linkage'];
    const serviceNames = ['안전확인', '사회참여', '생활교육', '일상생활지원', '연계서비스'];
    const satisfactionData = services.map(service => {
      const total = surveys.filter(s => s.serviceUsage[service].usage > 0).length;
      const avgSatisfaction = total > 0 
        ? surveys
            .filter(s => s.serviceUsage[service].usage > 0)
            .reduce((sum, s) => sum + s.serviceUsage[service].satisfaction, 0) / total
        : 0;
      return avgSatisfaction;
    });

    return {
      labels: serviceNames,
      datasets: [{
        label: '평균 만족도',
        data: satisfactionData,
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: '#3b82f6',
        borderWidth: 2,
      }]
    };
  };

  // Survey list functions
  const filteredSurveys = surveys.filter(survey => {
    const matchesSearch = 
      survey.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      survey.organization?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesOrganization = !organizationFilter || organizationFilter === "all" || survey.organization === organizationFilter;

    const matchesAgeGroup = !ageGroupFilter || ageGroupFilter === "all" || (() => {
      if (ageGroupFilter === "65-74") return survey.age >= 65 && survey.age <= 74;
      if (ageGroupFilter === "75-84") return survey.age >= 75 && survey.age <= 84;
      if (ageGroupFilter === "85+") return survey.age >= 85;
      return true;
    })();

    const matchesDateRange = !dateRangeFilter || dateRangeFilter === "all" || (() => {
      const surveyDate = new Date(survey.createdAt);
      const today = new Date();
      if (dateRangeFilter === "today") {
        return surveyDate.toDateString() === today.toDateString();
      }
      if (dateRangeFilter === "week") {
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        return surveyDate >= weekAgo;
      }
      if (dateRangeFilter === "month") {
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        return surveyDate >= monthAgo;
      }
      return true;
    })();

    return matchesSearch && matchesOrganization && matchesAgeGroup && matchesDateRange;
  });

  const totalPages = Math.ceil(filteredSurveys.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSurveys = filteredSurveys.slice(startIndex, startIndex + itemsPerPage);
  const uniqueOrganizations = Array.from(new Set(surveys.map(s => s.organization).filter(Boolean)));

  const handleDeleteSurvey = async (id: string) => {
    try {
      await deleteSurvey(id);
      toast({
        title: "삭제 완료",
        description: "설문이 성공적으로 삭제되었습니다.",
      });
    } catch (error) {
      toast({
        title: "삭제 실패", 
        description: "설문 삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setOrganizationFilter("all");
    setAgeGroupFilter("all");
    setDateRangeFilter("all");
    setCurrentPage(1);
  };

  const getGenderText = (gender: string) => {
    return gender === 'male' ? '남성' : '여성';
  };

  const getCareTypeText = (careType: string) => {
    switch (careType) {
      case 'general': return '일반돌봄';
      case 'intensive': return '중점돌봄';
      case 'specialized': return '특화돌봄';
      default: return careType;
    }
  };

  const getOverallSatisfaction = (survey: ElderlySurvey) => {
    return survey.overallEvaluation?.overallSatisfaction || 0;
  };

  const renderSurveyDetail = (survey: ElderlySurvey) => (
    <div className="space-y-6 max-h-96 overflow-y-auto">
      <div>
        <h4 className="font-semibold mb-3 text-primary">기본 정보</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="font-medium">이름:</span> {survey.name}</div>
          <div><span className="font-medium">성별:</span> {getGenderText(survey.gender)}</div>
          <div><span className="font-medium">연령:</span> {survey.age}세</div>
          <div><span className="font-medium">거주지역:</span> {survey.residence}</div>
          <div><span className="font-medium">이용기간:</span> {survey.serviceMonths}개월</div>
          <div><span className="font-medium">돌봄유형:</span> {getCareTypeText(survey.careType)}</div>
        </div>
      </div>

      <div>
        <h4 className="font-semibold mb-3 text-primary">서비스 이용 현황</h4>
        <div className="space-y-2 text-sm">
          {Object.entries(survey.serviceUsage).map(([key, value]) => {
            const serviceNames = {
              safety: '안전확인',
              social: '사회참여',
              education: '생활교육',
              daily: '일상생활지원',
              linkage: '연계서비스'
            };
            return (
              <div key={key} className="flex justify-between items-center p-2 bg-muted rounded">
                <span>{serviceNames[key as keyof typeof serviceNames]}:</span>
                <span>월 {value.usage}회 (만족도: {value.satisfaction}점)</span>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h4 className="font-semibold mb-3 text-primary">종합 평가</h4>
        <div className="text-sm">
          <div className="flex justify-between items-center p-2 bg-muted rounded">
            <span>전체적인 만족도:</span>
            <Badge variant="secondary">{getOverallSatisfaction(survey)}점</Badge>
          </div>
        </div>
      </div>
    </div>
  );

  const getOverallStats = () => {
    if (surveys.length === 0) return null;

    const avgAge = surveys.reduce((sum, s) => sum + s.age, 0) / surveys.length;
    const avgServiceMonths = surveys.reduce((sum, s) => sum + parseInt(s.serviceMonths), 0) / surveys.length;
    const avgOverallSatisfaction = surveys.reduce((sum, s) => sum + s.overallEvaluation.overallSatisfaction, 0) / surveys.length;

    const residenceDistribution = { '시지역': 0, '군지역': 0 };
    surveys.forEach(s => {
      if (s.residence) residenceDistribution[s.residence]++;
    });

    const careTypeDistribution = { 'general': 0, 'intensive': 0, 'specialized': 0 };
    surveys.forEach(s => {
      if (s.careType) careTypeDistribution[s.careType]++;
    });

    return {
      avgAge: Math.round(avgAge * 10) / 10,
      avgServiceMonths: Math.round(avgServiceMonths * 10) / 10,
      avgOverallSatisfaction: Math.round(avgOverallSatisfaction * 10) / 10,
      residenceDistribution,
      careTypeDistribution,
    };
  };

  const renderStatistics = () => {
    if (surveys.length === 0) {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-primary" />
              통계 정보
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">
              저장된 설문 데이터가 없습니다.
            </p>
          </CardContent>
        </Card>
      );
    }

    const stats = getOverallStats();
    const genderData = getGenderDistribution();
    const ageData = getAgeDistribution();
    const satisfactionData = getServiceSatisfaction();

    return (
      <div className="space-y-6">
        {/* 기본 통계 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-primary" />
              기본 통계 정보
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{surveys.length}</div>
                <div className="text-sm text-muted-foreground">총 설문 수</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats?.avgAge}세</div>
                <div className="text-sm text-muted-foreground">평균 연령</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats?.avgServiceMonths}개월</div>
                <div className="text-sm text-muted-foreground">평균 이용기간</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{stats?.avgOverallSatisfaction}점</div>
                <div className="text-sm text-muted-foreground">전체 만족도</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 차트 섹션 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 성별 분포 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChart className="h-5 w-5 mr-2 text-primary" />
                성별 분포
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center">
                <Doughnut 
                  data={genderData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom' as const,
                      }
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* 연령대 분포 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-primary" />
                연령대 분포
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <Bar 
                  data={ageData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          stepSize: 1,
                        }
                      }
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* 서비스 만족도 */}
          {satisfactionData && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                  서비스별 평균 만족도
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <Bar 
                    data={satisfactionData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false,
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          max: 5,
                          ticks: {
                            stepSize: 1,
                          }
                        }
                      }
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* 세부 분포 정보 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>거주지역 분포</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>시지역</span>
                  <span className="font-semibold">{stats?.residenceDistribution['시지역']}명</span>
                </div>
                <div className="flex justify-between">
                  <span>군지역</span>
                  <span className="font-semibold">{stats?.residenceDistribution['군지역']}명</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>돌봄유형 분포</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>일반돌봄</span>
                  <span className="font-semibold">{stats?.careTypeDistribution.general}명</span>
                </div>
                <div className="flex justify-between">
                  <span>중점돌봄</span>
                  <span className="font-semibold">{stats?.careTypeDistribution.intensive}명</span>
                </div>
                <div className="flex justify-between">
                  <span>특화돌봄</span>
                  <span className="font-semibold">{stats?.careTypeDistribution.specialized}명</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const handleEditSurvey = (survey: ElderlySurvey) => {
      // Implement the edit survey functionality here
      // For example, you can set the form data to the selected survey data and navigate to the form tab
      setFormData({...survey});
      setSelectedOrganization(survey.organization);
      setActiveTab("form");
  };

  return (
    <div className="max-w-6xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">어르신 설문조사</h2>
        <p className="text-muted-foreground">설문을 입력하고 관리할 수 있습니다.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="form" className="flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            설문 입력
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center">
            <List className="h-4 w-4 mr-2" />
            설문 목록 ({surveys.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="form" className="mt-6">{renderFormContent()}</TabsContent>
        <TabsContent value="list" className="mt-6">{renderSurveyList()}</TabsContent>
      </Tabs>
    </div>
  );

  function renderFormContent() {
    return (
      <>
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-2">새 설문 입력</h3>
          <p className="text-muted-foreground">6개 섹션으로 구성된 설문을 단계별로 입력할 수 있습니다.</p>
        </div>

      {/* Organization Selection */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2 text-primary" />
            방문기관 선택
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="organization">방문기관 *</Label>
              <Input
                id="organization"
                value={selectedOrganization}
                onChange={(e) => setSelectedOrganization(e.target.value)}
                placeholder="방문기관명을 입력하세요"
              />
            </div>
            <div>
              <Label htmlFor="survey-date">조사일시</Label>
              <Input
                id="survey-date"
                type="date"
                value={formData.surveyDate || new Date().toISOString().split('T')[0]}
                onChange={(e) => updateFormData({ surveyDate: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-primary">진행률</span>
          <span className="text-sm font-medium text-primary">{currentSection + 1}/{sections.length} 섹션</span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>

      {/* Section Navigation */}
      <div className="mb-8">
        <nav className="flex space-x-4 overflow-x-auto pb-2">
          {sections.map((section, index) => (
            <Button
              key={index}
              variant={index === currentSection ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentSection(index)}
              className={`section-nav-btn ${index === currentSection ? 'active' : ''}`}
            >
              {index + 1}. {section}
            </Button>
          ))}
        </nav>
      </div>

      {/* Form Sections */}
      <ElderlySurveyFormSections
        currentSection={currentSection}
        formData={formData}
        updateFormData={updateFormData}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onSave={handleSave}
        isLastSection={currentSection === sections.length - 1}
      />

      {/* Action Buttons */}
      <div className="mt-6 flex justify-between">
        <Button variant="outline" onClick={handleReset}>
          <RotateCcw className="h-4 w-4 mr-2" />
          폼 초기화
        </Button>

        <div className="flex items-center space-x-2">
          {Object.keys(storedFormData).length > 0 && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              <Save className="h-3 w-3 mr-1" />
              자동 저장됨
            </Badge>
          )}
          <Button 
            variant="outline" 
            onClick={() => setShowStatistics(!showStatistics)}
            disabled={surveys.length === 0}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            {showStatistics ? '통계 숨기기' : '통계 보기'}
          </Button>
        </div>
      </div>

      {/* Statistics Section */}
      {showStatistics && (
        <>
          <Separator className="my-8" />
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-2">설문 통계 정보</h2>
            <p className="text-muted-foreground">저장된 어르신 설문 데이터의 통계 분석 결과입니다.</p>
          </div>
          {renderStatistics()}
        </>
      )}
      </>
    );
  }

  function renderSurveyList() {
    if (loading) {
      return (
        <div className="text-center py-8">
          <div className="text-lg">설문 데이터를 불러오는 중...</div>
        </div>
      );
    }

    return (
      <>
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-2">저장된 설문 목록</h3>
          <p className="text-muted-foreground">저장된 어르신 설문을 확인하고 관리할 수 있습니다.</p>
        </div>

        {/* 검색 및 필터 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="h-5 w-5 mr-2 text-primary" />
              📋 설문 조회 및 검색
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <Label htmlFor="search">이름/기관 검색</Label>
                <Input
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="이름 또는 기관명 입력"
                />
              </div>

              <div>
                <Label>방문기관</Label>
                <Select value={organizationFilter} onValueChange={setOrganizationFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="모든 기관" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">모든 기관</SelectItem>
                    {uniqueOrganizations.map(org => (
                      <SelectItem key={org} value={org}>{org}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>연령대</Label>
                <Select value={ageGroupFilter} onValueChange={setAgeGroupFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="모든 연령대" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">모든 연령대</SelectItem>
                    <SelectItem value="65-74">65-74세</SelectItem>
                    <SelectItem value="75-84">75-84세</SelectItem>
                    <SelectItem value="85+">85세 이상</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>조사일자</Label>
                <Select value={dateRangeFilter} onValueChange={setDateRangeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="전체 기간" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체 기간</SelectItem>
                    <SelectItem value="today">오늘</SelectItem>
                    <SelectItem value="week">최근 7일</SelectItem>
                    <SelectItem value="month">최근 30일</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <Badge variant="outline">
                총 {filteredSurveys.length}개 설문 (전체 {surveys.length}개)
              </Badge>
              <Button variant="outline" onClick={resetFilters}>
                <Filter className="h-4 w-4 mr-2" />
                필터 초기화
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 설문 목록 테이블 */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>설문 목록</CardTitle>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  내보내기
                </Button>
                <Button size="sm" onClick={() => setActiveTab("form")}>
                  <Plus className="h-4 w-4 mr-2" />
                  새 설문
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {filteredSurveys.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                검색 조건에 맞는 설문이 없습니다.
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>이름</TableHead>
                        <TableHead>성별/연령</TableHead>
                        <TableHead>방문기관</TableHead>
                        <TableHead>돌봄유형</TableHead>
                        <TableHead>전체만족도</TableHead>
                        <TableHead>조사일자</TableHead>
                        <TableHead className="text-center">작업</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedSurveys.map((survey) => (
                        <TableRow key={survey.id}>
                          <TableCell className="font-medium">{survey.name}</TableCell>
                          <TableCell>
                            {getGenderText(survey.gender)} / {survey.age}세
                          </TableCell>
                          <TableCell>{survey.organization}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {getCareTypeText(survey.careType)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={getOverallSatisfaction(survey) >= 4 ? "default" : 
                                     getOverallSatisfaction(survey) >= 3 ? "secondary" : "destructive"}
                            >
                              {getOverallSatisfaction(survey)}점
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {format(new Date(survey.createdAt), 'yyyy.MM.dd', { locale: ko })}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => setSelectedSurvey(survey)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>설문 상세 정보 - {survey.name}</DialogTitle>
                                  </DialogHeader>
                                  {selectedSurvey && renderSurveyDetail(selectedSurvey)}
                                </DialogContent>
                              </Dialog>

                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEditSurvey(survey)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm" className="text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>설문 삭제 확인</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      <strong>{survey.name}</strong>님의 설문을 삭제하시겠습니까?
                                      이 작업은 되돌릴 수 없습니다.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>취소</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteSurvey(survey.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      삭제
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* 페이지네이션 */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between p-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredSurveys.length)} / {filteredSurveys.length}개 표시
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        이전
                      </Button>
                      <span className="text-sm">
                        {currentPage} / {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                      >
                        다음
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </>
    );
  }
}