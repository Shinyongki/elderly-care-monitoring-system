# 자동 동기화 설정 가이드

## 개요
이 문서는 Replit과 GitHub 간의 자동 동기화 설정에 대해 설명합니다.

## 동기화 범위
- **현재 프로젝트만 해당**: 노인맞춤돌봄서비스 현장 모니터링 통합 관리 시스템
- **다른 Replit 프로젝트**: 별도로 각각 설정해야 함

## 설정된 GitHub Actions 워크플로우

### 1. Replit → GitHub 동기화 (sync-from-replit.yml)
- **트리거**: 5분마다 자동 체크 + 수동 실행 가능
- **기능**: Replit에서 변경사항 감지 시 GitHub로 자동 동기화
- **상태**: 기본 구조 설정 완료 (Replit API 연동 필요)

### 2. GitHub → Replit 동기화 (deploy-to-replit.yml)
- **트리거**: GitHub main 브랜치에 푸시될 때
- **기능**: GitHub 변경사항을 Replit으로 자동 배포
- **상태**: 기본 구조 설정 완료 (Replit API 연동 필요)

## 필요한 추가 설정

### GitHub Secrets 설정 필요:
1. GitHub 저장소 → Settings → Secrets and variables → Actions
2. 다음 시크릿 추가:
   - `REPLIT_TOKEN`: Replit API 토큰
   - 기타 필요한 인증 정보

### Replit API 토큰 생성:
1. Replit 계정 설정에서 API 토큰 생성
2. GitHub Secrets에 추가

## 현재 상태
- ✅ GitHub Actions 워크플로우 파일 생성
- ✅ 기본 동기화 구조 설정
- ⏳ Replit API 연동 (추가 설정 필요)
- ⏳ 실제 동기화 테스트

## 다른 Replit 프로젝트 동기화
각 프로젝트마다:
1. 별도의 GitHub 저장소 생성
2. 동일한 워크플로우 파일 복사
3. 프로젝트별 설정 수정
4. 개별 API 토큰 및 시크릿 설정

## 수동 동기화 방법
자동 동기화가 설정되기 전까지는:
1. Replit에서 변경 후 → GitHub Actions에서 수동 실행
2. 또는 이전처럼 API를 통한 수동 업로드

## 참고사항
- Replit의 Git 제한으로 인해 GitHub Actions 기반 동기화 권장
- 각 프로젝트는 독립적으로 관리됨
- 동기화 주기는 필요에 따라 조정 가능 (현재 5분)