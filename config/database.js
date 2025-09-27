const mysql = require('mysql2/promise');

// MariaDB 연결 설정
const dbConfig = {
  host: 'localhost',
  user: 'jin',
  password: 'park2213',
  database: 'busan',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// 연결 풀 생성
const pool = mysql.createPool(dbConfig);

// 데이터베이스 연결 테스트
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MariaDB 연결 성공!');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ MariaDB 연결 실패:', error.message);
    return false;
  }
}

// 데이터베이스 생성 함수
async function createDatabase() {
  try {
    // 데이터베이스 생성용 연결 (데이터베이스명 없이)
    const tempConfig = {
      host: 'localhost',
      user: 'jin',
      password: 'park2213',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    };
    
    const tempPool = mysql.createPool(tempConfig);
    const connection = await tempPool.getConnection();
    
    // busan 데이터베이스 생성
    await connection.execute('CREATE DATABASE IF NOT EXISTS busan CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    console.log('✅ busan 데이터베이스 생성 완료!');
    
    connection.release();
    await tempPool.end();
    return true;
  } catch (error) {
    console.error('❌ 데이터베이스 생성 실패:', error.message);
    return false;
  }
}

// 사용자 테이블 생성 함수
async function createUserTable() {
  try {
    const connection = await pool.getConnection();
    
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(50),
        last_name VARCHAR(50),
        phone VARCHAR(20),
        is_active BOOLEAN DEFAULT TRUE,
        email_verified BOOLEAN DEFAULT FALSE,
        last_login TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;
    
    await connection.execute(createTableQuery);
    console.log('✅ users 테이블 생성 완료!');
    
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ users 테이블 생성 실패:', error.message);
    return false;
  }
}

// 세션 테이블 생성 함수
async function createSessionTable() {
  try {
    const connection = await pool.getConnection();
    
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS user_sessions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        session_token VARCHAR(255) UNIQUE NOT NULL,
        refresh_token VARCHAR(255) UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        ip_address VARCHAR(45),
        user_agent TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_session_token (session_token),
        INDEX idx_user_id (user_id),
        INDEX idx_expires_at (expires_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;
    
    await connection.execute(createTableQuery);
    console.log('✅ user_sessions 테이블 생성 완료!');
    
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ user_sessions 테이블 생성 실패:', error.message);
    return false;
  }
}

// 로그인 로그 테이블 생성 함수
async function createLoginLogTable() {
  try {
    const connection = await pool.getConnection();
    
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS login_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        username VARCHAR(50),
        email VARCHAR(100),
        login_type ENUM('success', 'failed', 'logout') NOT NULL,
        ip_address VARCHAR(45),
        user_agent TEXT,
        failure_reason VARCHAR(255),
        login_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_user_id (user_id),
        INDEX idx_login_type (login_type),
        INDEX idx_login_at (login_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;
    
    await connection.execute(createTableQuery);
    console.log('✅ login_logs 테이블 생성 완료!');
    
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ login_logs 테이블 생성 실패:', error.message);
    return false;
  }
}

// 비밀번호 재설정 토큰 테이블 생성 함수
async function createPasswordResetTable() {
  try {
    const connection = await pool.getConnection();
    
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        token VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_token (token),
        INDEX idx_user_id (user_id),
        INDEX idx_expires_at (expires_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;
    
    await connection.execute(createTableQuery);
    console.log('✅ password_reset_tokens 테이블 생성 완료!');
    
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ password_reset_tokens 테이블 생성 실패:', error.message);
    return false;
  }
}

module.exports = {
  pool,
  testConnection,
  createDatabase,
  createUserTable,
  createSessionTable,
  createLoginLogTable,
  createPasswordResetTable
};
