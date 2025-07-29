import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowRight, Save } from "lucide-react";
import type { InsertElderlySurvey } from "@shared/schema";

interface FormSectionProps {
  currentSection: number;
  formData: Partial<InsertElderlySurvey>;
  updateFormData: (data: Partial<InsertElderlySurvey>) => void;
  onPrevious: () => void;
  onNext: () => void;
  onSave: () => void;
  isLastSection: boolean;
}

export default function ElderlySurveyFormSections({
  currentSection,
  formData,
  updateFormData,
  onPrevious,
  onNext,
  onSave,
  isLastSection,
}: FormSectionProps) {
  const sections = [
    "기본정보",
    "서비스이용",
    "세부서비스", 
    "종합평가",
    "생활변화",
    "추가의견",
  ];

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-foreground mb-6">1. 기본정보</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="name">이름 *</Label>
          <Input
            id="name"
            value={formData.name || ''}
            onChange={(e) => updateFormData({ name: e.target.value })}
            placeholder="어르신 성함을 입력하세요"
          />
        </div>
        
        <div>
          <Label>성별 *</Label>
          <Select value={formData.gender || ''} onValueChange={(value) => updateFormData({ gender: value as 'male' | 'female' })}>
            <SelectTrigger>
              <SelectValue placeholder="선택하세요" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">남성</SelectItem>
              <SelectItem value="female">여성</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="age">연령 *</Label>
          <Input
            id="age"
            type="number"
            value={formData.age || ''}
            onChange={(e) => updateFormData({ age: parseInt(e.target.value) || 0 })}
            placeholder="만 나이"
            min="65"
            max="120"
          />
        </div>
        
        <div>
          <Label>거주지역 *</Label>
          <Select value={formData.residence || ''} onValueChange={(value) => updateFormData({ residence: value })}>
            <SelectTrigger>
              <SelectValue placeholder="선택하세요" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="시지역">시지역</SelectItem>
              <SelectItem value="군지역">군지역</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label>서비스 이용기간 (총 개월) *</Label>
          <Input
            type="number"
            value={formData.serviceMonths || ''}
            onChange={(e) => updateFormData({ serviceMonths: e.target.value })}
            placeholder="총 개월수"
            min="1"
            max="120"
          />
        </div>
        
        <div>
          <Label>돌봄유형 *</Label>
          <Select value={formData.careType || ''} onValueChange={(value) => updateFormData({ careType: value as 'general' | 'intensive' | 'specialized' })}>
            <SelectTrigger>
              <SelectValue placeholder="선택하세요" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">일반돌봄</SelectItem>
              <SelectItem value="intensive">중점돌봄</SelectItem>
              <SelectItem value="specialized">특화돌봄</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  const renderServiceUsage = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-foreground mb-6">2. 서비스 이용 현황</h3>
      
      <div className="space-y-8">
        {[
          { key: 'safety', name: '안전확인 서비스' },
          { key: 'social', name: '사회참여 서비스' },
          { key: 'education', name: '생활교육 서비스' },
          { key: 'daily', name: '일상생활지원 서비스' },
          { key: 'linkage', name: '연계서비스' },
        ].map((service) => {
          const serviceData = formData.serviceUsage?.[service.key as keyof typeof formData.serviceUsage] || { usage: 0, satisfaction: 1 };
          return (
            <div key={service.key} className="border rounded-lg p-4">
              <h4 className="font-medium text-foreground mb-4">{service.name}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>월 이용 횟수</Label>
                  <Input
                    type="number"
                    value={serviceData.usage}
                    onChange={(e) => {
                      const newUsage = parseInt(e.target.value) || 0;
                      updateFormData({
                        serviceUsage: {
                          ...formData.serviceUsage,
                          [service.key]: {
                            ...serviceData,
                            usage: newUsage,
                            satisfaction: newUsage === 0 ? 1 : serviceData.satisfaction,
                          },
                        },
                      });
                    }}
                    min="0"
                  />
                </div>
                <div>
                  <Label>만족도 (1-5점)</Label>
                  <Select 
                    value={serviceData.usage > 0 ? serviceData.satisfaction.toString() : ''} 
                    onValueChange={(value) => updateFormData({
                      serviceUsage: {
                        ...formData.serviceUsage,
                        [service.key]: {
                          ...serviceData,
                          satisfaction: parseInt(value),
                        },
                      },
                    })}
                    disabled={serviceData.usage === 0}
                  >
                    <SelectTrigger className={serviceData.usage === 0 ? 'opacity-50' : ''}>
                      <SelectValue placeholder={serviceData.usage === 0 ? "서비스 이용 시 평가 가능" : "만족도 선택"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 (매우 불만족)</SelectItem>
                      <SelectItem value="2">2 (불만족)</SelectItem>
                      <SelectItem value="3">3 (보통)</SelectItem>
                      <SelectItem value="4">4 (만족)</SelectItem>
                      <SelectItem value="5">5 (매우 만족)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderDetailServices = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-foreground mb-6">3. 세부 서비스 이용</h3>
      
      <div className="space-y-6">
        {[
          { key: 'conversation', name: '말벗서비스', desc: '대화상대, 안부확인 등' },
          { key: 'housework', name: '가사지원', desc: '청소, 세탁, 정리정돈 등' },
          { key: 'meal', name: '식사지원', desc: '식사돕기, 간단한 식사준비 등' },
          { key: 'outing', name: '외출동행', desc: '장보기, 관공서나 은행방문 등' },
          { key: 'counseling', name: '생활상담', desc: '복지정보 제공 등' },
        ].map((service) => {
          const serviceData = formData.detailServices?.[service.key as keyof typeof formData.detailServices] || { used: false };
          return (
            <div key={service.key} className="border rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Checkbox
                  checked={serviceData.used}
                  onCheckedChange={(checked) => {
                    const newServiceData = {
                      ...serviceData,
                      used: !!checked,
                    };
                    
                    // 서비스를 이용하지 않으면 만족도 데이터 제거
                    if (!checked) {
                      delete newServiceData.satisfaction;
                    }
                    
                    updateFormData({
                      detailServices: {
                        ...formData.detailServices,
                        [service.key]: newServiceData,
                      },
                    });
                  }}
                />
                <Label className="font-medium">{service.name}</Label>
              </div>
              <p className="text-sm text-muted-foreground mb-4">({service.desc})</p>
              
              {serviceData.used && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <Label className="text-sm font-medium text-blue-800">만족도 평가</Label>
                  <p className="text-xs text-blue-600 mb-2">이용하신 서비스에 대한 만족도를 평가해주세요</p>
                  <Select 
                    value={serviceData.satisfaction?.toString() || ''}
                    onValueChange={(value) => updateFormData({
                      detailServices: {
                        ...formData.detailServices,
                        [service.key]: {
                          ...serviceData,
                          satisfaction: parseInt(value),
                        },
                      },
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="만족도 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4">매우만족</SelectItem>
                      <SelectItem value="3">만족</SelectItem>
                      <SelectItem value="2">보통</SelectItem>
                      <SelectItem value="1">불만족</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {!serviceData.used && (
                <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-500">
                  ℹ️ 이 서비스를 이용하지 않으셨습니다
                </div>
              )}
            </div>
          );
        })}
        
        {/* 불만사항 */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <h4 className="font-medium mb-4">불만사항 (해당시에만 작성)</h4>
          <div className="space-y-4">
            <div>
              <Label>서비스 종류</Label>
              <Input
                value={formData.detailServices?.complaintService || ''}
                onChange={(e) => updateFormData({
                  detailServices: {
                    ...formData.detailServices,
                    complaintService: e.target.value,
                  },
                })}
                placeholder="불만족하신 서비스 종류"
              />
            </div>
            <div>
              <Label>불만 이유</Label>
              <Textarea
                value={formData.detailServices?.complaintReason || ''}
                onChange={(e) => updateFormData({
                  detailServices: {
                    ...formData.detailServices,
                    complaintReason: e.target.value,
                  },
                })}
                placeholder="불만족하신 이유를 입력해주세요"
                rows={3}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderOverallEvaluation = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-foreground mb-6">4. 종합 평가</h3>
      
      <div className="space-y-6">
        {[
          { key: 'desiredService', name: '원하는 서비스 제공 정도' },
          { key: 'sufficientService', name: '충분한 서비스 제공 정도' },
          { key: 'lifeHelp', name: '생활에 도움이 되는 정도' },
          { key: 'accessibility', name: '서비스 접근 용이성' },
          { key: 'overallSatisfaction', name: '전체적인 만족도' },
        ].map((item) => {
          const value = formData.overallEvaluation?.[item.key as keyof typeof formData.overallEvaluation] || 1;
          return (
            <div key={item.key} className="border rounded-lg p-4">
              <Label className="font-medium mb-4 block">{item.name}</Label>
              <RadioGroup
                value={value.toString()}
                onValueChange={(val) => updateFormData({
                  overallEvaluation: {
                    ...formData.overallEvaluation,
                    [item.key]: parseInt(val),
                  },
                })}
                className="flex space-x-6"
              >
                {[1, 2, 3, 4, 5].map((rating) => (
                  <div key={rating} className="flex items-center space-x-2">
                    <RadioGroupItem value={rating.toString()} />
                    <Label>{rating}점</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderLifeChanges = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-foreground mb-6">5. 생활 변화</h3>
      
      <div className="space-y-6">
        {[
          { key: 'loneliness', name: '외로움 감소' },
          { key: 'safety', name: '안전 불안 감소' },
          { key: 'learning', name: '새로운 것 학습' },
          { key: 'economic', name: '경제적 도움' },
          { key: 'social', name: '사회적 교류 증가' },
          { key: 'health', name: '건강관리 도움' },
          { key: 'convenience', name: '생활 편의성 향상' },
          { key: 'lifeSatisfaction', name: '삶의 만족도 향상' },
        ].map((item) => {
          const value = formData.lifeChanges?.[item.key as keyof typeof formData.lifeChanges] || 1;
          return (
            <div key={item.key} className="border rounded-lg p-4">
              <Label className="font-medium mb-4 block">{item.name}</Label>
              <RadioGroup
                value={value.toString()}
                onValueChange={(val) => updateFormData({
                  lifeChanges: {
                    ...formData.lifeChanges,
                    [item.key]: parseInt(val),
                  },
                })}
                className="flex space-x-6"
              >
                {[1, 2, 3, 4, 5].map((rating) => (
                  <div key={rating} className="flex items-center space-x-2">
                    <RadioGroupItem value={rating.toString()} />
                    <Label>{rating}점</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderAdditionalOpinions = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-foreground mb-6">6. 추가 의견</h3>
      
      <div className="space-y-6">
        <div>
          <Label>가장 만족하는 서비스 (복수 선택 가능)</Label>
          <p className="text-sm text-muted-foreground mb-2">받으신 서비스 중에서 만족하는 것을 모두 선택해주세요.</p>
          <div className="flex flex-wrap gap-4">
            {[
              { value: 'safety', label: '안전지원' },
              { value: 'social', label: '사회참여' },
              { value: 'education', label: '생활교육' },
              { value: 'linkage', label: '연계서비스' },
              { value: 'daily', label: '일상생활지원' },
            ].map((option) => {
              const satisfiedServices = Array.isArray(formData.additionalOpinions?.mostSatisfiedService) 
                ? formData.additionalOpinions.mostSatisfiedService 
                : formData.additionalOpinions?.mostSatisfiedService 
                  ? [formData.additionalOpinions.mostSatisfiedService] 
                  : [];
              const isSelected = satisfiedServices.includes(option.value);
              
              return (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => {
                      const current = Array.isArray(formData.additionalOpinions?.mostSatisfiedService) 
                        ? formData.additionalOpinions.mostSatisfiedService 
                        : formData.additionalOpinions?.mostSatisfiedService 
                          ? [formData.additionalOpinions.mostSatisfiedService] 
                          : [];
                      
                      const updated = checked 
                        ? [...current, option.value]
                        : current.filter(item => item !== option.value);
                      
                      updateFormData({
                        additionalOpinions: {
                          ...formData.additionalOpinions,
                          mostSatisfiedService: updated,
                        },
                      });
                    }}
                  />
                  <Label>{option.label}</Label>
                </div>
              );
            })}
          </div>
        </div>
        
        <div>
          <Label>개선이 필요한 부분 (최대 4개)</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {[
              '서비스 시간 확대', '서비스 종류 다양화', '전문성 향상', '접근성 개선',
              '의사소통 개선', '개인맞춤서비스', '응급대응체계', '기타'
            ].map((improvement) => {
              const isSelected = formData.additionalOpinions?.improvements?.includes(improvement) || false;
              return (
                <div key={improvement} className="flex items-center space-x-2">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => {
                      const current = formData.additionalOpinions?.improvements || [];
                      const updated = checked 
                        ? [...current, improvement].slice(0, 4)
                        : current.filter(item => item !== improvement);
                      
                      updateFormData({
                        additionalOpinions: {
                          ...formData.additionalOpinions,
                          improvements: updated,
                        },
                      });
                    }}
                  />
                  <Label className="text-sm">{improvement}</Label>
                </div>
              );
            })}
          </div>
          {formData.additionalOpinions?.improvements?.includes('기타') && (
            <div className="mt-3">
              <Label className="text-sm">기타 개선 필요 사항을 직접 입력해주세요</Label>
              <Input
                value={formData.additionalOpinions?.improvementsOther || ''}
                onChange={(e) => updateFormData({
                  additionalOpinions: {
                    ...formData.additionalOpinions,
                    improvementsOther: e.target.value,
                  },
                })}
                placeholder="기타 개선 필요 사항을 입력하세요"
                className="mt-1"
              />
            </div>
          )}
        </div>
        
        <div>
          <Label>추가로 희망하는 서비스 (최대 4개)</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {[
              '의료지원서비스', '문화여가서비스', '교육프로그램', '상담서비스',
              '이동지원서비스', '정보제공서비스', '생활편의서비스', '기타'
            ].map((service) => {
              const isSelected = formData.additionalOpinions?.additionalServices?.includes(service) || false;
              return (
                <div key={service} className="flex items-center space-x-2">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => {
                      const current = formData.additionalOpinions?.additionalServices || [];
                      const updated = checked 
                        ? [...current, service].slice(0, 4)
                        : current.filter(item => item !== service);
                      
                      updateFormData({
                        additionalOpinions: {
                          ...formData.additionalOpinions,
                          additionalServices: updated,
                        },
                      });
                    }}
                  />
                  <Label className="text-sm">{service}</Label>
                </div>
              );
            })}
          </div>
          {formData.additionalOpinions?.additionalServices?.includes('기타') && (
            <div className="mt-3">
              <Label className="text-sm">기타 희망 서비스를 직접 입력해주세요</Label>
              <Input
                value={formData.additionalOpinions?.additionalServicesOther || ''}
                onChange={(e) => updateFormData({
                  additionalOpinions: {
                    ...formData.additionalOpinions,
                    additionalServicesOther: e.target.value,
                  },
                })}
                placeholder="기타 희망 서비스를 입력하세요"
                className="mt-1"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderCurrentSection = () => {
    switch (currentSection) {
      case 0: return renderBasicInfo();
      case 1: return renderServiceUsage();
      case 2: return renderDetailServices();
      case 3: return renderOverallEvaluation();
      case 4: return renderLifeChanges();
      case 5: return renderAdditionalOpinions();
      default: return renderBasicInfo();
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        {renderCurrentSection()}
        
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
          <Button 
            variant="outline" 
            onClick={onPrevious}
            disabled={currentSection === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            이전
          </Button>
          
          <div className="text-sm text-muted-foreground">
            {currentSection + 1} / {sections.length} 섹션
          </div>
          
          {isLastSection ? (
            <Button onClick={onSave} className="bg-green-600 hover:bg-green-700">
              <Save className="h-4 w-4 mr-2" />
              저장
            </Button>
          ) : (
            <Button onClick={onNext}>
              다음
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
