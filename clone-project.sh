#!/bin/bash

# 프로젝트 복제 스크립트
# 사용법: ./clone-project.sh <새_프로젝트_이름> <새_프로젝트_경로>

if [ -z "$1" ] || [ -z "$2" ]; then
    echo "사용법: ./clone-project.sh <새_프로젝트_이름> <새_프로젝트_경로>"
    echo "예시: ./clone-project.sh new_recruit_project ~/Documents/new_project"
    exit 1
fi

NEW_PROJECT_NAME=$1
NEW_PROJECT_PATH=$2
CURRENT_DIR=$(pwd)

echo "프로젝트 복제 중..."
echo "원본: $CURRENT_DIR"
echo "대상: $NEW_PROJECT_PATH/$NEW_PROJECT_NAME"

# 새 디렉토리 생성
mkdir -p "$NEW_PROJECT_PATH"
cd "$NEW_PROJECT_PATH"

# 프로젝트 복제 (node_modules, .next, .git, .env 제외)
rsync -av \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='.git' \
  --exclude='.env*' \
  --exclude='*.log' \
  --exclude='.DS_Store' \
  "$CURRENT_DIR/" "$NEW_PROJECT_NAME/"

cd "$NEW_PROJECT_NAME"

# package.json의 name 변경
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  sed -i '' "s/\"name\": \"korhrd_recruit_eduvisors\"/\"name\": \"$NEW_PROJECT_NAME\"/" package.json
else
  # Linux
  sed -i "s/\"name\": \"korhrd_recruit_eduvisors\"/\"name\": \"$NEW_PROJECT_NAME\"/" package.json
fi

# Git 초기화
git init
git add .
git commit -m "Initial commit: 복제된 프로젝트"

echo ""
echo "✅ 복제 완료!"
echo ""
echo "📋 다음 단계:"
echo "1. cd $NEW_PROJECT_PATH/$NEW_PROJECT_NAME"
echo "2. npm install"
echo "3. .env 파일 생성 및 Supabase 설정 변경"
echo "4. 데이터베이스 스키마 수정 (lib/types/database.ts, supabase migrations)"
echo "5. 텍스트 내용 수정 (회사명, 푸터 정보 등)"
echo "6. 이미지 파일 교체 (public/logo2.png, 채용공고 이미지)"
echo ""
echo "자세한 가이드는 CLONE_GUIDE.md 파일을 참고하세요."

