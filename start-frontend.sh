#!/bin/bash

echo "🚀 Next.js 프론트엔드 서버를 시작합니다..."

cd frontend

# Node.js가 설치되어 있는지 확인
if ! command -v node &> /dev/null; then
    echo "❌ Node.js가 설치되어 있지 않습니다. Node.js를 설치해주세요."
    exit 1
fi

# npm이 설치되어 있는지 확인
if ! command -v npm &> /dev/null; then
    echo "❌ npm이 설치되어 있지 않습니다. npm을 설치해주세요."
    exit 1
fi

echo "📦 의존성을 설치합니다..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ 의존성 설치 성공!"
    echo "🌐 프론트엔드 서버를 시작합니다..."
    echo "📍 서버 주소: http://localhost:3000"
    echo ""
    echo "서버를 중지하려면 Ctrl+C를 누르세요."
    echo ""
    
    npm run dev
else
    echo "❌ 의존성 설치 실패!"
    exit 1
fi
