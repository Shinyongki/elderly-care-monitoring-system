import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CloudUpload, Save, Download, AlertCircle, CheckCircle, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useOfficialSurveys } from "@/hooks/use-storage";
import ExcelProcessor from "@/lib/excel-utils";
import type { OfficialSurvey } from "@shared/schema";

export default function OfficialSurvey() {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedData, setUploadedData] = useState<OfficialSurvey[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isValidated, setIsValidated] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { surveys, saveSurveys, loading } = useOfficialSurveys();
  const { toast } = useToast();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = async (file: File) => {
    if (!file.name.match(/\.(xlsx|xls|csv)$/)) {
      toast({
        title: "잘못된 파일 형식",
        description: "엑셀 파일(.xlsx, .xls) 또는 CSV 파일(.csv)만 업로드 가능합니다.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "파일 크기 초과",
        description: "10MB 이하의 파일만 업로드 가능합니다.",
        variant: "destructive",
      });
      return;
    }

    try {
      const data = await ExcelProcessor.readFile(file);
      const validation = ExcelProcessor.validateOfficialSurveyData(data);
      
      console.log('File processing - validation:', validation);
      
      if (validation.valid && validation.validRows > 0) {
        const surveys = ExcelProcessor.convertToOfficialSurveys(data);
        if (surveys.length > 0) {
          setUploadedData(surveys);
          setValidationErrors([]);
          setIsValidated(true);
          console.log('✅ File processed successfully:', {
            surveys: surveys.length,
            validated: true,
            errors: []
          });
          toast({
            title: "파일 업로드 성공",
            description: `${surveys.length}건의 설문 데이터가 검증되었습니다.`,
          });
        } else {
          setUploadedData([]);
          setValidationErrors(["변환 가능한 데이터가 없습니다."]);
          setIsValidated(false);
          console.log('❌ No convertible data');
          toast({
            title: "데이터 변환 실패",
            description: "유효한 설문 데이터로 변환할 수 없습니다.",
            variant: "destructive",
          });
        }
      } else {
        setUploadedData([]);
        setValidationErrors(validation.errors.length > 0 ? validation.errors : ["유효한 데이터가 없습니다."]);
        setIsValidated(false);
        console.log('❌ Validation failed:', validation.errors);
        toast({
          title: "데이터 검증 실패",
          description: validation.errors.length > 0 ? `${validation.errors.length}개의 오류가 발견되었습니다.` : "유효한 데이터가 없습니다.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('File processing error:', error);
      setUploadedData([]);
      setValidationErrors([`파일 처리 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`]);
      setIsValidated(false);
      toast({
        title: "파일 처리 실패",
        description: "파일을 읽는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    if (uploadedData.length === 0) {
      console.log('❌ Save failed: No data to save');
      return;
    }
    
    console.log('💾 Starting save process:', uploadedData.length, 'items');
    await saveSurveys(uploadedData);
    setUploadedData([]);
    setValidationErrors([]);
    setIsValidated(false);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    console.log('✅ Save completed successfully');
  };

  const handleExport = () => {
    if (surveys.length === 0) {
      toast({
        title: "내보낼 데이터 없음",
        description: "저장된 공무원 설문 데이터가 없습니다.",
        variant: "destructive",
      });
      return;
    }
    
    ExcelProcessor.exportOfficialSurveys(surveys);
    toast({
      title: "내보내기 완료",
      description: "공무원 설문 데이터가 엑셀 파일로 내보내졌습니다.",
    });
  };

  const getStatusBadge = (survey: OfficialSurvey) => {
    const isComplete = survey.department && survey.position && survey.experience && 
                     survey.necessity >= 1 && survey.sufficiency >= 1 &&
                     survey.neededServices.length > 0 && survey.effect && survey.priority;
    
    return isComplete ? (
      <Badge variant="secondary" className="bg-green-100 text-green-800">
        검증완료
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
        검토필요
      </Badge>
    );
  };

  // 버튼 활성화 상태 확인 - 개선된 조건
  const isSaveButtonDisabled = loading || uploadedData.length === 0 || !isValidated || validationErrors.length > 0;
  
  // 디버깅용 로그
  console.log('🔘 Button state:', {
    loading,
    uploadedDataLength: uploadedData.length,
    isValidated,
    validationErrorsLength: validationErrors.length,
    disabled: isSaveButtonDisabled
  });

  return (
    <div className="w-full max-w-none">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">공무원 설문조사 관리</h2>
        <p className="text-muted-foreground">엑셀 파일을 업로드하여 공무원 설문 데이터를 일괄 등록할 수 있습니다.</p>
      </div>

      {/* Upload Area */}
      <Card className="mb-6">
        <CardContent className="p-0">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
              dragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-border bg-muted/30 hover:border-primary hover:bg-primary/5'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="mx-auto max-w-xs">
              <CloudUpload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">엑셀 파일 업로드</h3>
              <p className="text-sm text-muted-foreground mb-4">
                파일을 드래그하여 놓거나 클릭하여 선택하세요
              </p>
              <div className="flex items-center space-x-2">
                <Button className="mb-2">
                  파일 선택
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    ExcelProcessor.downloadOfficialSurveyTemplate();
                  }}
                  className="mb-2"
                >
                  템플릿 다운로드
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                지원 형식: .xlsx, .xls, .csv (최대 10MB)
              </p>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileSelect}
            className="hidden"
          />
        </CardContent>
      </Card>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Card className="mb-6 border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center text-destructive">
              <AlertCircle className="h-5 w-5 mr-2" />
              데이터 검증 오류
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-40 overflow-y-auto">
              <ul className="space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index} className="text-sm text-destructive">• {error}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Preview */}
      {(uploadedData.length > 0 || surveys.length > 0) && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {uploadedData.length > 0 ? '데이터 프리뷰' : '저장된 데이터'}
              </CardTitle>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span>총 {uploadedData.length > 0 ? uploadedData.length : surveys.length}건</span>
                {uploadedData.length > 0 && isValidated && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    검증 완료
                  </Badge>
                )}
                {surveys.length > 0 && uploadedData.length === 0 && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    <Eye className="h-3 w-3 mr-1" />
                    저장된 데이터
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto max-w-full">
              <Table className="min-w-[1400px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-24 whitespace-nowrap">소속</TableHead>
                    <TableHead className="min-w-20 whitespace-nowrap">직위</TableHead>
                    <TableHead className="min-w-16 whitespace-nowrap">경력</TableHead>
                    <TableHead className="min-w-16 whitespace-nowrap text-center">필요성</TableHead>
                    <TableHead className="min-w-16 whitespace-nowrap text-center">충분성</TableHead>
                    <TableHead className="min-w-48 whitespace-nowrap">필요서비스</TableHead>
                    <TableHead className="min-w-32 whitespace-nowrap">가장큰효과</TableHead>
                    <TableHead className="min-w-32 whitespace-nowrap">가장큰문제점</TableHead>
                    <TableHead className="min-w-32 whitespace-nowrap">개선우선순위</TableHead>
                    <TableHead className="min-w-20 whitespace-nowrap text-center">인지도</TableHead>
                    <TableHead className="min-w-20 whitespace-nowrap text-center">상태</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(uploadedData.length > 0 ? uploadedData : surveys).slice(0, 10).map((survey, index) => (
                    <TableRow key={survey.id || index}>
                      <TableCell className="font-medium min-w-24 max-w-32">
                        <div className="truncate" title={survey.department}>
                          {survey.department}
                        </div>
                      </TableCell>
                      <TableCell className="min-w-20 max-w-24">
                        <div className="truncate" title={survey.position}>
                          {survey.position}
                        </div>
                      </TableCell>
                      <TableCell className="min-w-16 max-w-20">
                        <div className="truncate" title={survey.experience}>
                          {survey.experience}
                        </div>
                      </TableCell>
                      <TableCell className="text-center min-w-16">
                        {survey.necessity === 0 ? '미입력' : survey.necessity}
                      </TableCell>
                      <TableCell className="text-center min-w-16">
                        {survey.sufficiency === 0 ? '미입력' : survey.sufficiency}
                      </TableCell>
                      <TableCell className="min-w-48 max-w-64">
                        <div className="whitespace-normal text-sm leading-tight" title={survey.neededServices.join(', ') || '미입력'}>
                          {survey.neededServices.length > 0 ? survey.neededServices.join(', ') : '미입력'}
                        </div>
                      </TableCell>
                      <TableCell className="min-w-32 max-w-40">
                        <div className="whitespace-normal text-sm leading-tight" title={survey.effect || '미입력'}>
                          {survey.effect || '미입력'}
                        </div>
                      </TableCell>
                      <TableCell className="min-w-32 max-w-40">
                        <div className="whitespace-normal text-sm leading-tight" title={survey.problem || '미입력'}>
                          {survey.problem || '미입력'}
                        </div>
                      </TableCell>
                      <TableCell className="min-w-32 max-w-40">
                        <div className="whitespace-normal text-sm leading-tight" title={survey.priority || '미입력'}>
                          {survey.priority || '미입력'}
                        </div>
                      </TableCell>
                      <TableCell className="text-center min-w-20">
                        {survey.knowledge && survey.knowledge.trim() !== '' ? survey.knowledge : '미입력'}
                      </TableCell>
                      <TableCell className="text-center min-w-20">
                        {getStatusBadge(survey)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {(uploadedData.length > 10 || (surveys.length > 10 && uploadedData.length === 0)) && (
                <div className="p-4 text-center text-sm text-muted-foreground border-t">
                  {uploadedData.length > 0 ? uploadedData.length : surveys.length}개 중 10개 표시
                </div>
              )}
            </div>
            <div className="p-6 border-t bg-muted/30">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {uploadedData.length > 0 ? 
                    `${uploadedData.length}개 중 1-${Math.min(10, uploadedData.length)}개 표시` :
                    `${surveys.length}개 중 1-${Math.min(10, surveys.length)}개 표시`
                  }
                </p>
                <div className="flex items-center space-x-2">
                  {uploadedData.length > 0 && (
                    <Button 
                      onClick={handleSave}
                      disabled={isSaveButtonDisabled}
                      className="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      데이터 저장 ({uploadedData.length}건)
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    onClick={handleExport}
                    disabled={surveys.length === 0}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    내보내기
                  </Button>
                </div>
              </div>
              
              {/* 디버깅 정보 (개발용) */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-4 p-3 bg-gray-100 rounded text-xs text-gray-600">
                  <p><strong>디버깅 정보:</strong></p>
                  <p>• loading: {loading ? 'true' : 'false'}</p>
                  <p>• uploadedData: {uploadedData.length}건</p>
                  <p>• isValidated: {isValidated ? 'true' : 'false'}</p>
                  <p>• validationErrors: {validationErrors.length}개</p>
                  <p>• 버튼 비활성화: {isSaveButtonDisabled ? 'true' : 'false'}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {surveys.length === 0 && uploadedData.length === 0 && validationErrors.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <CloudUpload className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-foreground mb-2">공무원 설문 데이터가 없습니다</h3>
              <p className="text-muted-foreground mb-4">엑셀 파일을 업로드하여 설문 데이터를 등록해주세요.</p>
              <Button onClick={() => fileInputRef.current?.click()}>
                <CloudUpload className="h-4 w-4 mr-2" />
                파일 업로드
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}