import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Eye, Edit, Trash2, Search, Filter, Plus, Download, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useElderlySurveys } from "@/hooks/use-storage";
import type { ElderlySurvey } from "@shared/schema";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

export default function ElderlySurveyList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [organizationFilter, setOrganizationFilter] = useState("");
  const [ageGroupFilter, setAgeGroupFilter] = useState("");
  const [dateRangeFilter, setDateRangeFilter] = useState("");
  const [selectedSurvey, setSelectedSurvey] = useState<ElderlySurvey | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { surveys, loading, deleteSurvey } = useElderlySurveys();
  const { toast } = useToast();

  // 필터링된 설문 데이터
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

  // 페이지네이션
  const totalPages = Math.ceil(filteredSurveys.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSurveys = filteredSurveys.slice(startIndex, startIndex + itemsPerPage);

  // 고유 기관 목록
  const uniqueOrganizations = Array.from(new Set(surveys.map(s => s.organization).filter(Boolean)));

  const handleDelete = async (id: string) => {
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
      {/* 기본 정보 */}
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

      {/* 서비스 이용 현황 */}
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

      {/* 종합 평가 */}
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

  if (loading) {
    return (
      <div className="max-w-6xl">
        <div className="text-center py-8">
          <div className="text-lg">설문 데이터를 불러오는 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">어르신 설문 목록</h2>
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

      {/* 검색 결과 요약 */}
      <div className="mb-4 p-4 bg-muted/30 rounded-lg border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">
              📊 검색 결과: <strong className="text-primary">{filteredSurveys.length}</strong>건
            </span>
            {(searchTerm || organizationFilter !== 'all' || ageGroupFilter !== 'all') && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>필터 적용됨:</span>
                {searchTerm && <Badge variant="secondary">검색: {searchTerm}</Badge>}
                {organizationFilter !== 'all' && <Badge variant="secondary">기관: {organizationFilter}</Badge>}
                {ageGroupFilter !== 'all' && <Badge variant="secondary">연령: {ageGroupFilter}</Badge>}
              </div>
            )}
          </div>
          {(searchTerm || organizationFilter !== 'all' || ageGroupFilter !== 'all') && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setOrganizationFilter('all');
                setAgeGroupFilter('all');
              }}
            >
              필터 초기화
            </Button>
          )}
        </div>
      </div>

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
              <Button size="sm">
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

                            <Button variant="ghost" size="sm">
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
                                    onClick={() => handleDelete(survey.id)}
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
    </div>
  );
}