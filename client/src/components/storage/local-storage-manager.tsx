import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  Download, 
  Upload, 
  Save, 
  FolderOpen, 
  HardDrive, 
  FileJson, 
  FileSpreadsheet,
  Clock,
  AlertCircle,
  CheckCircle2,
  Database
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FileStorageManager, type LocalStorageData } from "@/lib/file-storage";
import { storage } from "@/lib/storage";
import { useOfficialSurveys, useElderlySurveys, useInventory } from "@/hooks/use-storage";

export default function LocalStorageManager() {
  const [storageUsage, setStorageUsage] = useState({ used: 0, quota: 0, usagePercentage: 0 });
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(false);
  const [lastBackup, setLastBackup] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { toast } = useToast();
  const { surveys: officialSurveys } = useOfficialSurveys();
  const { surveys: elderlySurveys } = useElderlySurveys();
  const { distributions, summary } = useInventory();

  useEffect(() => {
    loadStorageInfo();
    loadLastBackupTime();
  }, []);

  const loadStorageInfo = async () => {
    const usage = await FileStorageManager.getStorageUsage();
    setStorageUsage(usage);
  };

  const loadLastBackupTime = () => {
    const backup = localStorage.getItem('monitoring-auto-backup');
    if (backup) {
      try {
        const data = JSON.parse(backup);
        if (data.backedUpAt) {
          setLastBackup(data.backedUpAt);
        }
      } catch (error) {
        console.error('백업 시간 로드 실패:', error);
      }
    }
  };

  const prepareExportData = async (): Promise<LocalStorageData> => {
    return {
      officialSurveys,
      elderlySurveys,
      inventoryDistributions: distributions,
      inventorySummary: summary ? [summary] : [],
      organizations: [], // 조직 데이터는 하드코딩되어 있어서 빈 배열
      exportedAt: new Date().toISOString(),
      version: '1.0.0'
    };
  };

  const handleExportJSON = async () => {
    setIsLoading(true);
    try {
      const data = await prepareExportData();
      await FileStorageManager.exportToFile(data);

      toast({
        title: "JSON 내보내기 완료",
        description: "모든 데이터가 JSON 파일로 저장되었습니다.",
      });
    } catch (error) {
      console.error('JSON 내보내기 실패:', error);
      toast({
        title: "내보내기 실패",
        description: "파일 저장 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportJSON = async () => {
    setIsLoading(true);
    try {
      const data = await FileStorageManager.importFromFile();
      if (data) {
        // 통합 데이터 가져오기
        await storage.importData({
          officialSurveys: data.officialSurveys || [],
          elderlySurveys: data.elderlySurveys || [],
          inventoryDistributions: data.inventoryDistributions || [],
          inventorySummary: data.inventorySummary?.[0] || undefined,
          organizations: data.organizations || [],
          documents: (data as any).documents || []
        });

        toast({
          title: "통합 데이터 가져오기 완료",
          description: `모든 데이터가 성공적으로 복원되었습니다.`,
        });

        // 페이지 새로고침으로 데이터 반영
        window.location.reload();
      }
    } catch (error) {
      console.error('JSON 가져오기 실패:', error);
      toast({
        title: "가져오기 실패",
        description: "JSON 파일을 읽는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCSV = async () => {
    setIsLoading(true);
    try {
      // 공무원 설문 CSV
      if (officialSurveys.length > 0) {
        await FileStorageManager.exportToCSV(
          officialSurveys,
          '공무원설문조사',
          {
            id: 'ID',
            department: '부서',
            position: '직급',
            necessity: '필요성',
            sufficiency: '충분성',
            createdAt: '작성일시'
          }
        );
      }

      // 어르신 설문 CSV (간략화)
      if (elderlySurveys.length > 0) {
        const simplifiedData = elderlySurveys.map(survey => ({
          이름: survey.name,
          나이: survey.age,
          거주지: survey.residence,
          성별: survey.gender,
          전체만족도: survey.overallEvaluation.overallSatisfaction,
          생활도움정도: survey.overallEvaluation.lifeHelp,
          작성일: survey.createdAt
        }));

        await FileStorageManager.exportToCSV(simplifiedData, '어르신설문조사_요약');
      }

      // 물품 반출 CSV
      if (distributions.length > 0) {
        await FileStorageManager.exportToCSV(
          distributions,
          '물품반출기록',
          {
            id: 'ID',
            date: '반출일자',
            organization: '방문기관',
            contact: '담당자',
            phone: '전화번호',
            elderly: '어르신수',
            staff: '종사자수',
            distributed: '반출수량',
            signature: '수령확인자',
            createdAt: '등록일시',
            notes: '비고'
          }
        );
      }

      toast({
        title: "CSV 내보내기 완료",
        description: "데이터가 CSV 파일들로 저장되었습니다.",
      });
    } catch (error) {
      console.error('CSV 내보내기 실패:', error);
      toast({
        title: "내보내기 실패",
        description: "CSV 파일 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAutoBackup = () => {
    if (autoBackupEnabled) {
      // 자동 백업 비활성화
      setAutoBackupEnabled(false);
      localStorage.removeItem('auto-backup-enabled');
      toast({
        title: "자동 백업 비활성화",
        description: "자동 백업이 중지되었습니다.",
      });
    } else {
      // 자동 백업 활성화
      setAutoBackupEnabled(true);
      localStorage.setItem('auto-backup-enabled', 'true');

      // 즉시 백업 실행
      prepareExportData().then(data => {
        FileStorageManager.enableAutoBackup(data, 30); // 30분마다
        setLastBackup(new Date().toISOString());
      });

      toast({
        title: "자동 백업 활성화",
        description: "30분마다 자동으로 백업됩니다.",
      });
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getUsageColor = (percentage: number) => {
    if (percentage < 50) return 'text-green-600';
    if (percentage < 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleRestoreAutoBackup = async () => {
    setIsLoading(true);
    try {
      const backup = FileStorageManager.restoreFromAutoBackup();
      if (backup) {
        // 통합 데이터 복원
        await storage.importData({
          officialSurveys: backup.officialSurveys || [],
          elderlySurveys: backup.elderlySurveys || [],
          inventoryDistributions: backup.inventoryDistributions || [],
          inventorySummary: backup.inventorySummary?.[0] || undefined,
          organizations: backup.organizations || [],
          documents: (backup as any).documents || []
        });

        toast({
          title: "자동 백업 복원 완료",
          description: "자동 백업에서 모든 데이터가 복원되었습니다.",
        });

        // 페이지 새로고침으로 데이터 반영
        window.location.reload();
      } else {
        toast({
          title: "백업 없음",
          description: "복원할 자동 백업을 찾을 수 없습니다.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('자동 백업 복원 실패:', error);
      toast({
        title: "복원 실패",
        description: "자동 백업 복원에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Storage Usage Card */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="flex items-center text-lg font-semibold text-foreground">
            <HardDrive className="h-5 w-5 mr-2 text-primary" />
            로컬 저장소 상태
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">사용량</span>
              <span className={getUsageColor(storageUsage.usagePercentage)}>
                {formatBytes(storageUsage.used)} / {formatBytes(storageUsage.quota)}
              </span>
            </div>
            <Progress value={storageUsage.usagePercentage} className="h-2" />
            <div className="text-xs text-muted-foreground">
              브라우저 저장소 {storageUsage.usagePercentage.toFixed(1)}% 사용 중
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{officialSurveys.length}</div>
              <div className="text-muted-foreground">공무원 설문</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">{elderlySurveys.length}</div>
              <div className="text-muted-foreground">어르신 설문</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">{distributions.length}</div>
              <div className="text-muted-foreground">물품 반출</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Backup & Export Card */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="flex items-center text-lg font-semibold text-foreground">
            <Database className="h-5 w-5 mr-2 text-primary" />
            데이터 백업 및 내보내기
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">통합 데이터 백업:</span>
                <Badge variant="outline">
                  <Database className="h-3 w-3 mr-1" />
                  설문 + 물품 + 문서
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">마지막 자동 백업:</span>
                <Badge variant={lastBackup ? "secondary" : "destructive"}>
                  {lastBackup ? new Date(lastBackup).toLocaleString('ko-KR') : '없음'}
                </Badge>
              </div>
            </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* JSON 백업 */}
            <div className="space-y-3">
              <h4 className="font-medium text-foreground flex items-center">
                <FileJson className="h-4 w-4 mr-2 text-blue-600" />
                완전 백업 (JSON)
              </h4>
              <p className="text-sm text-muted-foreground">
                모든 데이터를 JSON 파일로 저장하여 완전한 복구가 가능합니다.
              </p>
              <div className="space-y-2">
                <Button 
                  onClick={handleExportJSON}
                  disabled={isLoading}
                  className="w-full"
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  JSON 다운로드
                </Button>
                <Button 
                  onClick={handleImportJSON}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full"
                  size="sm"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  JSON 업로드
                </Button>
              </div>
            </div>

            {/* CSV 내보내기 */}
            <div className="space-y-3">
              <h4 className="font-medium text-foreground flex items-center">
                <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600" />
                표 형태 내보내기 (CSV)
              </h4>
              <p className="text-sm text-muted-foreground">
                엑셀에서 열어볼 수 있는 CSV 파일로 데이터를 내보냅니다.
              </p>
              <Button 
                onClick={handleExportCSV}
                disabled={isLoading}
                variant="outline"
                className="w-full"
                size="sm"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                CSV 다운로드
              </Button>
            </div>
          </div>

          <Separator />

          {/* 자동 백업 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-foreground">자동 백업</h4>
                <p className="text-sm text-muted-foreground">
                  30분마다 브라우저 로컬 저장소에 자동 백업
                </p>
              </div>
              <Button
                onClick={toggleAutoBackup}
                variant={autoBackupEnabled ? "default" : "outline"}
                size="sm"
              >
                {autoBackupEnabled ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    활성화됨
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    활성화
                  </>
                )}
              </Button>
            </div>

            {autoBackupEnabled && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  자동 백업이 활성화되었습니다. 브라우저를 닫아도 데이터가 보존됩니다.
                </AlertDescription>
              </Alert>
            )}

            <Button
                onClick={handleRestoreAutoBackup}
                disabled={isLoading}
                variant="link"
                className="w-full justify-start"
                size="sm"
              >
                <Upload className="h-4 w-4 mr-2" />
                자동 백업 복원
              </Button>
          </div>
        </CardContent>
      </Card>

      {/* 사용 안내 */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="flex items-center text-lg font-semibold text-foreground">
            <FolderOpen className="h-5 w-5 mr-2 text-primary" />
            로컬 저장소 사용 안내
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div className="space-y-2">
            <h4 className="font-medium text-foreground">데이터 저장 방식</h4>
            <ul className="space-y-1 ml-4">
              <li>• 모든 데이터는 브라우저의 IndexedDB에 저장됩니다</li>
              <li>• 별도의 서버나 외부 데이터베이스가 필요하지 않습니다</li>
              <li>• 인터넷 연결 없이도 오프라인에서 사용 가능합니다</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-foreground">백업 권장사항</h4>
            <ul className="space-y-1 ml-4">
              <li>• 정기적으로 JSON 파일로 완전 백업을 받으세요</li>
              <li>• 중요한 데이터 입력 후에는 즉시 백업하세요</li>
              <li>• 브라우저 데이터 삭제 시 모든 데이터가 사라질 수 있습니다</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}