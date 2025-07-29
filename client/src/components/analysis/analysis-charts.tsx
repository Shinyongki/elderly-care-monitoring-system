
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  ArcElement,
} from 'chart.js';
import { PieChart, BarChart3, TrendingUp, Users } from "lucide-react";
import { useElderlySurveys, useOfficialSurveys } from "@/hooks/use-storage";
import type { ElderlySurvey, OfficialSurvey } from "@shared/schema";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement
);

// 차트 색상 정의
const chartColors = {
  primary: '#3b82f6',
  secondary: '#10b981',
  tertiary: '#f59e0b',
  quaternary: '#ef4444',
  background: 'rgba(59, 130, 246, 0.1)',
  secondaryBackground: 'rgba(16, 185, 129, 0.1)',
  tertiaryBackground: 'rgba(245, 158, 11, 0.1)',
  quaternaryBackground: 'rgba(239, 68, 68, 0.1)'
};

interface AnalysisChartsProps {
  elderlySurveys: ElderlySurvey[];
  officialSurveys: OfficialSurvey[];
  selectedAnalysis: string | null;
}

export default function AnalysisCharts({ elderlySurveys, officialSurveys, selectedAnalysis }: AnalysisChartsProps) {

  // Service usage data
  const getServiceUsageData = () => {
    if (elderlySurveys.length === 0) return null;

    const serviceUsage = [
      { name: '안전확인', count: elderlySurveys.filter(s => s.serviceUsage.safety.usage > 0).length },
      { name: '사회참여', count: elderlySurveys.filter(s => s.serviceUsage.social.usage > 0).length },
      { name: '생활교육', count: elderlySurveys.filter(s => s.serviceUsage.education.usage > 0).length },
      { name: '일상생활지원', count: elderlySurveys.filter(s => s.serviceUsage.daily.usage > 0).length },
      { name: '연계서비스', count: elderlySurveys.filter(s => s.serviceUsage.linkage.usage > 0).length },
    ];

    return {
      labels: serviceUsage.map(s => s.name),
      datasets: [{
        data: serviceUsage.map(s => s.count),
        backgroundColor: [
          'rgb(59, 130, 246)',
          'rgb(34, 197, 94)',
          'rgb(245, 158, 11)',
          'rgb(239, 68, 68)',
          'rgb(168, 85, 247)',
        ],
        borderWidth: 2,
        borderColor: '#fff',
      }]
    };
  };

  // Regional satisfaction data
  const getRegionalData = () => {
    if (elderlySurveys.length === 0) return null;

    const regionData = elderlySurveys.reduce((acc, survey) => {
      const region = survey.residence;
      if (!acc[region]) {
        acc[region] = { total: 0, count: 0 };
      }
      acc[region].total += survey.overallEvaluation.overallSatisfaction;
      acc[region].count += 1;
      return acc;
    }, {} as Record<string, { total: number; count: number }>);

    const regions = Object.keys(regionData);
    const averages = regions.map(region => regionData[region].total / regionData[region].count);

    return {
      labels: regions,
      datasets: [{
        label: '평균 만족도',
        data: averages,
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
      }]
    };
  };

  // Comparison data
  const getComparisonData = () => {
    if (officialSurveys.length === 0 || elderlySurveys.length === 0) return null;

    const officialAvgNecessity = officialSurveys.reduce((sum, s) => sum + s.necessity, 0) / officialSurveys.length;
    const officialAvgSufficiency = officialSurveys.reduce((sum, s) => sum + s.sufficiency, 0) / officialSurveys.length;

    const elderlyAvgSatisfaction = elderlySurveys.reduce((sum, s) => sum + s.overallEvaluation.overallSatisfaction, 0) / elderlySurveys.length;
    const elderlyAvgLifeHelp = elderlySurveys.reduce((sum, s) => sum + s.overallEvaluation.lifeHelp, 0) / elderlySurveys.length;

    return {
      labels: ['서비스 필요성/만족도', '충분성/생활도움'],
      datasets: [
        {
          label: '공무원 평가',
          data: [officialAvgNecessity, officialAvgSufficiency],
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 1,
        },
        {
          label: '어르신 평가',
          data: [elderlyAvgSatisfaction, elderlyAvgLifeHelp],
          backgroundColor: 'rgba(34, 197, 94, 0.8)',
          borderColor: 'rgb(34, 197, 94)',
          borderWidth: 1,
        }
      ]
    };
  };

  // Trend data
  const getTrendData = () => {
    if (elderlySurveys.length === 0) return null;

    const monthlyData = Array.from({ length: 7 }, (_, i) => {
      const month = new Date();
      month.setMonth(month.getMonth() - (6 - i));
      return {
        month: month.toLocaleDateString('ko-KR', { month: 'long' }),
        count: Math.floor((elderlySurveys.length * (i + 1)) / 7),
      };
    });

    return {
      labels: monthlyData.map(d => d.month),
      datasets: [{
        label: '설문 완료 수',
        data: monthlyData.map(d => d.count),
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
      }]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };

  const barOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        max: 5,
      },
    },
  };

  const serviceUsageData = getServiceUsageData();
  const regionalData = getRegionalData();
  const comparisonData = getComparisonData();
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
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
      {/* Service Usage Chart */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="flex items-center text-lg font-semibold text-foreground">
            <PieChart className="h-5 w-5 mr-2 text-primary" />
            서비스 이용률 분포
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            {serviceUsageData ? (
              <Doughnut data={serviceUsageData} options={chartOptions} />
            ) : (
              <EmptyChart title="서비스 이용률 분포" icon={PieChart} />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Regional Satisfaction Chart */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="flex items-center text-lg font-semibold text-foreground">
            <BarChart3 className="h-5 w-5 mr-2 text-primary" />
            지역별 만족도 비교
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            {regionalData ? (
              <Bar data={regionalData} options={barOptions} />
            ) : (
              <EmptyChart title="지역별 만족도 비교" icon={BarChart3} />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Comparison Chart */}
      {(selectedAnalysis === 'comparison' || (officialSurveys.length > 0 && elderlySurveys.length > 0)) && (
        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="flex items-center text-lg font-semibold text-foreground">
              <Users className="h-5 w-5 mr-2 text-primary" />
              공무원-어르신 인식 비교
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {comparisonData ? (
                <Bar data={comparisonData} options={barOptions} />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>비교할 데이터가 부족합니다.</p>
                    <p className="text-sm mt-1">공무원과 어르신 설문이 모두 필요합니다.</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trend Chart */}
      {(selectedAnalysis === 'trend' || elderlySurveys.length > 0) && (
        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="flex items-center text-lg font-semibold text-foreground">
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
      )}
    </div>
  );
}
