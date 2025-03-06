const express = require('express');
const router = express.Router();
const { Setting } = require('../../models');
const { ensureAdmin } = require('../../middleware/auth');
const multer = require('multer');
const path = require('path');

// 配置文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, 'logo-' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// 系统设置页面
router.get('/', ensureAdmin, async (req, res) => {
  try {
    const settings = await Setting.findOne() || {};
    res.render('admin/settings', {
      title: '系统设置',
      settings,
      path: '/admin/settings',
      layout: false
    });
  } catch (error) {
    console.error('获取系统设置失败:', error);
    req.flash('error_msg', '获取系统设置失败');
    res.redirect('/admin');
  }
});

// 更新基本设置
router.post('/', ensureAdmin, async (req, res) => {
  try {
    const settings = await Setting.findOne();
    if (settings) {
      await settings.update(req.body);
    } else {
      await Setting.create(req.body);
    }
    req.flash('success_msg', '设置已更新');
    res.redirect('/admin/settings');
  } catch (error) {
    console.error('更新系统设置失败:', error);
    req.flash('error_msg', '更新系统设置失败');
    res.redirect('/admin/settings');
  }
});

// 更新 Logo
router.post('/logo', ensureAdmin, upload.single('logo'), async (req, res) => {
  try {
    if (!req.file) {
      throw new Error('请选择要上传的图片');
    }

    const settings = await Setting.findOne();
    const logoPath = '/uploads/' + req.file.filename;

    if (settings) {
      await settings.update({ logo: logoPath });
    } else {
      await Setting.create({ logo: logoPath });
    }

    req.flash('success_msg', 'Logo 已更新');
    res.redirect('/admin/settings');
  } catch (error) {
    console.error('上传 Logo 失败:', error);
    req.flash('error_msg', error.message);
    res.redirect('/admin/settings');
  }
});

module.exports = router;