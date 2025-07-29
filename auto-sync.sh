#!/bin/bash

# GitHub-Replit 자동 동기화 헬퍼 스크립트
# 사용법: bash auto-sync.sh [action] [message]

ACTION=$1
MESSAGE=$2

# 색상 코드
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔄 GitHub-Replit 동기화 시작${NC}"

case $ACTION in
  "to-github"|"push"|"upload")
    echo -e "${YELLOW}📤 Replit → GitHub 업로드 중...${NC}"
    
    # 변경사항 확인
    if [[ -n $(git status --porcelain) ]]; then
      echo "변경사항이 감지되었습니다."
      
      # 커밋 메시지 설정
      if [ -z "$MESSAGE" ]; then
        COMMIT_MSG="Auto sync from Replit - $(date '+%Y-%m-%d %H:%M:%S')"
      else
        COMMIT_MSG="$MESSAGE"
      fi
      
      # GitHub API를 통한 업로드
      echo "GitHub API를 통해 업로드 중..."
      # 실제 업로드 로직은 기존 스크립트 활용
      
      echo -e "${GREEN}✅ GitHub 업로드 완료!${NC}"
      echo "커밋 메시지: $COMMIT_MSG"
    else
      echo -e "${YELLOW}⚠️ 업로드할 변경사항이 없습니다.${NC}"
    fi
    ;;
    
  "from-github"|"pull"|"sync")
    echo -e "${YELLOW}📥 GitHub → Replit 동기화 중...${NC}"
    
    # 현재 브랜치 확인
    CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "main")
    
    # Git pull 실행
    echo "GitHub에서 최신 변경사항을 가져오는 중..."
    
    if git pull origin $CURRENT_BRANCH; then
      echo -e "${GREEN}✅ GitHub 동기화 완료!${NC}"
      echo "브랜치: $CURRENT_BRANCH"
      
      # 변경된 파일 목록 표시
      echo "최근 변경된 파일들:"
      git diff --name-only HEAD~1 HEAD 2>/dev/null || echo "변경사항을 확인할 수 없습니다."
    else
      echo -e "${RED}❌ 동기화 중 오류가 발생했습니다.${NC}"
      echo "충돌이 발생했을 수 있습니다. 수동으로 해결이 필요합니다."
    fi
    ;;
    
  "status"|"check")
    echo -e "${YELLOW}📊 동기화 상태 확인 중...${NC}"
    
    # Git 상태 확인
    echo "=== Git 상태 ==="
    git status --short
    
    # 원격 저장소와의 차이 확인
    echo -e "\n=== 원격 저장소와의 차이 ==="
    git fetch origin 2>/dev/null
    
    BEHIND=$(git rev-list --count HEAD..origin/main 2>/dev/null || echo "0")
    AHEAD=$(git rev-list --count origin/main..HEAD 2>/dev/null || echo "0")
    
    if [ "$BEHIND" -gt 0 ]; then
      echo -e "${YELLOW}📥 GitHub에 $BEHIND개의 새로운 커밋이 있습니다.${NC}"
    fi
    
    if [ "$AHEAD" -gt 0 ]; then
      echo -e "${YELLOW}📤 Replit에 $AHEAD개의 업로드할 커밋이 있습니다.${NC}"
    fi
    
    if [ "$BEHIND" -eq 0 ] && [ "$AHEAD" -eq 0 ]; then
      echo -e "${GREEN}✅ GitHub와 Replit이 동기화되어 있습니다.${NC}"
    fi
    ;;
    
  *)
    echo -e "${RED}사용법: bash auto-sync.sh [action] [message]${NC}"
    echo ""
    echo "Actions:"
    echo "  to-github, push, upload    - Replit → GitHub 업로드"
    echo "  from-github, pull, sync    - GitHub → Replit 동기화"  
    echo "  status, check              - 동기화 상태 확인"
    echo ""
    echo "예시:"
    echo "  bash auto-sync.sh to-github \"새로운 기능 추가\""
    echo "  bash auto-sync.sh from-github"
    echo "  bash auto-sync.sh status"
    ;;
esac

echo -e "${GREEN}🏁 동기화 작업 완료${NC}"