
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  FileText, 
  Upload, 
  Download, 
  Trash2, 
  Search, 
  FolderOpen, 
  ChevronDown, 
  ChevronRight,
  File,
  FileSpreadsheet,
  Image,
  AlertCircle,
  CheckCircle2,
  Clipboard,
  Mail,
  BarChart3,
  Package,
  Truck,
  Building,
  TrendingUp,
  Eye,
  Edit,
  MoveUp,
  Save,
  X,
  Plus,
  FolderPlus,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { storage } from "@/lib/storage";
import type { Document, DocumentCategory } from "@shared/schema";

// 카테고리별 색상과 아이콘 매핑
const categoryConfig = {
  '01_계획안': { color: 'bg-blue-500', icon: Clipboard, bgClass: 'bg-blue-50 border-blue-200' },
  '02_공문발송': { color: 'bg-green-500', icon: Mail, bgClass: 'bg-green-50 border-green-200' },
  '03_설문조사': { color: 'bg-purple-500', icon: BarChart3, bgClass: 'bg-purple-50 border-purple-200' },
  '04_물품관리(업체)': { color: 'bg-orange-500', icon: Package, bgClass: 'bg-orange-50 border-orange-200' },
  '05_수행기관배포': { color: 'bg-cyan-500', icon: Truck, bgClass: 'bg-cyan-50 border-cyan-200' },
  '06_신청기관': { color: 'bg-indigo-500', icon: Building, bgClass: 'bg-indigo-50 border-indigo-200' },
  '07_결과보고': { color: 'bg-red-500', icon: TrendingUp, bgClass: 'bg-red-50 border-red-200' },
} as const;

// 파일 타입별 아이콘
const getFileIcon = (fileType: string) => {
  if (fileType.includes('pdf')) return '📄';
  if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊';
  if (fileType.includes('image')) return '🖼️';
  if (fileType.includes('word') || fileType.includes('hwp')) return '📝';
  return '📄';
};

