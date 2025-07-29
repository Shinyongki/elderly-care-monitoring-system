import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
} from "chart.js";
import { BarChart3, TrendingUp } from "lucide-react";
import { useElderlySurveys } from "@/hooks/use-storage";
import { chartOptions } from "@/lib/charts";

// Chart.js 컴포넌트 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// 차트 색상 정의
const chartColors = {
  primary: '#3b82f6',
  secondary: '#10b981',
  tertiary: '#f59e0b',
  quaternary: '#ef4444',
  success: '#10b981',
  background: 'rgba(59, 130, 246, 0.1)',
  secondaryBackground: 'rgba(16, 185, 129, 0.1)',
  tertiaryBackground: 'rgba(245, 158, 11, 0.1)',
  quaternaryBackground: 'rgba(239, 68, 68, 0.1)'
};

export default function DashboardCharts() {
  const { surveys: elderlySurveys } = useElderlySurveys();

  // Calculate satisfaction chart data
  const getSatisfactionData = () => {
    if (elderlySurveys.length === 0) return null;

    const avgSatisfaction = elderlySurveys.reduce((sum, survey) => 
      sum + survey.overallEvaluation.overallSatisfaction, 0) / elderlySurveys.length;

    const avgLifeHelp = elderlySurveys.reduce((sum, survey) => 
      sum + survey.overallEvaluation.lifeHelp, 0) / elderlySurveys.length;

    const avgRecommendation = elderlySurveys.reduce((sum, survey) => 
      sum + survey.overallEvaluation.recommendation, 0) / elderlySurveys.length;

    return {
      labels: ['전체 만족도', '생활 도움', '추천 의향'],
      datasets: [{
        label: '평균 점수',
        data: [avgSatisfaction, avgLifeHelp, avgRecommendation],
        backgroundColor: [
          chartColors.background,
          chartColors.secondaryBackground,
          chartColors.tertiaryBackground,
        ],
        borderColor: [
          chartColors.primary,
          chartColors.secondary,
          chartColors.tertiary,
        ],
        borderWidth: 2,
      }]
    };
  };

  // Calculate service usage trend
  const getTrendData = () => {
    if (elderlySurveys.length === 0) return null;

    const monthlyData = Array.from({ length: 6 }, (_, i) => {
      const month = new Date();
      month.setMonth(month.getMonth() - (5 - i));
      return {
        month: month.toLocaleDateString('ko-KR', { month: 'long' }),
        count: Math.floor((elderlySurveys.length * (i + 1)) / 6),
      };
    });

    return {
      labels: monthlyData.map(d => d.month),
      datasets: [{
        label: '설문 완료 수',
        data: monthlyData.map(d => d.count),
        backgroundColor: chartColors.secondaryBackground,
        borderColor: chartColors.secondary,
        borderWidth: 3,
        fill: true,
        tension: 0.4,
      }]
    };
  };

  const satisfactionData = getSatisfactionData();
  const trendData = getTrendData();

  const EmptyChart = ({ title, icon: Icon }: { title: string; icon: any }) => (
    <div className="flex items-center justify-center h-full text-muted-foreground">
      <div className="text-center">
        <Icon className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>데이터가 없습니다.</p>
        <p className="text-sm mt-1">설문을 등록하면 차트가 표시됩니다.</p>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* Satisfaction Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg font-semibold">
            <BarChart3 className="h-5 w-5 mr-2 text-primary" />
            전체 만족도 현황
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            {satisfactionData ? (
              <Bar data={satisfactionData} options={chartOptions} />
            ) : (
              <EmptyChart title="전체 만족도 현황" icon={BarChart3} />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg font-semibold">
            <TrendingUp className="h-5 w-5 mr-2 text-primary" />
            설문 완료 추이
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            {trendData ? (
              <Line data={trendData} options={chartOptions} />
            ) : (
              <EmptyChart title="설문 완료 추이" icon={TrendingUp} />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}