
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  Clock, 
  Users, 
  Plus,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

interface ScheduleEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  participants: number;
  status: 'scheduled' | 'completed' | 'pending';
  description?: string;
}

const mockEvents: ScheduleEvent[] = [
  {
    id: '1',
    title: '종합사회복지관 방문',
    date: '2024-01-15',
    time: '14:00',
    location: '서울시 강남구',
    participants: 25,
    status: 'scheduled',
    description: '어르신 설문조사 및 서비스 현황 점검'
  },
  {
    id: '2',
    title: '노인복지센터 조사',
    date: '2024-01-18',
    time: '10:00',
    location: '서울시 서초구',
    participants: 18,
    status: 'pending',
    description: '복지서비스 만족도 조사'
  },
  {
    id: '3',
    title: '경로당 방문',
    date: '2024-01-12',
    time: '15:30',
    location: '서울시 중구',
    participants: 12,
    status: 'completed',
    description: '어르신 설문조사 완료'
  },
];

export default function ScheduleCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for previous month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const getEventsForDate = (day: number | null) => {
    if (!day) return [];
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return mockEvents.filter(event => event.date === dateStr);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'scheduled':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return CheckCircle2;
      case 'scheduled':
        return Calendar;
      case 'pending':
        return AlertCircle;
      default:
        return Clock;
    }
  };

  const formatDateForDisplay = (date: Date) => {
    return date.toLocaleDateString('ko-KR', { 
      year: 'numeric', 
      month: 'long'
    });
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedDate(null);
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDate(null);
  };

  const days = getDaysInMonth(currentDate);
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];

  const selectedEvents = selectedDate ? 
    mockEvents.filter(event => event.date === selectedDate) : 
    mockEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getMonth() === currentDate.getMonth() && 
             eventDate.getFullYear() === currentDate.getFullYear();
    });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-primary" />
              방문 일정 관리
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-lg font-semibold text-foreground min-w-[120px] text-center">
                {formatDateForDisplay(currentDate)}
              </span>
              <Button variant="outline" size="sm" onClick={goToNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 mb-4">
            {weekdays.map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              const eventsForDay = getEventsForDate(day);
              const dateStr = day ? `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : null;
              const isSelected = selectedDate === dateStr;
              
              return (
                <div
                  key={index}
                  className={`
                    min-h-[80px] p-2 border rounded-lg cursor-pointer transition-colors
                    ${day ? 'hover:bg-muted/50' : 'bg-muted/20'}
                    ${isSelected ? 'ring-2 ring-primary bg-primary/5' : ''}
                  `}
                  onClick={() => day && setSelectedDate(dateStr)}
                >
                  {day && (
                    <>
                      <div className="text-sm font-medium text-foreground mb-1">
                        {day}
                      </div>
                      <div className="space-y-1">
                        {eventsForDay.slice(0, 2).map(event => (
                          <div
                            key={event.id}
                            className="text-xs p-1 rounded bg-primary/10 text-primary truncate"
                          >
                            {event.title}
                          </div>
                        ))}
                        {eventsForDay.length > 2 && (
                          <div className="text-xs text-muted-foreground">
                            +{eventsForDay.length - 2}개 더
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Event Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>일정 상세</span>
            <Button size="sm" className="text-xs">
              <Plus className="h-3 w-3 mr-1" />
              일정 추가
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {selectedEvents.length > 0 ? (
              selectedEvents.map(event => {
                const StatusIcon = getStatusIcon(event.status);
                return (
                  <div key={event.id} className="border border-border rounded-lg p-3">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-foreground text-sm">{event.title}</h4>
                      <Badge className={`text-xs ${getStatusColor(event.status)}`}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {event.status === 'completed' ? '완료' : 
                         event.status === 'scheduled' ? '예정' : '대기'}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-xs text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-3 w-3" />
                        <span>{event.participants}명 참여</span>
                      </div>
                    </div>
                    
                    {event.description && (
                      <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border">
                        {event.description}
                      </p>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">
                  {selectedDate ? '선택한 날짜에 일정이 없습니다.' : '이번 달 일정이 없습니다.'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
