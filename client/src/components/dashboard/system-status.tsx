import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Calendar as CalendarIcon, MapPin, Clock, Users, Plus, Server, Activity, Wifi } from "lucide-react";
import { useInventory } from "@/hooks/use-storage";

interface ScheduleEvent {
  id: string;
  date: Date;
  institution: string;
  type: 'survey' | 'distribution' | 'meeting' | 'inspection';
  title: string;
  description?: string;
  time: string;
  endTime?: string;
  location?: string;
  participants?: {
    elderly: number;
    socialWorker: number;
    lifeSupporter: number;
    regionalSupport: number;
  };
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  contactPerson?: {
    name: string;
    phone: string;
    mobile: string;
  };
  institutionEmail?: string;
  participationType?: 'active' | 'conditional';
  eventContent?: string;
}

export default function SystemStatus() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [scheduleEvents, setScheduleEvents] = useState<ScheduleEvent[]>([
    {
      id: '1',
      date: new Date(),
      institution: '창원시 노인복지관',
      type: 'survey',
      title: '만족도 조사 진행',
      description: '분기별 만족도 조사 실시',
      time: '14:00',
      location: '창원시 노인복지관',
      participants: {
        elderly: 20,
        socialWorker: 2,
        lifeSupporter: 2,
        regionalSupport: 1
      },
      status: 'scheduled'
    },
    {
      id: '2',
      date: new Date(Date.now() + 86400000), // 내일
      institution: '진주시 사회복지협의회',
      type: 'distribution',
      title: '만족도 조사 진행',
      description: '신규 물품 배분 및 재고 확인',
      time: '10:30',
      location: '진주시 사회복지협의회',
      participants: {
        elderly: 5,
        socialWorker: 1,
        lifeSupporter: 1,
        regionalSupport: 1
      },
      status: 'scheduled'
    },
    {
      id: '3',
      date: new Date(Date.now() + 172800000), // 모레
      institution: '통영시 종합사회복지관',
      type: 'meeting',
      title: '만족도 조사 진행',
      description: '이번 달 성과 점검 및 다음 달 계획 수립',
      time: '15:30',
      location: '통영시 종합사회복지관',
      participants: {
        elderly: 8,
        socialWorker: 2,
        lifeSupporter: 1,
        regionalSupport: 1
      },
      status: 'scheduled'
    }
  ]);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [newEvent, setNewEvent] = useState<Partial<ScheduleEvent>>({
    type: 'survey',
    title: '만족도 조사 진행',
    participants: {
      elderly: 0,
      socialWorker: 0,
      lifeSupporter: 0,
      regionalSupport: 0
    },
    contactPerson: {
      name: '',
      phone: '',
      mobile: ''
    },
    participationType: 'active'
  });

  const { distributions } = useInventory();

  const systemMetrics = [
    { label: '서버 상태', value: '정상', color: 'text-green-600', icon: Server },
    { label: '네트워크', value: '안정', color: 'text-green-600', icon: Wifi },
    { label: '활성 사용자', value: '12명', color: 'text-blue-600', icon: Users },
    { label: '시스템 가동률', value: '99.8%', color: 'text-green-600', icon: Activity }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'survey': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'distribution': return 'bg-green-100 text-green-800 border-green-200';
      case 'meeting': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'inspection': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'in-progress': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'completed': return 'bg-green-50 text-green-700 border-green-200';
      case 'cancelled': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'survey': return '설문조사';
      case 'distribution': return '물품배분';
      case 'meeting': return '회의';
      case 'inspection': return '점검';
      default: return '기타';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'scheduled': return '예정';
      case 'in-progress': return '진행중';
      case 'completed': return '완료';
      case 'cancelled': return '취소';
      default: return '알 수 없음';
    }
  };

  const selectedDateEvents = scheduleEvents.filter(event => 
    selectedDate && event.date.toDateString() === selectedDate.toDateString()
  );

  const hasEvents = (date: Date) => {
    return scheduleEvents.some(event => 
      event.date.toDateString() === date.toDateString()
    );
  };

  const addEvent = () => {
    if (newEvent.institution && newEvent.time && newEvent.location && selectedDate && newEvent.participants && newEvent.contactPerson?.name) {
      const event: ScheduleEvent = {
        id: Date.now().toString(),
        date: selectedDate,
        institution: newEvent.institution,
        type: 'survey',
        title: '만족도 조사 진행',
        description: newEvent.description,
        time: newEvent.time,
        endTime: newEvent.endTime,
        location: newEvent.location,
        participants: newEvent.participants,
        contactPerson: newEvent.contactPerson,
        institutionEmail: newEvent.institutionEmail,
        participationType: newEvent.participationType,
        eventContent: newEvent.eventContent,
        status: 'scheduled'
      };
      setScheduleEvents([...scheduleEvents, event]);
      setNewEvent({
        type: 'survey',
        title: '만족도 조사 진행',
        participants: {
          elderly: 0,
          socialWorker: 0,
          lifeSupporter: 0,
          regionalSupport: 0
        },
        contactPerson: {
          name: '',
          phone: '',
          mobile: ''
        },
        participationType: 'active'
      });
      setIsAddEventOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 시스템 상태 */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="flex items-center text-lg font-semibold text-foreground">
            <Activity className="h-5 w-5 mr-2 text-primary" />
            시스템 상태
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {systemMetrics.map((metric, index) => {
              const IconComponent = metric.icon;
              return (
                <div key={index} className="flex items-center space-x-2">
                  <IconComponent className={`h-4 w-4 ${metric.color}`} />
                  <div>
                    <p className="text-xs text-muted-foreground">{metric.label}</p>
                    <p className={`text-sm font-semibold ${metric.color}`}>{metric.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 방문 일정 달력 */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-lg font-semibold text-foreground">
            <div className="flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2 text-primary" />
              방문 일정 관리
            </div>
            <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  일정 추가
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>현장 모니터링 참여 신청</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  {/* 기관 기본정보 */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm">기관 기본정보</h4>
                    <div>
                      <Label>기관명*</Label>
                      <Input
                        value={newEvent.institution || ''}
                        onChange={(e) => setNewEvent({ ...newEvent, institution: e.target.value })}
                        placeholder="기관명을 입력하세요"
                      />
                    </div>
                    <div>
                      <Label>기관 이메일</Label>
                      <Input
                        type="email"
                        value={newEvent.institutionEmail || ''}
                        onChange={(e) => setNewEvent({ ...newEvent, institutionEmail: e.target.value })}
                        placeholder="기관 이메일을 입력하세요"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label>담당자 성명*</Label>
                        <Input
                          value={newEvent.contactPerson?.name || ''}
                          onChange={(e) => setNewEvent({ 
                            ...newEvent, 
                            contactPerson: { 
                              ...newEvent.contactPerson, 
                              name: e.target.value 
                            } 
                          })}
                          placeholder="담당자명"
                        />
                      </div>
                      <div>
                        <Label>전화번호</Label>
                        <Input
                          value={newEvent.contactPerson?.phone || ''}
                          onChange={(e) => setNewEvent({ 
                            ...newEvent, 
                            contactPerson: { 
                              ...newEvent.contactPerson, 
                              phone: e.target.value 
                            } 
                          })}
                          placeholder="전화번호"
                        />
                      </div>
                      <div>
                        <Label>휴대폰</Label>
                        <Input
                          value={newEvent.contactPerson?.mobile || ''}
                          onChange={(e) => setNewEvent({ 
                            ...newEvent, 
                            contactPerson: { 
                              ...newEvent.contactPerson, 
                              mobile: e.target.value 
                            } 
                          })}
                          placeholder="휴대폰"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 참여 의사 */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm">현장 모니터링 참여 의사</h4>
                    <div>
                      <Label>참여 의향*</Label>
                      <Select
                        value={newEvent.participationType || 'active'}
                        onValueChange={(value) => setNewEvent({ ...newEvent, participationType: value as 'active' | 'conditional' })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">적극 참여 (조건 충족하여 참여 확정)</SelectItem>
                          <SelectItem value="conditional">조건부 참여 (일정 조율 후 참여 가능)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* 행사 계획 현황 */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm">행사 계획 현황</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label>시작 시간*</Label>
                        <Input
                          type="time"
                          value={newEvent.time || ''}
                          onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>종료 시간</Label>
                        <Input
                          type="time"
                          value={newEvent.endTime || ''}
                          onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <Label>장소*</Label>
                      <Input
                        value={newEvent.location || ''}
                        onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                        placeholder="행사 장소를 입력하세요"
                      />
                    </div>
                    <div>
                      <Label>행사 내용</Label>
                      <Textarea
                        value={newEvent.eventContent || ''}
                        onChange={(e) => setNewEvent({ ...newEvent, eventContent: e.target.value })}
                        placeholder="행사 내용을 상세히 입력하세요"
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* 예상 참여자 수 */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm">예상 참여자 수</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label>어르신</Label>
                        <Input
                          type="number"
                          value={newEvent.participants?.elderly || 0}
                          onChange={(e) => setNewEvent({ 
                            ...newEvent, 
                            participants: { 
                              ...newEvent.participants, 
                              elderly: parseInt(e.target.value) || 0 
                            } 
                          })}
                          placeholder="어르신 수"
                        />
                      </div>
                      <div>
                        <Label>전담사회복지사</Label>
                        <Input
                          type="number"
                          value={newEvent.participants?.socialWorker || 0}
                          onChange={(e) => setNewEvent({ 
                            ...newEvent, 
                            participants: { 
                              ...newEvent.participants, 
                              socialWorker: parseInt(e.target.value) || 0 
                            } 
                          })}
                          placeholder="전담사회복지사 수"
                        />
                      </div>
                      <div>
                        <Label>생활지원사</Label>
                        <Input
                          type="number"
                          value={newEvent.participants?.lifeSupporter || 0}
                          onChange={(e) => setNewEvent({ 
                            ...newEvent, 
                            participants: { 
                              ...newEvent.participants, 
                              lifeSupporter: parseInt(e.target.value) || 0 
                            } 
                          })}
                          placeholder="생활지원사 수"
                        />
                      </div>
                      <div>
                        <Label>광역지원기관</Label>
                        <Input
                          type="number"
                          value={newEvent.participants?.regionalSupport || 0}
                          onChange={(e) => setNewEvent({ 
                            ...newEvent, 
                            participants: { 
                              ...newEvent.participants, 
                              regionalSupport: parseInt(e.target.value) || 0 
                            } 
                          })}
                          placeholder="광역지원기관 수"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>추가 설명 (선택)</Label>
                    <Textarea
                      value={newEvent.description || ''}
                      onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                      placeholder="추가 설명을 입력하세요"
                      rows={2}
                    />
                  </div>

                  <Button onClick={addEvent} className="w-full">
                    모니터링 일정 등록
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
              modifiers={{
                hasEvents: (date) => hasEvents(date)
              }}
              modifiersClassNames={{
                hasEvents: "bg-primary/10 text-primary font-semibold"
              }}
            />

            {/* 선택된 날짜의 일정 */}
            {selectedDate && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-foreground">
                  {selectedDate.toLocaleDateString('ko-KR', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    weekday: 'long'
                  })} 일정
                </h4>

                {selectedDateEvents.length > 0 ? (
                  <div className="space-y-2">
                    {selectedDateEvents.map((event) => (
                      <div key={event.id} className="p-3 border rounded-lg bg-muted/30">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h5 className="text-sm font-semibold text-foreground">{event.title}</h5>
                          </div>
                          <div className="flex space-x-1">
                            <Badge className={`text-xs ${getTypeColor(event.type)}`}>
                              {getTypeLabel(event.type)}
                            </Badge>
                            <Badge className={`text-xs ${getStatusColor(event.status)}`}>
                              {getStatusLabel(event.status)}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{event.time}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3" />
                            <span className="text-xs">{event.location}</span>
                          </div>
                          <div className="space-y-1 text-xs">
                            <div className="flex items-center justify-between">
                              <span>어르신:</span>
                              <span>{event.participants.elderly}명</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>전담사회복지사:</span>
                              <span>{event.participants.socialWorker}명</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>생활지원사:</span>
                              <span>{event.participants.lifeSupporter}명</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>광역지원기관:</span>
                              <span>{event.participants.regionalSupport}명</span>
                            </div>
                          </div>
                        </div>

                        {event.description && (
                          <p className="text-xs text-muted-foreground mt-2">{event.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    이 날짜에는 예정된 일정이 없습니다.
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}