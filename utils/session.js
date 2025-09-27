const crypto = require('crypto');
const { pool } = require('../config/database');

class SessionManager {
  // 세션 토큰 생성
  static generateToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  // 세션 생성
  static async createSession(userId, req) {
    try {
      const sessionToken = this.generateToken();
      const refreshToken = this.generateToken();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24시간 후 만료
      
      const connection = await pool.getConnection();
      
      const query = `
        INSERT INTO user_sessions (user_id, session_token, refresh_token, expires_at, ip_address, user_agent)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      const [result] = await connection.execute(query, [
        userId,
        sessionToken,
        refreshToken,
        expiresAt,
        req.ip || req.connection.remoteAddress,
        req.get('User-Agent')
      ]);
      
      connection.release();
      
      return {
        sessionToken,
        refreshToken,
        expiresAt
      };
    } catch (error) {
      console.error('세션 생성 오류:', error);
      throw error;
    }
  }

  // 세션 검증
  static async validateSession(sessionToken) {
    try {
      const connection = await pool.getConnection();
      
      const query = `
        SELECT us.*, u.username, u.email, u.is_active
        FROM user_sessions us
        JOIN users u ON us.user_id = u.id
        WHERE us.session_token = ? AND us.is_active = TRUE AND us.expires_at > NOW()
      `;
      
      const [rows] = await connection.execute(query, [sessionToken]);
      connection.release();
      
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('세션 검증 오류:', error);
      return null;
    }
  }

  // 세션 삭제 (로그아웃)
  static async deleteSession(sessionToken) {
    try {
      const connection = await pool.getConnection();
      
      const query = `
        UPDATE user_sessions 
        SET is_active = FALSE 
        WHERE session_token = ?
      `;
      
      await connection.execute(query, [sessionToken]);
      connection.release();
      
      return true;
    } catch (error) {
      console.error('세션 삭제 오류:', error);
      return false;
    }
  }

  // 사용자의 모든 세션 삭제
  static async deleteAllUserSessions(userId) {
    try {
      const connection = await pool.getConnection();
      
      const query = `
        UPDATE user_sessions 
        SET is_active = FALSE 
        WHERE user_id = ?
      `;
      
      await connection.execute(query, [userId]);
      connection.release();
      
      return true;
    } catch (error) {
      console.error('사용자 세션 삭제 오류:', error);
      return false;
    }
  }

  // 만료된 세션 정리
  static async cleanupExpiredSessions() {
    try {
      const connection = await pool.getConnection();
      
      const query = `
        UPDATE user_sessions 
        SET is_active = FALSE 
        WHERE expires_at < NOW()
      `;
      
      const [result] = await connection.execute(query);
      connection.release();
      
      return result.affectedRows;
    } catch (error) {
      console.error('만료된 세션 정리 오류:', error);
      return 0;
    }
  }
}

module.exports = SessionManager;

