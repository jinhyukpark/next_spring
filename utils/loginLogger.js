const { pool } = require('../config/database');

class LoginLogger {
  // 로그인 성공 로그
  static async logSuccess(userId, name, email, req) {
    try {
      const connection = await pool.getConnection();
      
      const query = `
        INSERT INTO login_logs (user_id, username, email, login_type, ip_address, user_agent)
        VALUES (?, ?, ?, 'success', ?, ?)
      `;
      
      await connection.execute(query, [
        userId,
        name,
        email,
        req.ip || req.connection.remoteAddress,
        req.get('User-Agent')
      ]);
      
      connection.release();
    } catch (error) {
      console.error('로그인 성공 로그 기록 오류:', error);
    }
  }

  // 로그인 실패 로그
  static async logFailure(name, email, failureReason, req) {
    try {
      const connection = await pool.getConnection();
      
      const query = `
        INSERT INTO login_logs (username, email, login_type, failure_reason, ip_address, user_agent)
        VALUES (?, ?, 'failed', ?, ?, ?)
      `;
      
      await connection.execute(query, [
        name,
        email,
        failureReason,
        req.ip || req.connection.remoteAddress,
        req.get('User-Agent')
      ]);
      
      connection.release();
    } catch (error) {
      console.error('로그인 실패 로그 기록 오류:', error);
    }
  }

  // 로그아웃 로그
  static async logLogout(userId, name, email, req) {
    try {
      const connection = await pool.getConnection();
      
      const query = `
        INSERT INTO login_logs (user_id, username, email, login_type, ip_address, user_agent)
        VALUES (?, ?, ?, 'logout', ?, ?)
      `;
      
      await connection.execute(query, [
        userId,
        name,
        email,
        req.ip || req.connection.remoteAddress,
        req.get('User-Agent')
      ]);
      
      connection.release();
    } catch (error) {
      console.error('로그아웃 로그 기록 오류:', error);
    }
  }

  // 사용자 로그인 기록 조회
  static async getUserLoginHistory(userId, limit = 10) {
    try {
      const connection = await pool.getConnection();
      
      const query = `
        SELECT login_type, failure_reason, ip_address, user_agent, login_at
        FROM login_logs
        WHERE user_id = ?
        ORDER BY login_at DESC
        LIMIT ?
      `;
      
      const [rows] = await connection.execute(query, [userId, limit]);
      connection.release();
      
      return rows;
    } catch (error) {
      console.error('사용자 로그인 기록 조회 오류:', error);
      return [];
    }
  }

  // 최근 로그인 시도 조회 (보안용)
  static async getRecentLoginAttempts(ipAddress, minutes = 15) {
    try {
      const connection = await pool.getConnection();
      
      const query = `
        SELECT COUNT(*) as attempt_count
        FROM login_logs
        WHERE ip_address = ? 
        AND login_type = 'failed' 
        AND login_at > DATE_SUB(NOW(), INTERVAL ? MINUTE)
      `;
      
      const [rows] = await connection.execute(query, [ipAddress, minutes]);
      connection.release();
      
      return rows[0].attempt_count;
    } catch (error) {
      console.error('최근 로그인 시도 조회 오류:', error);
      return 0;
    }
  }
}

module.exports = LoginLogger;
