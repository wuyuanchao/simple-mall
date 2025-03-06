const express = require('express');
const router = express.Router();
const { User } = require('../../models');
const { ensureAdmin } = require('../../middleware/auth');

// 用户列表
router.get('/', ensureAdmin, async (req, res) => {
  try {
    const users = await User.findAll({
      order: [['createdAt', 'DESC']]
    });

    res.render('admin/users', {
      title: '用户管理',
      users,
      path: '/admin/users',
      layout: false
    });
  } catch (error) {
    console.error('获取用户列表失败:', error);
    req.flash('error_msg', '获取用户列表失败');
    res.redirect('/admin');
  }
});

// 更改用户角色
router.post('/:id/role', ensureAdmin, async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  
  try {
    const user = await User.findByPk(id);
    if (!user) {
      req.flash('error_msg', '用户不存在');
      return res.redirect('/admin/users');
    }

    await user.update({ role });
    req.flash('success_msg', '用户角色更新成功');
    res.redirect('/admin/users');
  } catch (error) {
    console.error('更新用户角色失败:', error);
    req.flash('error_msg', '更新用户角色失败');
    res.redirect('/admin/users');
  }
});

// 删除用户
router.post('/:id/delete', ensureAdmin, async (req, res) => {
  const { id } = req.params;
  
  try {
    const user = await User.findByPk(id);
    if (!user) {
      req.flash('error_msg', '用户不存在');
      return res.redirect('/admin/users');
    }

    // 不允许删除管理员
    if (user.role === 'admin') {
      req.flash('error_msg', '不能删除管理员账户');
      return res.redirect('/admin/users');
    }

    await user.destroy();
    req.flash('success_msg', '用户删除成功');
    res.redirect('/admin/users');
  } catch (error) {
    console.error('删除用户失败:', error);
    req.flash('error_msg', '删除用户失败');
    res.redirect('/admin/users');
  }
});

module.exports = router;