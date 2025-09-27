# Next.js + Spring Boot 통합 관리 시스템

이 프로젝트는 Express.js + Node.js로 구축된 기존 프로젝트를 Next.js 프론트엔드와 Spring Boot 백엔드로 분리한 통합 관리 시스템입니다.

## 🏗️ 프로젝트 구조

```
test01_next_spring/
├── frontend/          # Next.js 프론트엔드
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx      # 메인 페이지
│   │   │   └── login/
│   │   │       └── page.tsx  # 로그인 페이지
│   │   └── ...
│   └── package.json
├── backend/           # Spring Boot 백엔드
│   ├── src/main/java/com/example/auth/
│   │   ├── entity/           # JPA 엔티티
│   │   ├── repository/        # 데이터 접근 계층
│   │   ├── service/          # 비즈니스 로직
│   │   ├── controller/       # REST API 컨트롤러
│   │   ├── dto/             # 데이터 전송 객체
│   │   └── config/          # 설정 클래스
│   └── pom.xml
└── README.md
```

## 🚀 기술 스택

### Frontend (Next.js)
- **Next.js 15** - React 프레임워크
- **TypeScript** - 타입 안전성
- **Tailwind CSS** - 스타일링
- **React Hooks** - 상태 관리

### Backend (Spring Boot)
- **Spring Boot 3.2** - Java 백엔드 프레임워크
- **Spring Security** - 인증 및 보안
- **Spring Data JPA** - 데이터 접근 계층
- **MySQL/MariaDB** - 데이터베이스
- **BCrypt** - 비밀번호 암호화

## 📋 주요 기능

### 사용자 관리
- ✅ 회원가입
- ✅ 로그인/로그아웃
- ✅ 사용자 정보 조회
- ✅ 사용자 목록 조회

### 시스템 관리
- ✅ 프로젝트 관리 대시보드
- ✅ 팀원 정보 관리
- ✅ 시스템 현황 통계

## 🛠️ 설치 및 실행

### 1. 데이터베이스 설정
```sql
-- MariaDB/MySQL에서 데이터베이스 생성
CREATE DATABASE busan CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. 백엔드 실행 (Spring Boot)
```bash
cd backend
./mvnw spring-boot:run
# 또는
mvn spring-boot:run
```

백엔드 서버는 `http://localhost:8080`에서 실행됩니다.

### 3. 프론트엔드 실행 (Next.js)
```bash
cd frontend
npm install
npm run dev
```

프론트엔드 서버는 `http://localhost:3000`에서 실행됩니다.

## 🔗 API 엔드포인트

### 인증 관련
- `POST /api/auth/register` - 회원가입
- `POST /api/auth/login` - 로그인
- `GET /api/auth/verify` - 세션 검증
- `GET /api/auth/users` - 사용자 목록 조회
- `GET /api/auth/profile/{id}` - 사용자 정보 조회
- `GET /api/auth/info` - API 정보 조회

## 🎨 UI/UX 특징

- **반응형 디자인** - 모바일, 태블릿, 데스크톱 지원
- **모던한 UI** - Tailwind CSS를 활용한 깔끔한 디자인
- **직관적인 네비게이션** - 탭 기반 페이지 전환
- **실시간 피드백** - 로딩 상태 및 에러 메시지 표시

## 🔒 보안 기능

- **비밀번호 암호화** - BCrypt를 사용한 안전한 비밀번호 저장
- **CORS 설정** - 프론트엔드와 백엔드 간 안전한 통신
- **입력 검증** - 서버 사이드 유효성 검사
- **SQL 인젝션 방지** - JPA를 통한 안전한 데이터베이스 접근

## 📊 데이터베이스 스키마

### users 테이블
```sql
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'USER',
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## 🚀 배포 가이드

### 개발 환경
1. 데이터베이스 서버 실행
2. 백엔드 서버 실행 (`http://localhost:8080`)
3. 프론트엔드 서버 실행 (`http://localhost:3000`)

### 프로덕션 환경
- **백엔드**: Spring Boot JAR 파일로 배포
- **프론트엔드**: Next.js 빌드 후 정적 파일로 배포
- **데이터베이스**: MySQL/MariaDB 서버

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해 주세요.

---

**개발자**: Jin  
**프로젝트**: Next.js + Spring Boot 통합 관리 시스템  
**버전**: 1.0.0