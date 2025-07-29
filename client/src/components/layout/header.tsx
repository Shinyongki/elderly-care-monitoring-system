import { Heart, Download, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { storage } from "@/lib/storage";
import ExcelProcessor from "@/lib/excel-utils";

export default function Header() {
  const { toast } = useToast();

  const handleBackup = async () => {
    try {
      const data = await storage.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `모니터링시스템_백업_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "백업 완료",
        description: "데이터가 성공적으로 백업되었습니다.",
      });
    } catch (error) {
      console.error('Backup failed:', error);
      toast({
        title: "백업 실패",
        description: "데이터 백업 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 shadow-md border-b border-border sticky top-0 z-[100]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <Heart className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">노인맞춤돌봄서비스</h1>
              <p className="text-sm text-muted-foreground">현장 모니터링 통합 관리 시스템</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleBackup}
              className="text-muted-foreground hover:text-primary"
            >
              <Download className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">데이터 백업</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className="text-muted-foreground hover:text-primary"
            >
              <Settings className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">설정</span>
            </Button>
            <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-primary-foreground" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
