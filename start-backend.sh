#!/bin/bash

echo "🚀 Spring Boot 백엔드 서버를 시작합니다..."

cd backend

# Maven wrapper가 실행 가능한지 확인
if [ ! -f "./mvnw" ]; then
    echo "❌ Maven wrapper를 찾을 수 없습니다. Maven이 설치되어 있는지 확인해주세요."
    exit 1
fi

# Maven wrapper 실행 권한 부여
chmod +x ./mvnw

echo "📦 의존성을 다운로드하고 컴파일합니다..."
./mvnw clean compile

if [ $? -eq 0 ]; then
    echo "✅ 컴파일 성공!"
    echo "🌐 백엔드 서버를 시작합니다..."
    echo "📍 서버 주소: http://localhost:8080"
    echo "📚 API 문서: http://localhost:8080/api/auth/info"
    echo ""
    echo "서버를 중지하려면 Ctrl+C를 누르세요."
    echo ""
    
    ./mvnw spring-boot:run
else
    echo "❌ 컴파일 실패!"
    exit 1
fi
