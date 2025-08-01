# 자연어 동기화 요청 가이드

## 개요
이 문서는 자연어로 GitHub-Replit 동기화를 요청하는 방법을 설명합니다.

## Replit → GitHub 동기화 요청

### 요청 방법
채팅에서 다음과 같이 요청하세요:

**예시:**
- "GitHub에 커밋해줘"
- "변경사항을 GitHub에 업로드해줘"
- "새로운 기능을 GitHub에 푸시해줘"
- "bug fix를 GitHub에 커밋해줘"

### 자동 처리 과정
1. 현재 변경사항 감지
2. GitHub API를 통한 자동 업로드
3. 적절한 커밋 메시지 생성
4. 업로드 완료 알림

## GitHub → Replit 동기화 요청

### 요청 방법
채팅에서 다음과 같이 요청하세요:

**예시:**
- "GitHub에서 최신 변경사항 가져와줘"
- "GitHub 동기화해줘"
- "다른 개발자가 올린 코드 가져와줘"
- "GitHub의 최신 버전으로 업데이트해줘"

### 자동 처리 과정
1. GitHub의 최신 변경사항 확인
2. `git pull origin main` 실행
3. 동기화 결과 알림
4. 충돌 발생 시 해결 가이드 제공

## 고급 요청

### 특정 커밋 메시지로 업로드
- "새로운 대시보드 기능 추가"라는 메시지로 GitHub에 커밋해줘"
- "버그 수정 완료"로 GitHub에 업로드해줘"

### 브랜치 지정
- "develop 브랜치에서 최신 코드 가져와줘"
- "feature/new-ui 브랜치로 푸시해줘"

## 장점
- 복잡한 명령어 기억할 필요 없음
- 자연스러운 대화로 동기화 가능
- 자동으로 적절한 처리 수행
- 오류 발생 시 자동 안내

이제 언제든지 자연어로 동기화를 요청하세요!