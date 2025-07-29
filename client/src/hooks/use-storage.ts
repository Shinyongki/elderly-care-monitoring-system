import { useEffect, useState } from 'react';
import { storage } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import type { 
  OfficialSurvey, 
  ElderlySurvey, 
  InventoryDistribution, 
  InventorySummary,
  Organization 
} from '@shared/schema';

export function useStorage() {
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const initStorage = async () => {
      try {
        await storage.init();
        setIsInitialized(true);
      } catch (error) {
        console.error('Storage initialization failed:', error);
        toast({
          title: "저장소 초기화 실패",
          description: "데이터베이스 초기화에 실패했습니다. 페이지를 새로고침해주세요.",
          variant: "destructive",
        });
      }
    };

    initStorage();
  }, [toast]);

  return { isInitialized, storage };
}

export function useOfficialSurveys() {
  const [surveys, setSurveys] = useState<OfficialSurvey[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadSurveys = async () => {
    try {
      setLoading(true);
      const data = await storage.getOfficialSurveys();
      setSurveys(data);
    } catch (error) {
      console.error('Failed to load official surveys:', error);
      toast({
        title: "데이터 로드 실패",
        description: "공무원 설문 데이터를 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSurvey = async (survey: OfficialSurvey) => {
    try {
      await storage.saveOfficialSurvey(survey);
      await loadSurveys();
      toast({
        title: "저장 완료",
        description: "공무원 설문이 저장되었습니다.",
      });
    } catch (error) {
      console.error('Failed to save official survey:', error);
      toast({
        title: "저장 실패",
        description: "설문 저장에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const saveSurveys = async (surveys: OfficialSurvey[]) => {
    try {
      await storage.saveOfficialSurveys(surveys);
      await loadSurveys();
      toast({
        title: "저장 완료",
        description: `${surveys.length}건의 공무원 설문이 저장되었습니다.`,
      });
    } catch (error) {
      console.error('Failed to save official surveys:', error);
      toast({
        title: "저장 실패",
        description: "설문 일괄 저장에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const deleteSurvey = async (id: string) => {
      try {
        setLoading(true);
        const currentSurveys = await storage.getOfficialSurveys();
        const updatedSurveys = currentSurveys.filter(survey => survey.id !== id);
        await storage.saveOfficialSurveys(updatedSurveys);
        setSurveys(updatedSurveys);
      } catch (error) {
        console.error('Failed to delete survey:', error);
      } finally {
        setLoading(false);
      }
    };

    return {
      surveys,
      loading,
      saveSurvey,
      saveSurveys,
      deleteSurvey,
      reload: loadSurveys,
    };
}

export function useElderlySurveys() {
  const [surveys, setSurveys] = useState<ElderlySurvey[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadSurveys = async () => {
    try {
      setLoading(true);
      const data = await storage.getElderlySurveys();
      setSurveys(data);
    } catch (error) {
      console.error('Failed to load elderly surveys:', error);
      toast({
        title: "데이터 로드 실패",
        description: "어르신 설문 데이터를 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSurvey = async (survey: ElderlySurvey) => {
    try {
      await storage.saveElderlySurvey(survey);
      await loadSurveys();
      toast({
        title: "저장 완료",
        description: "어르신 설문이 저장되었습니다.",
      });
    } catch (error) {
      console.error('Failed to save elderly survey:', error);
      toast({
        title: "저장 실패",
        description: "설문 저장에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const deleteSurvey = async (id: string) => {
    try {
      await storage.deleteElderlySurvey(id);
      await loadSurveys();
      toast({
        title: "삭제 완료",
        description: "어르신 설문이 삭제되었습니다.",
      });
    } catch (error) {
      console.error('Failed to delete elderly survey:', error);
      toast({
        title: "삭제 실패",
        description: "설문 삭제에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadSurveys();
  }, []);

  return {
    surveys,
    loading,
    saveSurvey,
    deleteSurvey,
    reload: loadSurveys,
  };
}

export function useInventory() {
  const [distributions, setDistributions] = useState<InventoryDistribution[]>([]);
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const [distributionData, summaryData] = await Promise.all([
        storage.getInventoryDistributions(),
        storage.getInventorySummary(),
      ]);
      setDistributions(distributionData);
      setSummary(summaryData);
    } catch (error) {
      console.error('Failed to load inventory data:', error);
      toast({
        title: "데이터 로드 실패",
        description: "물품 관리 데이터를 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveDistribution = async (distribution: InventoryDistribution) => {
    try {
      await storage.saveInventoryDistribution(distribution);
      await loadData();
      toast({
        title: "저장 완료",
        description: "반출 기록이 저장되었습니다.",
      });
    } catch (error) {
      console.error('Failed to save inventory distribution:', error);
      toast({
        title: "저장 실패",
        description: "반출 기록 저장에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const deleteDistribution = async (id: string) => {
    try {
      await storage.deleteInventoryDistribution(id);
      await loadData();
      toast({
        title: "삭제 완료",
        description: "반출 기록이 삭제되었습니다.",
      });
    } catch (error) {
      console.error('Failed to delete inventory distribution:', error);
      toast({
        title: "삭제 실패",
        description: "반출 기록 삭제에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const updateSummary = async (newSummary: InventorySummary) => {
    try {
      await storage.saveInventorySummary(newSummary);
      setSummary(newSummary);
      toast({
        title: "업데이트 완료",
        description: "재고 현황이 업데이트되었습니다.",
      });
    } catch (error) {
      console.error('Failed to update inventory summary:', error);
      toast({
        title: "업데이트 실패",
        description: "재고 현황 업데이트에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return {
    distributions,
    summary,
    loading,
    saveDistribution,
    deleteDistribution,
    updateSummary,
    reload: loadData,
  };
}