// 파일 크기 포맷팅
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // 동적 카테고리 관리
  const [documentCategories, setDocumentCategories] = useState<string[]>([
    '01_계획안',
    '02_공문발송', 
    '03_설문조사',
    '04_물품관리(업체)',
    '05_수행기관배포',
    '06_신청기관',
    '07_결과보고'
  ]);

  const { toast } = useToast();

  // 업로드 폼 상태
  const [uploadForm, setUploadForm] = useState({
    name: '',
    category: '' as DocumentCategory,
    description: '',
    file: null as File | null,
  });

  // 편집 상태 관리
  const [editingDoc, setEditingDoc] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');
  const [isAddingFolder, setIsAddingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const docs = await storage.getDocuments();
      setDocuments(docs);
      setFilteredDocuments(docs);
      
      // 저장된 카테고리 구조 불러오기
      const savedCategories = localStorage.getItem('documentCategories');
      if (savedCategories) {
        setDocumentCategories(JSON.parse(savedCategories));
      }
      
      const savedExpanded = localStorage.getItem('expandedCategories');
      if (savedExpanded) {
        setExpandedCategories(new Set(JSON.parse(savedExpanded)));
      } else {
        setExpandedCategories(new Set(documentCategories));
      }
    } catch (error) {
      console.error('Failed to load documents:', error);

      if (error instanceof Error && error.message.includes('object stores was not found')) {
        try {
          await storage.resetDatabase();
          await storage.init();
          const docs = await storage.getDocuments();
          setDocuments(docs);
          setFilteredDocuments(docs);
          toast({
            title: "데이터베이스 재설정 완료",
            description: "데이터베이스가 재설정되었습니다.",
          });
          return;
        } catch (resetError) {
          console.error('Failed to reset database:', resetError);
        }
      }

      toast({
        title: "문서 로드 실패",
        description: "문서를 불러오는데 실패했습니다. 페이지를 새로고침해주세요.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  // 카테고리 구조 저장
  useEffect(() => {
    localStorage.setItem('documentCategories', JSON.stringify(documentCategories));
  }, [documentCategories]);

  useEffect(() => {
    localStorage.setItem('expandedCategories', JSON.stringify(Array.from(expandedCategories)));
  }, [expandedCategories]);

  // 검색 및 필터링
  useEffect(() => {
    let filtered = documents;

    if (searchTerm) {
      filtered = filtered.filter(doc => 
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doc.description && doc.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(doc => doc.category === selectedCategory);
    }

    setFilteredDocuments(filtered);
  }, [documents, searchTerm, selectedCategory]);

  // 파일 업로드 처리
  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!uploadForm.file || !uploadForm.name || !uploadForm.category) {
      toast({
        title: "입력 오류",
        description: "모든 필수 항목을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    try {
      const fileData = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(uploadForm.file!);
      });

      const newDocument: Document = {
        id: crypto.randomUUID(),
        name: uploadForm.name,
        category: uploadForm.category,
        fileType: uploadForm.file.type,
        fileSize: uploadForm.file.size,
        uploadDate: new Date().toISOString(),
        uploader: '관리자',
        description: uploadForm.description,
        fileData: fileData,
      };

      await storage.saveDocument(newDocument);
      await loadDocuments();

      setUploadForm({
        name: '',
        category: '' as DocumentCategory,
        description: '',
        file: null,
      });

      setIsUploadOpen(false);

      toast({
        title: "업로드 완료",
        description: `${newDocument.name} 파일이 업로드되었습니다.`,
      });
    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        title: "업로드 실패",
        description: "파일 업로드에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  // 파일 다운로드
  const handleDownload = (doc: Document) => {
    if (!doc.fileData) {
      toast({
        title: "다운로드 실패",
        description: "파일 데이터를 찾을 수 없습니다.",
        variant: "destructive",
      });
      return;
    }

    const link = document.createElement('a');
    link.href = doc.fileData;
    link.download = doc.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 파일 삭제
  const handleDelete = async (documentId: string) => {
    if (!confirm('정말로 이 문서를 삭제하시겠습니까?')) return;

    try {
      await storage.deleteDocument(documentId);
      await loadDocuments();

      toast({
        title: "삭제 완료",
        description: "문서가 삭제되었습니다.",
      });
    } catch (error) {
      console.error('Delete failed:', error);
      toast({
        title: "삭제 실패",
        description: "문서 삭제에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  // 카테고리 토글
  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  // 카테고리별 문서 그룹화
  const groupedDocuments = documentCategories.reduce((acc, category) => {
    acc[category] = filteredDocuments.filter(doc => doc.category === category);
    return acc;
  }, {} as Record<string, Document[]>);

  // 문서 이름 변경
  const handleEditStart = (doc: Document) => {
    setEditingDoc(doc.id);
    setEditingName(doc.name);
  };

  const handleEditCancel = () => {
    setEditingDoc(null);
    setEditingName('');
  };

  const handleEditSave = async (documentId: string) => {
    try {
      if (!editingName) {
        toast({
          title: "입력 오류",
          description: "문서명을 입력해주세요.",
          variant: "destructive",
        });
        return;
      }

      const updatedDocuments = documents.map(doc => {
        if (doc.id === documentId) {
          return { ...doc, name: editingName };
        }
        return doc;
      });

      setDocuments(updatedDocuments);
      setFilteredDocuments(updatedDocuments.filter(doc => {
        if (selectedCategory === 'all') {
          return true;
        }
        return doc.category === selectedCategory;
      }));

      await storage.updateDocumentName(documentId, editingName);
      await loadDocuments();

      toast({
        title: "수정 완료",
        description: "문서 이름이 수정되었습니다.",
      });

      setEditingDoc(null);
      setEditingName('');
    } catch (error) {
      console.error('Edit failed:', error);
      toast({
        title: "수정 실패",
        description: "문서 이름 수정에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  // 문서 카테고리 이동
  const handleMoveDocument = async (documentId: string, newCategory: DocumentCategory) => {
    try {
      const updatedDocuments = documents.map(doc => {
        if (doc.id === documentId) {
          return { ...doc, category: newCategory };
        }
        return doc;
      });

      setDocuments(updatedDocuments);
      setFilteredDocuments(updatedDocuments.filter(doc => {
        if (selectedCategory === 'all') {
          return true;
        }
        return doc.category === selectedCategory;
      }));

      await storage.updateDocumentCategory(documentId, newCategory);
      await loadDocuments();

      toast({
        title: "이동 완료",
        description: "문서 카테고리가 이동되었습니다.",
      });
    } catch (error) {
      console.error('Move failed:', error);
      toast({
        title: "이동 실패",
        description: "문서 카테고리 이동에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  // 카테고리 이름 수정
  const handleCategoryEditStart = (category: string) => {
    setEditingCategory(category);
    setEditingCategoryName(category);
  };

  const handleCategoryEditCancel = () => {
    setEditingCategory(null);
    setEditingCategoryName('');
  };

  const handleCategoryEditSave = async () => {
    if (!editingCategory || !editingCategoryName) return;

    try {
      // 카테고리 이름 중복 확인
      if (documentCategories.includes(editingCategoryName) && editingCategoryName !== editingCategory) {
        toast({
          title: "입력 오류",
          description: "이미 존재하는 카테고리 이름입니다.",
          variant: "destructive",
        });
        return;
      }

      // 카테고리 목록 업데이트
      const updatedCategories = documentCategories.map(cat => 
        cat === editingCategory ? editingCategoryName : cat
      );
      setDocumentCategories(updatedCategories);

      // 해당 카테고리의 모든 문서 업데이트
      const updatedDocuments = documents.map(doc => {
        if (doc.category === editingCategory) {
          return { ...doc, category: editingCategoryName as DocumentCategory };
        }
        return doc;
      });

      // 데이터베이스에 업데이트
      for (const doc of updatedDocuments.filter(d => d.category === editingCategoryName)) {
        await storage.updateDocumentCategory(doc.id, editingCategoryName as DocumentCategory);
      }

      setDocuments(updatedDocuments);
      await loadDocuments();

      toast({
        title: "수정 완료",
        description: "카테고리 이름이 수정되었습니다.",
      });

      setEditingCategory(null);
      setEditingCategoryName('');
    } catch (error) {
      console.error('Category edit failed:', error);
      toast({
        title: "수정 실패",
        description: "카테고리 이름 수정에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  // 새 폴더 추가
  const handleAddFolder = () => {
    if (!newFolderName.trim()) {
      toast({
        title: "입력 오류",
        description: "폴더 이름을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (documentCategories.includes(newFolderName)) {
      toast({
        title: "입력 오류",
        description: "이미 존재하는 폴더 이름입니다.",
        variant: "destructive",
      });
      return;
    }

    const updatedCategories = [...documentCategories, newFolderName];
    setDocumentCategories(updatedCategories);
    setNewFolderName('');
    setIsAddingFolder(false);

    toast({
      title: "폴더 생성 완료",
      description: `${newFolderName} 폴더가 생성되었습니다.`,
    });
  };

  // 카테고리 삭제
  const handleDeleteCategory = async (category: string) => {
    const categoryDocs = groupedDocuments[category] || [];
    
    if (categoryDocs.length > 0) {
      if (!confirm(`${category} 폴더에 ${categoryDocs.length}개의 문서가 있습니다. 정말로 삭제하시겠습니까? (문서도 함께 삭제됩니다)`)) {
        return;
      }

      // 해당 카테고리의 모든 문서 삭제
      for (const doc of categoryDocs) {
        await storage.deleteDocument(doc.id);
      }
    } else {
      if (!confirm(`${category} 폴더를 삭제하시겠습니까?`)) {
        return;
      }
    }

    const updatedCategories = documentCategories.filter(cat => cat !== category);
    setDocumentCategories(updatedCategories);
    await loadDocuments();

    toast({
      title: "삭제 완료",
      description: "폴더가 삭제되었습니다.",
    });
  };

  // 카테고리 순서 변경
  const moveCategoryUp = (category: string) => {
    const currentIndex = documentCategories.indexOf(category);
    if (currentIndex > 0) {
      const newCategories = [...documentCategories];
      [newCategories[currentIndex], newCategories[currentIndex - 1]] = 
      [newCategories[currentIndex - 1], newCategories[currentIndex]];
      setDocumentCategories(newCategories);
    }
  };

  const moveCategoryDown = (category: string) => {
    const currentIndex = documentCategories.indexOf(category);
    if (currentIndex < documentCategories.length - 1) {
      const newCategories = [...documentCategories];
      [newCategories[currentIndex], newCategories[currentIndex + 1]] = 
      [newCategories[currentIndex + 1], newCategories[currentIndex]];
      setDocumentCategories(newCategories);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-muted-foreground">문서를 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">문서 관리</h1>
          <p className="text-muted-foreground mt-2">
            2025년 노인맞춤돌봄서비스 현장모니터링 문서 체계 관리
          </p>
        </div>

        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => setIsAddingFolder(true)}
            className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
          >
            <FolderPlus className="h-4 w-4 mr-2" />
            새 폴더
          </Button>

          <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Upload className="h-4 w-4 mr-2" />
                문서 업로드
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>새 문서 업로드</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleFileUpload} className="space-y-4">
                <div>
                  <Label htmlFor="file">파일 선택</Label>
                  <Input
                    id="file"
                    type="file"
                    onChange={(e) => setUploadForm({...uploadForm, file: e.target.files?.[0] || null})}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="name">문서명</Label>
                  <Input
                    id="name"
                    value={uploadForm.name}
                    onChange={(e) => setUploadForm({...uploadForm, name: e.target.value})}
                    placeholder="문서명을 입력하세요"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="category">카테고리</Label>
                  <Select 
                    value={uploadForm.category} 
                    onValueChange={(value) => setUploadForm({...uploadForm, category: value as DocumentCategory})}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="카테고리를 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {documentCategories.map((category) => {
                        const config = categoryConfig[category as keyof typeof categoryConfig];
                        const IconComponent = config?.icon || FolderOpen;
                        return (
                          <SelectItem key={category} value={category}>
                            <div className="flex items-center">
                              <IconComponent className="h-4 w-4 mr-2" />
                              {category}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="description">설명 (선택사항)</Label>
                  <Textarea
                    id="description"
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
                    placeholder="문서에 대한 설명을 입력하세요"
                    className="mt-1"
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsUploadOpen(false)}>
                    취소
                  </Button>
                  <Button type="submit">업로드</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* 새 폴더 추가 대화상자 */}
      <Dialog open={isAddingFolder} onOpenChange={setIsAddingFolder}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>새 폴더 만들기</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="folder-name">폴더 이름</Label>
              <Input
                id="folder-name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="새 폴더 이름을 입력하세요"
                className="mt-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddFolder();
                  if (e.key === 'Escape') setIsAddingFolder(false);
                }}
                autoFocus
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsAddingFolder(false)}>
                취소
              </Button>
              <Button onClick={handleAddFolder}>만들기</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 검색 및 필터 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="문서명 또는 설명으로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="w-full md:w-64">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="카테고리 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 카테고리</SelectItem>
                  {documentCategories.map((category) => {
                    const config = categoryConfig[category as keyof typeof categoryConfig];
                    const IconComponent = config?.icon || FolderOpen;
                    const count = groupedDocuments[category]?.length || 0;
                    return (
                      <SelectItem key={category} value={category}>
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center">
                            <IconComponent className="h-4 w-4 mr-2" />
                            {category}
                          </div>
                          <Badge variant="secondary" className="ml-2">
                            {count}
                          </Badge>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                총 {filteredDocuments.length}개의 문서가 있습니다.
                {searchTerm && ` "${searchTerm}" 검색 결과`}
                {selectedCategory !== 'all' && ` (${selectedCategory} 카테고리)`}
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      {/* 완전 관리 가능한 문서 트리 구조 */}
      <Card className="bg-gradient-to-br from-slate-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FolderOpen className="h-5 w-5 mr-2 text-blue-600" />
            📋 문서 트리 구조 (완전 관리)
            <Badge variant="secondary" className="ml-auto">
              {filteredDocuments.length}개 문서
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-white rounded-lg border p-4 font-mono text-sm">
            <div className="space-y-1">
              {/* 루트 폴더 */}
              <div className="flex items-center text-amber-600 font-semibold">
                <span className="mr-2">📂</span>
                프로젝트 폴더/
              </div>

              {documentCategories.map((category, categoryIndex) => {
                const config = categoryConfig[category as keyof typeof categoryConfig];
                const IconComponent = config?.icon || FolderOpen;
                const categoryDocs = groupedDocuments[category] || [];
                const isExpanded = expandedCategories.has(category);
                const isLastCategory = categoryIndex === documentCategories.length - 1;
                const isEditingThisCategory = editingCategory === category;

                return (
                  <div key={category} className="ml-2">
                    {/* 카테고리 폴더 - 완전 관리 가능 */}
                    <div className="flex items-center group hover:bg-blue-50 rounded px-2 py-1 transition-colors">
                      <span className="text-gray-400 mr-1 flex-shrink-0">
                        {isLastCategory ? '└─' : '├─'}
                      </span>
                      <span 
                        className="mr-2 cursor-pointer"
                        onClick={() => toggleCategory(category)}
                      >
                        {isExpanded ? '📂' : '📁'}
                      </span>
                      <IconComponent className="h-4 w-4 mr-2 text-blue-600 flex-shrink-0" />
                      
                      {isEditingThisCategory ? (
                        <div className="flex items-center flex-1 space-x-2">
                          <Input
                            value={editingCategoryName}
                            onChange={(e) => setEditingCategoryName(e.target.value)}
                            className="h-6 text-sm"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleCategoryEditSave();
                              if (e.key === 'Escape') handleCategoryEditCancel();
                            }}
                            autoFocus
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleCategoryEditSave}
                            className="h-6 w-6 p-0 hover:bg-green-100 text-green-600"
                            title="저장"
                          >
                            <Save className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleCategoryEditCancel}
                            className="h-6 w-6 p-0 hover:bg-gray-100"
                            title="취소"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <span 
                            className="text-blue-800 font-medium group-hover:text-blue-900 cursor-pointer flex-1"
                            onClick={() => toggleCategory(category)}
                          >
                            {category}/
                          </span>
                          <Badge variant="outline" className="ml-2 text-xs">
                            {categoryDocs.length}
                          </Badge>
                          
                          {/* 카테고리 관리 버튼들 */}
                          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                            {/* 위로 이동 */}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => moveCategoryUp(category)}
                              disabled={categoryIndex === 0}
                              className="h-6 w-6 p-0 hover:bg-blue-100"
                              title="위로 이동"
                            >
                              <ArrowUp className="h-3 w-3" />
                            </Button>
                            
                            {/* 아래로 이동 */}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => moveCategoryDown(category)}
                              disabled={categoryIndex === documentCategories.length - 1}
                              className="h-6 w-6 p-0 hover:bg-blue-100"
                              title="아래로 이동"
                            >
                              <ArrowDown className="h-3 w-3" />
                            </Button>
                            
                            {/* 이름 수정 */}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleCategoryEditStart(category)}
                              className="h-6 w-6 p-0 hover:bg-yellow-100 text-yellow-600"
                              title="이름 수정"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            
                            {/* 폴더 삭제 */}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteCategory(category)}
                              className="h-6 w-6 p-0 hover:bg-red-100 text-red-600"
                              title="폴더 삭제"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>

                    {/* 카테고리 내 문서들 */}
                    {isExpanded && (
                      <div className={`ml-6 space-y-1 ${!isLastCategory ? 'border-l border-gray-200 pl-4' : 'pl-4'}`}>
                        {categoryDocs.length === 0 ? (
                          <div className="flex items-center text-gray-400 py-1">
                            <span className="mr-1">└─</span>
                            <span className="text-xs italic">(비어있음)</span>
                          </div>
                        ) : (
                          categoryDocs.map((doc, docIndex) => {
                            const isLastDoc = docIndex === categoryDocs.length - 1;
                            const isEditing = editingDoc === doc.id;

                            return (
                              <div 
                                key={doc.id} 
                                className="flex items-center justify-between group hover:bg-gray-50 rounded px-2 py-1 transition-colors"
                              >
                                <div className="flex items-center flex-1 min-w-0">
                                  <span className="text-gray-400 mr-1 flex-shrink-0">
                                    {isLastDoc ? '└─' : '├─'}
                                  </span>
                                  <span className="mr-2 flex-shrink-0">
                                    {getFileIcon(doc.fileType)}
                                  </span>

                                  {isEditing ? (
                                    <div className="flex items-center flex-1 space-x-2">
                                      <Input
                                        value={editingName}
                                        onChange={(e) => setEditingName(e.target.value)}
                                        className="h-6 text-sm"
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') handleEditSave(doc.id);
                                          if (e.key === 'Escape') handleEditCancel();
                                        }}
                                        autoFocus
                                      />
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleEditSave(doc.id)}
                                        className="h-6 w-6 p-0 hover:bg-green-100 text-green-600"
                                        title="저장"
                                      >
                                        <Save className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={handleEditCancel}
                                        className="h-6 w-6 p-0 hover:bg-gray-100"
                                        title="취소"
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  ) : (
                                    <>
                                      <span className="text-gray-700 truncate font-medium group-hover:text-gray-900">
                                        {doc.name}
                                      </span>
                                      <CheckCircle2 className="h-3 w-3 ml-2 text-green-500 flex-shrink-0" />
                                    </>
                                  )}
                                </div>

                                {!isEditing && (
                                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                                    <span className="text-xs text-gray-500 mr-2">
                                      {formatFileSize(doc.fileSize)}
                                    </span>

                                    {/* 카테고리 이동 */}
                                    <Select onValueChange={(value) => handleMoveDocument(doc.id, value as DocumentCategory)}>
                                      <SelectTrigger className="h-6 w-6 p-0 border-none bg-transparent hover:bg-purple-100 rounded">
                                        <MoveUp className="h-3 w-3" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {documentCategories
                                          .filter(cat => cat !== doc.category)
                                          .map((category) => {
                                            const config = categoryConfig[category as keyof typeof categoryConfig];
                                            const IconComponent = config?.icon || FolderOpen;
                                            return (
                                              <SelectItem key={category} value={category}>
                                                <div className="flex items-center">
                                                  <IconComponent className="h-4 w-4 mr-2" />
                                                  {category}
                                                </div>
                                              </SelectItem>
                                            );
                                          })}
                                      </SelectContent>
                                    </Select>

                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleEditStart(doc)}
                                      className="h-6 w-6 p-0 hover:bg-yellow-100 text-yellow-600"
                                      title="이름 수정"
                                    >
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleDownload(doc)}
                                      className="h-6 w-6 p-0 hover:bg-blue-100"
                                      title="다운로드"
                                    >
                                      <Download className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleDelete(doc.id)}
                                      className="h-6 w-6 p-0 hover:bg-red-100 text-red-600"
                                      title="삭제"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* 트리 하단 정보 */}
            <div className="mt-4 pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center">
                    📁 {documentCategories.length}개 카테고리
                  </span>
                  <span className="flex items-center">
                    📄 {filteredDocuments.length}개 문서
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  <span className="text-gray-400">완전 관리 모드 - 모든 항목 수정 가능</span>
                </div>
              </div>
            </div>
          </div>

          {/* 빠른 액션 버튼들 */}
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setExpandedCategories(new Set(documentCategories))}
              className="text-xs"
            >
              <ChevronDown className="h-3 w-3 mr-1" />
              모두 펼치기
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setExpandedCategories(new Set())}
              className="text-xs"
            >
              <ChevronRight className="h-3 w-3 mr-1" />
              모두 접기
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const nonEmptyCategories = documentCategories.filter(cat => 
                  (groupedDocuments[cat] || []).length > 0
                );
                setExpandedCategories(new Set(nonEmptyCategories));
              }}
              className="text-xs"
            >
              <Eye className="h-3 w-3 mr-1" />
              문서 있는 것만
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsAddingFolder(true)}
              className="text-xs bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
            >
              <Plus className="h-3 w-3 mr-1" />
              새 폴더 추가
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
