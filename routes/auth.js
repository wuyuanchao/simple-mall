const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');
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
    // 检查是否有保存的重定向URL
    const redirectUrl = req.session.redirectUrl || '/';
    delete req.session.redirectUrl;
    res.redirect(redirectUrl);
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

// 显示注册页面
router.get('/register', (req, res) => {
  res.render('auth/register', {  // 修改为正确的视图路径
    title: '用户注册'
  });
});

// 处理注册请求
router.post('/register', [
  // 验证规则
  check('username')
    .notEmpty().withMessage('用户名不能为空')
    .isLength({ min: 2 }).withMessage('用户名至少2个字符'),
  check('email')
    .notEmpty().withMessage('邮箱不能为空')
    .isEmail().withMessage('请输入有效的邮箱地址'),
  check('password')
    .notEmpty().withMessage('密码不能为空')
    .isLength({ min: 6 }).withMessage('密码至少6个字符'),
  check('password2').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('两次输入的密码不一致');
    }
    return true;
  })
], async (req, res) => {
  // 验证结果
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('auth/register', {  // 修改路径
      title: '用户注册',
      errors: errors.array()
    });
  }

  const { username, email, password } = req.body;

  try {
    // 检查用户是否已存在
    const existingUser = await User.findOne({
      where: {
        email: email
      }
    });

    if (existingUser) {
      return res.render('auth/register', {  // 修改路径
        title: '用户注册',
        errors: [{ msg: '该邮箱已被注册' }]
      });
    }

    // 创建新用户
    await User.create({
      username,
      email,
      password: password,
      role: 'user'  // 默认角色
    });

    req.flash('success_msg', '注册成功，请登录');
    res.redirect('/auth/login');  // 修改重定向路径
  } catch (error) {
    console.error('注册失败:', error);
    res.render('auth/register', {  // 修改路径
      title: '用户注册',
      errors: [{ msg: '注册失败，请稍后重试' }]
    });
  }
});

module.exports = router;