import LocalStorageManager from "@/components/storage/local-storage-manager";

export default function StoragePage() {
  console.log('Storage page rendered');
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">로컬 저장소 관리</h1>
        <p className="text-muted-foreground mt-2">
          데이터 백업, 내보내기 및 로컬 컴퓨터 저장 관리
        </p>
      </div>
      <LocalStorageManager />
    </div>
  );
}