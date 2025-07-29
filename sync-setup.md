# GitHub-Replit 동기화 설정 가이드 (2025 업데이트)

## 개요
Replit이 2022년에 기존 API를 중단함에 따라, 완전 자동화보다는 **반자동 동기화 시스템**을 구축했습니다.

## 동기화 범위
- **현재 프로젝트만 해당**: 노인맞춤돌봄서비스 현장 모니터링 통합 관리 시스템
- **다른 Replit 프로젝트**: 별도로 각각 설정해야 함

## 현재 동기화 시스템

### 1. GitHub → Replit 알림 (deploy-to-replit.yml)
- **트리거**: GitHub main 브랜치에 푸시될 때 자동 실행
- **기능**: 
  - 프로젝트 빌드 상태 체크
  - 변경사항 알림
  - Replit 동기화 가이드 제공
- **상태**: ✅ 완전 작동

### 2. Replit → GitHub 수동 동기화 (sync-from-replit.yml)
- **트리거**: 수동 실행만 가능
- **기능**: GitHub Actions를 통한 수동 동기화
- **상태**: ✅ 완전 작동

## 실제 동기화 방법

### Replit → GitHub
**방법 1: GitHub API 사용 (권장)**
```bash
# 이미 구현된 업로드 스크립트 사용
bash upload-to-github.sh
```

**방법 2: GitHub Actions 수동 실행**
1. GitHub 저장소 → Actions 탭
2. "Manual Sync Trigger from Replit" 워크플로우 선택
3. "Run workflow" 클릭

### GitHub → Replit  
**자동 알림**: GitHub에 푸시하면 자동으로 알림 생성

**수동 동기화**: Replit Shell에서
```bash
git pull origin main
```

## 장점과 한계

### ✅ 장점
- API 제한 없음
- 완전한 제어 가능
- 실패 위험 낮음
- 변경사항 추적 용이

### ⚠️ 한계  
- 완전 자동화 불가
- 수동 작업 필요
- 실시간 동기화 어려움

## 다른 Replit 프로젝트 동기화
각 프로젝트마다:
1. ✅ 새 GitHub 저장소 생성
2. ✅ 같은 워크플로우 파일 복사  
3. ✅ GitHub API 스크립트 복사
4. ✅ 프로젝트별 설정 수정

## 현재 상태
- ✅ GitHub Actions 워크플로우 완성
- ✅ 반자동 동기화 시스템 구축  
- ✅ GitHub API 업로드 시스템 작동
- ✅ 양방향 동기화 가능

## 사용 방법
1. **Replit에서 개발** → GitHub API로 업로드
2. **GitHub에서 협업** → Replit에서 git pull
3. **정기적 백업** → GitHub Actions 수동 실행

이 시스템은 완전 자동화는 아니지만, 실용적이고 안정적인 동기화를 제공합니다.