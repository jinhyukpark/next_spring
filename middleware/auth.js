const SessionManager = require('../utils/session');

// 인증 미들웨어
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: '액세스 토큰이 필요합니다'
      });
    }

    const session = await SessionManager.validateSession(token);
    if (!session) {
      return res.status(401).json({
        success: false,
        message: '유효하지 않은 토큰입니다'
      });
    }

    // 사용자가 비활성화된 경우
    if (!session.is_active) {
      return res.status(401).json({
        success: false,
        message: '비활성화된 사용자입니다'
      });
    }

    // 요청 객체에 사용자 정보 추가
    req.user = {
      id: session.user_id,
      username: session.username,
      email: session.email
    };

    next();
  } catch (error) {
    console.error('인증 미들웨어 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다'
    });
  }
};

// 선택적 인증 미들웨어 (토큰이 있으면 검증, 없어도 통과)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const session = await SessionManager.validateSession(token);
      if (session && session.is_active) {
        req.user = {
          id: session.user_id,
          username: session.username,
          email: session.email
        };
      }
    }

    next();
  } catch (error) {
    console.error('선택적 인증 미들웨어 오류:', error);
    next(); // 오류가 발생해도 계속 진행
  }
};

module.exports = {
  authenticateToken,
  optionalAuth
};

