import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Warehouse, Truck, Package, Percent, Plus, FileText, Download, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useInventory } from "@/hooks/use-storage";
import InventoryTable from "@/components/inventory/inventory-table";
import ExcelProcessor from "@/lib/excel-utils";
import type { InventoryDistribution, InventorySummary } from "@shared/schema";

export default function Inventory() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryDistribution | null>(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    organization: '',
    contact: '',
    phone: '',
    elderly: 0,
    staff: 0,
    distributed: 0,
    signature: '',
    notes: '',
  });

  const { distributions, summary, saveDistribution, deleteDistribution, updateSummary, loading } = useInventory();
  const { toast } = useToast();

  const organizations: string[] = [];

  // Calculate summary statistics
  const totalDistributed = distributions.reduce((sum, dist) => sum + dist.distributed, 0);
  const totalStock = summary?.totalStock || 2500; // Default value
  const remaining = totalStock - totalDistributed;
  const distributionRate = totalStock > 0 ? (totalDistributed / totalStock) * 100 : 0;

  const [isEditingStock, setIsEditingStock] = useState(false);
  const [stockInput, setStockInput] = useState(totalStock.toString());
  
  // Create refs for all form inputs
  const dateRef = useRef<HTMLInputElement>(null);
  const organizationRef = useRef<HTMLInputElement>(null);
  const contactRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const elderlyRef = useRef<HTMLInputElement>(null);
  const staffRef = useRef<HTMLInputElement>(null);
  const distributedRef = useRef<HTMLInputElement>(null);
  const signatureRef = useRef<HTMLInputElement>(null);
  const notesRef = useRef<HTMLTextAreaElement>(null);

  // Update summary when distributions change
  useEffect(() => {
    const newSummary: InventorySummary = {
      totalStock,
      totalDistributed,
      remaining,
      distributionRate,
      lastUpdated: new Date(),
    };
    updateSummary(newSummary);
  }, [distributions]);

  const handleStockUpdate = async () => {
    const newStock = parseInt(stockInput);
    if (isNaN(newStock) || newStock < 0) {
      toast({
        title: "입력 오류",
        description: "올바른 숫자를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    const newSummary: InventorySummary = {
      totalStock: newStock,
      totalDistributed,
      remaining: newStock - totalDistributed,
      distributionRate: newStock > 0 ? (totalDistributed / newStock) * 100 : 0,
      lastUpdated: new Date(),
    };

    await updateSummary(newSummary);
    setIsEditingStock(false);

    toast({
      title: "수정 완료",
      description: "총 입고량이 수정되었습니다.",
    });
  };

  const resetForm = () => {
    const defaultDate = new Date().toISOString().split('T')[0];
    setFormData({
      date: defaultDate,
      organization: '',
      contact: '',
      phone: '',
      elderly: 0,
      staff: 0,
      distributed: 0,
      signature: '',
      notes: '',
    });
    
    // Clear all form inputs using refs
    if (dateRef.current) dateRef.current.value = defaultDate;
    if (organizationRef.current) organizationRef.current.value = '';
    if (contactRef.current) contactRef.current.value = '';
    if (phoneRef.current) phoneRef.current.value = '';
    if (elderlyRef.current) elderlyRef.current.value = '0';
    if (staffRef.current) staffRef.current.value = '0';
    if (distributedRef.current) distributedRef.current.value = '0';
    if (signatureRef.current) signatureRef.current.value = '';
    if (notesRef.current) notesRef.current.value = '';
  };

  const handleSubmit = async () => {
    try {
      // Get all values from refs to avoid state conflicts
      const dateValue = dateRef.current?.value || new Date().toISOString().split('T')[0];
      const organizationValue = organizationRef.current?.value || '';
      const contactValue = contactRef.current?.value || '';
      const phoneValue = phoneRef.current?.value || '';
      const elderlyValue = parseInt(elderlyRef.current?.value || '0');
      const staffValue = parseInt(staffRef.current?.value || '0');
      const distributedValue = parseInt(distributedRef.current?.value || '0');
      const signatureValue = signatureRef.current?.value || '';
      const notesValue = notesRef.current?.value || '';
      
      const distributionData: InventoryDistribution = {
        id: editingItem?.id || `dist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        date: new Date(dateValue),
        organization: organizationValue,
        contact: contactValue,
        phone: phoneValue,
        elderly: elderlyValue,
        staff: staffValue,
        distributed: distributedValue,
        signature: signatureValue,
        notes: notesValue,
        createdAt: editingItem?.createdAt || new Date(),
      };

      await saveDistribution(distributionData);
      resetForm();
      setIsAddModalOpen(false);
      setIsEditModalOpen(false);
      setEditingItem(null);

      toast({
        title: editingItem ? "수정 완료" : "저장 완료",
        description: `반출 기록이 ${editingItem ? '수정' : '저장'}되었습니다.`,
      });
    } catch (error) {
      console.error('Failed to save distribution:', error);
    }
  };

  const handleEdit = (distribution: InventoryDistribution) => {
    setEditingItem(distribution);
    setFormData({
      date: distribution.date.toISOString().split('T')[0],
      organization: distribution.organization,
      contact: distribution.contact,
      phone: distribution.phone,
      elderly: distribution.elderly,
      staff: distribution.staff,
      distributed: distribution.distributed,
      signature: distribution.signature,
      notes: distribution.notes || '',
    });
    
    // Set all input values directly using refs
    if (dateRef.current) dateRef.current.value = distribution.date.toISOString().split('T')[0];
    if (organizationRef.current) organizationRef.current.value = distribution.organization;
    if (contactRef.current) contactRef.current.value = distribution.contact;
    if (phoneRef.current) phoneRef.current.value = distribution.phone;
    if (elderlyRef.current) elderlyRef.current.value = distribution.elderly.toString();
    if (staffRef.current) staffRef.current.value = distribution.staff.toString();
    if (distributedRef.current) distributedRef.current.value = distribution.distributed.toString();
    if (signatureRef.current) signatureRef.current.value = distribution.signature;
    if (notesRef.current) notesRef.current.value = distribution.notes || '';
    
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('정말로 이 반출 기록을 삭제하시겠습니까?')) {
      await deleteDistribution(id);
    }
  };

  const handleExportReport = () => {
    if (distributions.length === 0) {
      toast({
        title: "내보낼 데이터 없음",
        description: "반출 기록이 없습니다.",
        variant: "destructive",
      });
      return;
    }

    ExcelProcessor.exportInventoryDistributions(distributions);
    toast({
      title: "내보내기 완료",
      description: "물품 반출 기록이 엑셀 파일로 내보내졌습니다.",
    });
  };

  const summaryCards = [
    {
      title: "총 입고량",
      value: totalStock.toLocaleString(),
      icon: Warehouse,
      color: "bg-blue-100 text-blue-600",
      editable: true,
    },
    {
      title: "총 반출량",
      value: totalDistributed.toLocaleString(),
      icon: Truck,
      color: "bg-orange-100 text-orange-600",
    },
    {
      title: "잔여 재고",
      value: remaining.toLocaleString(),
      icon: Package,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "반출률",
      value: `${distributionRate.toFixed(1)}%`,
      icon: Percent,
      color: "bg-purple-100 text-purple-600",
    },
  ];

  const DistributionForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="date">반출일자</Label>
          <Input
            ref={dateRef}
            id="date"
            type="date"
            defaultValue={formData.date}
            placeholder=""
          />
        </div>
        <div>
          <Label htmlFor="organization">방문기관</Label>
          <Input
            ref={organizationRef}
            id="organization"
            defaultValue={formData.organization}
            placeholder="방문기관명을 입력하세요"
          />
        </div>
        <div>
          <Label htmlFor="contact">담당자</Label>
          <Input
            ref={contactRef}
            id="contact"
            defaultValue={formData.contact}
            placeholder="담당자 이름"
          />
        </div>
        <div>
          <Label htmlFor="phone">연락처</Label>
          <Input
            ref={phoneRef}
            id="phone"
            defaultValue={formData.phone}
            placeholder="010-0000-0000"
          />
        </div>
        <div>
          <Label htmlFor="elderly">참여 어르신 수</Label>
          <Input
            ref={elderlyRef}
            id="elderly"
            type="number"
            defaultValue={formData.elderly}
            min="0"
          />
        </div>
        <div>
          <Label htmlFor="staff">참여 종사자 수</Label>
          <Input
            ref={staffRef}
            id="staff"
            type="number"
            defaultValue={formData.staff}
            min="0"
          />
        </div>
        <div>
          <Label htmlFor="distributed">반출 수량</Label>
          <Input
            ref={distributedRef}
            id="distributed"
            type="number"
            defaultValue={formData.distributed}
            min="0"
          />
        </div>
        <div>
          <Label htmlFor="signature">수령확인자</Label>
          <Input
            ref={signatureRef}
            id="signature"
            defaultValue={formData.signature}
            placeholder="수령확인자 성명"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="notes">비고</Label>
        <Textarea
          ref={notesRef}
          id="notes"
          defaultValue={formData.notes || ''}
          placeholder="추가 메모사항을 입력하세요 (선택사항)"
          rows={4}
          className="resize-vertical min-h-[100px]"
        />
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl">
      {/* 헤더 섹션 */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="text-center border-b-2 border-primary pb-4 mb-4">
            <h1 className="text-2xl font-bold text-foreground mb-2">2025년 노인맞춤돌봄서비스 현장 모니터링</h1>
            <h2 className="text-xl font-semibold text-primary mb-3">아이스 넥쿨러 물품반출 관리 시스템</h2>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p><strong>물품명:</strong> 아이스 넥쿨러 (목걸이형 체온조절 용품)</p>
              <p><strong>담당기관:</strong> 경상남도사회서비스원 노인맞춤돌봄서비스 광역지원기관</p>
              <p><strong>반출기간:</strong> 2025년 7월 ~ 8월</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {summaryCards.map((card, index) => {
          const IconComponent = card.icon;
          return (
            <Card key={index} className="metric-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                    {card.editable && index === 0 ? (
                      <div className="flex items-center space-x-2">
                        {isEditingStock ? (
                          <div className="flex items-center space-x-2">
                            <Input
                              type="number"
                              value={stockInput}
                              onChange={(e) => setStockInput(e.target.value)}
                              className="h-8 w-24 text-lg font-bold"
                            />
                            <Button size="sm" onClick={handleStockUpdate}>
                              저장
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => {
                                setIsEditingStock(false);
                                setStockInput(totalStock.toString());
                              }}
                            >
                              취소
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <p className="text-2xl font-bold text-foreground">{card.value}</p>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setIsEditingStock(true);
                                setStockInput(totalStock.toString());
                              }}
                              className="h-6 w-6 p-0"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-2xl font-bold text-foreground">{card.value}</p>
                    )}
                  </div>
                  <div className={`h-10 w-10 ${card.color} rounded-lg flex items-center justify-center`}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 월별 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-primary">📈 2025년 7월 반출현황</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center p-2 rounded bg-muted/30">
              <span>반출 기관 수:</span>
              <strong>{distributions.filter(d => new Date(d.date).getMonth() === 6).length}개소</strong>
            </div>
            <div className="flex justify-between items-center p-2 rounded">
              <span>총 반출량:</span>
              <strong>{distributions.filter(d => new Date(d.date).getMonth() === 6).reduce((sum, d) => sum + d.distributed, 0)}개</strong>
            </div>
            <div className="flex justify-between items-center p-2 rounded bg-muted/30">
              <span>참여 어르신:</span>
              <strong>{distributions.filter(d => new Date(d.date).getMonth() === 6).reduce((sum, d) => sum + d.elderly, 0)}명</strong>
            </div>
            <div className="flex justify-between items-center p-2 rounded">
              <span>참여 종사자:</span>
              <strong>{distributions.filter(d => new Date(d.date).getMonth() === 6).reduce((sum, d) => sum + d.staff, 0)}명</strong>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">📈 2025년 8월 반출현황</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center p-2 rounded bg-muted/30">
              <span>반출 기관 수:</span>
              <strong>{distributions.filter(d => new Date(d.date).getMonth() === 7).length}개소</strong>
            </div>
            <div className="flex justify-between items-center p-2 rounded">
              <span>총 반출량:</span>
              <strong>{distributions.filter(d => new Date(d.date).getMonth() === 7).reduce((sum, d) => sum + d.distributed, 0)}개</strong>
            </div>
            <div className="flex justify-between items-center p-2 rounded bg-muted/30">
              <span>참여 어르신:</span>
              <strong>{distributions.filter(d => new Date(d.date).getMonth() === 7).reduce((sum, d) => sum + d.elderly, 0)}명</strong>
            </div>
            <div className="flex justify-between items-center p-2 rounded">
              <span>참여 종사자:</span>
              <strong>{distributions.filter(d => new Date(d.date).getMonth() === 7).reduce((sum, d) => sum + d.staff, 0)}명</strong>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>반출 기록</CardTitle>
            <div className="flex space-x-2">
              <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    새 반출 기록
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>새 반출 기록 추가</DialogTitle>
                  </DialogHeader>
                  <DistributionForm />
                  <div className="flex justify-end space-x-2 mt-6">
                    <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                      취소
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                      저장
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>반출 기록 수정</DialogTitle>
                  </DialogHeader>
                  <DistributionForm />
                  <div className="flex justify-end space-x-2 mt-6">
                    <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                      취소
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                      수정
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <InventoryTable
            distributions={distributions}
            onEdit={handleEdit}
            onDelete={handleDelete}
            loading={loading}
          />

          <div className="px-6 py-4 border-t bg-muted/30">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                총 {distributions.length}건의 반출 기록
              </p>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  onClick={handleExportReport}
                  disabled={distributions.length === 0}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  보고서 생성
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleExportReport}
                  disabled={distributions.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  엑셀 내보내기
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 운영 안내 */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>📋 운영 안내</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-primary mb-3">반출 원칙</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• 배포 대상: 행사 참여 어르신 + 현장 참여 종사자</li>
                <li>• 1인 1개 원칙으로 배포</li>
                <li>• 수령확인서 또는 서명 필수</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-primary mb-3">주의사항</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• 물품 파손 또는 분실 시 즉시 보고</li>
                <li>• 여분 물품은 다음 기관 방문 시 활용</li>
                <li>• 미사용 물품은 반납 처리</li>
              </ul>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t text-center text-sm text-muted-foreground">
            <p><strong>문의처:</strong> 경상남도 노인맞춤돌봄서비스 광역지원기관</p>
            <p><strong>연락처:</strong> 070-8853-1672 / gnscc@naver.com</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}