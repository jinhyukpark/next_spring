const bcrypt = require('bcrypt');
const { pool } = require('../config/database');

class User {
  constructor(userData) {
    this.name = userData.name || userData.username;
    this.email = userData.email;
    this.password = userData.password;
  }

  // 사용자 생성
  static async create(userData) {
    try {
      const { username, email, password, phone } = userData;
      
      // 비밀번호 해싱
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      const connection = await pool.getConnection();
      
      const query = `
        INSERT INTO users (name, email, password, phone, created_at) 
        VALUES (?, ?, ?, ?, NOW())
      `;
      
      const [result] = await connection.execute(query, [username, email, hashedPassword, phone || '']);
      
      connection.release();
      
      return {
        id: result.insertId,
        name: username,
        email,
        message: '회원가입이 성공적으로 완료되었습니다!'
      };
    } catch (error) {
      throw error;
    }
  }

  // 이메일로 사용자 찾기
  static async findByEmail(email) {
    try {
      const connection = await pool.getConnection();
      
      const query = 'SELECT id, email, password, name, phone, role, is_active, created_at FROM users WHERE email = ?';
      const [rows] = await connection.execute(query, [email]);
      
      connection.release();
      
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // 사용자명으로 사용자 찾기 (name 필드 사용)
  static async findByUsername(name) {
    try {
      const connection = await pool.getConnection();
      
      const query = 'SELECT id, email, password, name, phone, role, is_active, created_at FROM users WHERE name = ?';
      const [rows] = await connection.execute(query, [name]);
      
      connection.release();
      
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // 사용자 ID로 찾기
  static async findById(id) {
    try {
      const connection = await pool.getConnection();
      
      const query = 'SELECT id, email, name, phone, role, is_active, created_at FROM users WHERE id = ?';
      const [rows] = await connection.execute(query, [id]);
      
      connection.release();
      
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // 비밀번호 검증
  static async validatePassword(plainPassword, hashedPassword) {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      throw error;
    }
  }

  // 모든 사용자 조회 (관리자용)
  static async findAll() {
    try {
      const connection = await pool.getConnection();
      
      const query = 'SELECT id, email, name, phone, role, is_active, created_at FROM users ORDER BY created_at DESC';
      const [rows] = await connection.execute(query);
      
      connection.release();
      
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // 마지막 로그인 시간 업데이트
  static async updateLastLogin(userId) {
    try {
      const connection = await pool.getConnection();
      
      const query = 'UPDATE users SET last_login = NOW() WHERE id = ?';
      await connection.execute(query, [userId]);
      
      connection.release();
      
      return true;
    } catch (error) {
      throw error;
    }
  }

  // 사용자 정보 업데이트
  static async updateUser(userId, updateData) {
    try {
      const connection = await pool.getConnection();
      
      const allowedFields = ['first_name', 'last_name', 'phone'];
      const updateFields = [];
      const values = [];
      
      for (const [key, value] of Object.entries(updateData)) {
        if (allowedFields.includes(key) && value !== undefined) {
          updateFields.push(`${key} = ?`);
          values.push(value);
        }
      }
      
      if (updateFields.length === 0) {
        connection.release();
        return false;
      }
      
      values.push(userId);
      const query = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
      
      await connection.execute(query, values);
      connection.release();
      
      return true;
    } catch (error) {
      throw error;
    }
  }

  // 사용자 비밀번호 변경
  static async changePassword(userId, newPassword) {
    try {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
      
      const connection = await pool.getConnection();
      
      const query = 'UPDATE users SET password = ? WHERE id = ?';
      await connection.execute(query, [hashedPassword, userId]);
      
      connection.release();
      
      return true;
    } catch (error) {
      throw error;
    }
  }

  // 사용자 계정 비활성화/활성화
  static async toggleUserStatus(userId, isActive) {
    try {
      const connection = await pool.getConnection();
      
      const query = 'UPDATE users SET is_active = ? WHERE id = ?';
      await connection.execute(query, [isActive, userId]);
      
      connection.release();
      
      return true;
    } catch (error) {
      throw error;
    }
  }

  // 사용자 삭제
  static async deleteUser(userId) {
    try {
      const connection = await pool.getConnection();
      
      const query = 'DELETE FROM users WHERE id = ?';
      const [result] = await connection.execute(query, [userId]);
      
      connection.release();
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User;


