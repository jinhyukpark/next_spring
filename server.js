const express = require('express');
const cors = require('cors');
const path = require('path');
const { 
  testConnection, 
  createDatabase, 
  createUserTable, 
  createSessionTable, 
  createLoginLogTable, 
  createPasswordResetTable 
} = require('./config/database');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 요청 로깅 미들웨어
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// 기본 라우트 - index.html 서빙
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 정적 파일 서빙 (라우트 이후에 설정)
app.use(express.static('public'));

// API 정보 엔드포인트
app.get('/api/info', (req, res) => {
  res.json({
    success: true,
    message: '🚀 Express + MariaDB 회원가입 서비스가 실행 중입니다!',
    endpoints: {
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      profile: 'GET /api/auth/profile/:id',
      users: 'GET /api/auth/users'
    },
    timestamp: new Date().toISOString()
  });
});

// API 라우트
app.use('/api/auth', authRoutes);

// 404 에러 처리
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '요청한 API 엔드포인트를 찾을 수 없습니다'
  });
});

// 에러 처리 미들웨어
app.use((error, req, res, next) => {
  console.error('서버 오류:', error);
  res.status(500).json({
    success: false,
    message: '서버 내부 오류가 발생했습니다',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// 서버 시작 함수
async function startServer() {
  try {
    console.log('🚀 서버를 시작하는 중...');
    
    // 데이터베이스 생성
    console.log('📊 데이터베이스 설정 중...');
    await createDatabase();
    
    // 테이블 생성
    console.log('📋 테이블 생성 중...');
    await createUserTable();
    await createSessionTable();
    await createLoginLogTable();
    await createPasswordResetTable();
    
    // 데이터베이스 연결 테스트
    console.log('🔗 데이터베이스 연결 테스트 중...');
    await testConnection();
    
    // 서버 시작
    app.listen(PORT, () => {
      console.log('='.repeat(60));
      console.log('🎉 서버가 성공적으로 시작되었습니다!');
      console.log(`📍 서버 주소: http://localhost:${PORT}`);
      console.log('='.repeat(60));
      console.log('📚 사용 가능한 API:');
      console.log(`   POST   http://localhost:${PORT}/api/auth/register  - 회원가입`);
      console.log(`   POST   http://localhost:${PORT}/api/auth/login     - 로그인`);
      console.log(`   GET    http://localhost:${PORT}/api/auth/profile/:id - 사용자 정보`);
      console.log(`   GET    http://localhost:${PORT}/api/auth/users      - 사용자 목록`);
      console.log('='.repeat(60));
    });
    
  } catch (error) {
    console.error('❌ 서버 시작 실패:', error.message);
    process.exit(1);
  }
}

// 서버 시작
startServer();

module.exports = app;
