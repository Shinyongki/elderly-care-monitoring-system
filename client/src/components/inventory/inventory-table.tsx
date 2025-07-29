import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Package } from "lucide-react";
import type { InventoryDistribution } from "@shared/schema";

interface InventoryTableProps {
  distributions: InventoryDistribution[];
  onEdit: (distribution: InventoryDistribution) => void;
  onDelete: (id: string) => void;
  loading: boolean;
}

export default function InventoryTable({ distributions, onEdit, onDelete, loading }: InventoryTableProps) {
  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-muted-foreground">데이터를 불러오는 중...</p>
      </div>
    );
  }

  if (distributions.length === 0) {
    return (
      <div className="p-12 text-center">
        <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-medium text-foreground mb-2">반출 기록이 없습니다</h3>
        <p className="text-muted-foreground mb-4">새 반출 기록을 추가해보세요.</p>
      </div>
    );
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ko-KR');
  };

  const formatPhoneNumber = (phone: string) => {
    // Format phone number for privacy (show only first 3 and last 4 digits)
    if (phone.length >= 7) {
      const start = phone.slice(0, 3);
      const end = phone.slice(-4);
      const middle = '*'.repeat(phone.length - 7);
      return `${start}-${middle}-${end}`;
    }
    return phone;
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>반출일자</TableHead>
            <TableHead>방문기관</TableHead>
            <TableHead>담당자</TableHead>
            <TableHead>참여인원</TableHead>
            <TableHead>반출수량</TableHead>
            <TableHead>수령확인자</TableHead>
            <TableHead className="text-right">작업</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {distributions.map((distribution) => (
            <TableRow key={distribution.id}>
              <TableCell className="font-medium">
                {formatDate(distribution.date)}
              </TableCell>
              <TableCell>{distribution.organization}</TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{distribution.contact}</div>
                  <div className="text-sm text-muted-foreground">
                    {formatPhoneNumber(distribution.phone)}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  <div>어르신 {distribution.elderly}명</div>
                  <div className="text-muted-foreground">종사자 {distribution.staff}명</div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="bg-primary/10 text-primary font-medium">
                  {distribution.distributed}개
                </Badge>
              </TableCell>
              <TableCell>{distribution.signature}</TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(distribution)}
                    className="text-primary hover:text-primary-dark"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(distribution.id)}
                    className="text-destructive hover:text-destructive/80"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {distributions.length > 10 && (
        <div className="p-4 text-center text-sm text-muted-foreground border-t">
          {distributions.length}개 중 {Math.min(10, distributions.length)}개 표시
        </div>
      )}
    </div>
  );
}
