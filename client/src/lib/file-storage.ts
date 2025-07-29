import type { 
  OfficialSurvey, 
  ElderlySurvey, 
  InventoryDistribution, 
  InventorySummary,
  Organization 
} from '@shared/schema';

export interface LocalStorageData {
  officialSurveys: OfficialSurvey[];
  elderlySurveys: ElderlySurvey[];
  inventoryDistributions: InventoryDistribution[];
  inventorySummary: InventorySummary[];
  organizations: Organization[];
  documents?: any[]; // 문서 데이터 포함
  exportedAt: string;
  version: string;
}

export class FileStorageManager {
  
  /**
   * 데이터를 JSON 파일로 다운로드
   */
  static async exportToFile(data: LocalStorageData, filename?: string): Promise<void> {
    const exportData = {
      ...data,
      exportedAt: new Date().toISOString(),
      version: '1.0.0'
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
      type: 'application/json' 
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `모니터링시스템_백업_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * JSON 파일에서 데이터 가져오기
   */
  static async importFromFile(): Promise<LocalStorageData | null> {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      
      input.onchange = (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file) {
          resolve(null);
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string) as LocalStorageData;
            resolve(data);
          } catch (error) {
            console.error('파일 읽기 실패:', error);
            resolve(null);
          }
        };
        reader.readAsText(file);
      };

      input.click();
    });
  }

  /**
   * CSV 형태로 개별 데이터 내보내기
   */
  static async exportToCSV<T extends Record<string, any>>(
    data: T[], 
    filename: string,
    headers?: Record<keyof T, string>
  ): Promise<void> {
    if (data.length === 0) return;

    const keys = Object.keys(data[0]) as (keyof T)[];
    const csvHeaders = headers ? keys.map(key => headers[key] || String(key)) : keys.map(String);
    
    const csvContent = [
      csvHeaders.join(','),
      ...data.map(row => 
        keys.map(key => {
          const value = row[key];
          if (typeof value === 'object' && value !== null) {
            return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
          }
          return `"${String(value).replace(/"/g, '""')}"`;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { 
      type: 'text/csv;charset=utf-8;' 
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * 자동 백업 (로컬스토리지 + 파일) - 모든 데이터 포함
   */
  static enableAutoBackup(data: LocalStorageData, intervalMinutes: number = 30): () => void {
    const intervalId = setInterval(async () => {
      // 로컬스토리지에 백업 (모든 데이터 포함)
      try {
        // storage에서 최신 데이터 가져오기 (동적 import를 피하기 위해 전역 접근)
        if (typeof window !== 'undefined' && (window as any).storage) {
          const storage = (window as any).storage;
          const documents = await storage.getDocuments();
          
          localStorage.setItem('monitoring-auto-backup', JSON.stringify({
            ...data,
            documents,
            backedUpAt: new Date().toISOString()
          }));
        } else {
          localStorage.setItem('monitoring-auto-backup', JSON.stringify({
            ...data,
            backedUpAt: new Date().toISOString()
          }));
        }
        console.log('통합 자동 백업 완료:', new Date().toLocaleString('ko-KR'));
      } catch (error) {
        console.error('자동 백업 실패:', error);
      }
    }, intervalMinutes * 60 * 1000);

    // cleanup 함수 반환
    return () => clearInterval(intervalId);
  }

  /**
   * 자동 백업에서 복구
   */
  static restoreFromAutoBackup(): LocalStorageData | null {
    try {
      const backup = localStorage.getItem('monitoring-auto-backup');
      if (backup) {
        return JSON.parse(backup) as LocalStorageData;
      }
    } catch (error) {
      console.error('자동 백업 복구 실패:', error);
    }
    return null;
  }

  /**
   * 브라우저 저장소 사용량 확인
   */
  static async getStorageUsage(): Promise<{
    used: number;
    quota: number;
    usagePercentage: number;
  }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      const used = estimate.usage || 0;
      const quota = estimate.quota || 0;
      return {
        used,
        quota,
        usagePercentage: quota > 0 ? (used / quota) * 100 : 0
      };
    }
    return { used: 0, quota: 0, usagePercentage: 0 };
  }

  /**
   * 데이터 압축 (대용량 데이터용)
   */
  static compressData(data: LocalStorageData): string {
    // 간단한 압축 - 실제로는 pako 같은 라이브러리 사용 권장
    return btoa(JSON.stringify(data));
  }

  /**
   * 압축된 데이터 해제
   */
  static decompressData(compressedData: string): LocalStorageData | null {
    try {
      return JSON.parse(atob(compressedData));
    } catch (error) {
      console.error('데이터 압축 해제 실패:', error);
      return null;
    }
  }
}