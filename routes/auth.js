const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const SessionManager = require('../utils/session');
const LoginLogger = require('../utils/loginLogger');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// 회원가입 유효성 검사 규칙
const registerValidation = [
  body('username')
    .isLength({ min: 2, max: 20 })
    .withMessage('이름은 2-20자 사이여야 합니다')
    .matches(/^[가-힣a-zA-Z0-9_\s]+$/)
    .withMessage('이름은 한글, 영문, 숫자, 공백만 사용 가능합니다'),
  
  body('email')
    .isEmail()
    .withMessage('올바른 이메일 형식이 아닙니다')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('비밀번호는 최소 6자 이상이어야 합니다')
];

// 회원가입 API
router.post('/register', registerValidation, async (req, res) => {
  try {
    // 유효성 검사 결과 확인
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '입력 데이터가 올바르지 않습니다',
        errors: errors.array()
      });
    }

    const { username, email, password } = req.body;

    // 이메일 중복 확인
    const existingUserByEmail = await User.findByEmail(email);
    if (existingUserByEmail) {
      return res.status(409).json({
        success: false,
        message: '이미 사용 중인 이메일입니다'
      });
    }

    // 사용자명 중복 확인
    const existingUserByUsername = await User.findByUsername(username);
    if (existingUserByUsername) {
      return res.status(409).json({
        success: false,
        message: '이미 사용 중인 사용자명입니다'
      });
    }

    // 사용자 생성
    const newUser = await User.create({ username, email, password });

    res.status(201).json({
      success: true,
      message: '회원가입이 성공적으로 완료되었습니다!',
      data: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email
      }
    });

  } catch (error) {
    console.error('회원가입 오류:', error);
    
    // MySQL 에러 처리
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: '이미 사용 중인 정보입니다'
      });
    }

    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 로그인 API
router.post('/login', [
  body('email').isEmail().withMessage('올바른 이메일 형식이 아닙니다'),
  body('password').notEmpty().withMessage('비밀번호를 입력해주세요')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '입력 데이터가 올바르지 않습니다',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;

    // 최근 로그인 시도 횟수 확인 (보안)
    const recentAttempts = await LoginLogger.getRecentLoginAttempts(ipAddress, 15);
    if (recentAttempts >= 5) {
      await LoginLogger.logFailure(email, email, 'Too many failed attempts', req);
      return res.status(429).json({
        success: false,
        message: '너무 많은 로그인 시도가 있었습니다. 15분 후 다시 시도해주세요.'
      });
    }

    // 사용자 찾기
    const user = await User.findByEmail(email);
    if (!user) {
      await LoginLogger.logFailure(email, email, 'User not found', req);
      return res.status(401).json({
        success: false,
        message: '이메일 또는 비밀번호가 올바르지 않습니다'
      });
    }

    // 사용자 활성화 상태 확인
    if (!user.is_active) {
      await LoginLogger.logFailure(user.name, user.email, 'Account deactivated', req);
      return res.status(401).json({
        success: false,
        message: '비활성화된 계정입니다'
      });
    }

    // 비밀번호 검증
    const isValidPassword = await User.validatePassword(password, user.password);
    if (!isValidPassword) {
      await LoginLogger.logFailure(user.name, user.email, 'Invalid password', req);
      return res.status(401).json({
        success: false,
        message: '이메일 또는 비밀번호가 올바르지 않습니다'
      });
    }

    // 로그인 성공 로그
    await LoginLogger.logSuccess(user.id, user.name, user.email, req);

    res.json({
      success: true,
      message: '로그인 성공!',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('로그인 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다'
    });
  }
});

// 로그아웃 API
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      await SessionManager.deleteSession(token);
      await LoginLogger.logLogout(req.user.id, req.user.username, req.user.email, req);
    }

    res.json({
      success: true,
      message: '로그아웃 성공!'
    });

  } catch (error) {
    console.error('로그아웃 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다'
    });
  }
});

// 세션 검증 API
router.get('/verify', authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      message: '유효한 세션입니다',
      data: {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email
      }
    });
  } catch (error) {
    console.error('세션 검증 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다'
    });
  }
});

// 로그인 기록 조회 API
router.get('/login-history', authenticateToken, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const history = await LoginLogger.getUserLoginHistory(req.user.id, limit);

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('로그인 기록 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다'
    });
  }
});

// 사용자 정보 조회 API
router.get('/profile/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다'
      });
    }

    res.json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('사용자 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다'
    });
  }
});

// 모든 사용자 조회 API (관리자용)
router.get('/users', async (req, res) => {
  try {
    const users = await User.findAll();
    
    res.json({
      success: true,
      data: users,
      count: users.length
    });

  } catch (error) {
    console.error('사용자 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다'
    });
  }
});

module.exports = router;


