

const authService = require('../services/auth.service');

// ─── REGISTER ───

const register = async (req, res) => {
  try {
 
    const { name, email, password } = req.body;


    if (!name || !email || !password) {
      return res.status(400).json({
        error: 'Ad, email ve şifre zorunludur'
      });
    }


    if (password.length < 6) {
      return res.status(400).json({
        error: 'Şifre en az 6 karakter olmalıdır'
      });
    }

    const result = await authService.register({ name, email, password });

  
    return res.status(201).json({
      message: 'Kayıt başarılı',
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });

  } catch (error) {
  
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        error: error.message
      });
    }

  
    console.error('Register hatası:', error);
    return res.status(500).json({
      error: 'Sunucu hatası'
    });
  }
};

// ─── LOGIN ───────────────────────────────────────────────────────────────────

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email ve şifre zorunludur'
      });
    }

    const result = await authService.login({ email, password });


    return res.status(200).json({
      message: 'Giriş başarılı',
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });

  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        error: error.message
      });
    }

    console.error('Login hatası:', error);
    return res.status(500).json({
      error: 'Sunucu hatası'
    });
  }
};


const me = async (req, res) => {
  try {
   
    return res.status(200).json({
      user: req.user
    });
  } catch (error) {
    console.error('Me hatası:', error);
    return res.status(500).json({
      error: 'Sunucu hatası'
    });
  }
};

const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token zorunludur' });
    }

    const result = await authService.refreshToken(refreshToken);
    return res.status(200).json(result);

  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Sunucu hatası' });
  }
};

module.exports = { register, login, me, refresh };
