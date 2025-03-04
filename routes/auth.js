const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { User } = require('../models');

// 登录页面
router.get('/login', (req, res) => {
  res.render('auth/login', {
    title: '用户登录'
  });
});

// 登录处理
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    // 查找用户
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      req.flash('error_msg', '用户不存在');
      return res.redirect('/auth/login');
    }

    // 验证密码
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        console.log("密码错误");
        req.flash('error_msg', '密码错误');
        return res.redirect('/auth/login');
    }

    // 登录成功，保存用户信息到 session
    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role  // 添加 role 字段
    };
    console.log("登录成功");
    req.flash('success_msg', '登录成功');
    res.redirect('/');
  } catch (error) {
    console.error('登录失败:', error);
    req.flash('error_msg', '登录失败');
    res.redirect('/auth/login');
  }
});

// 退出登录
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;