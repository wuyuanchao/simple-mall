const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { Product } = require('../../models');
const { ensureAdmin } = require('../../middleware/auth');

// 配置文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/products')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 限制5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('只允许上传图片文件'));
    }
  }
});

// 商品列表页面
router.get('/', ensureAdmin, async (req, res) => {
  try {
    const products = await Product.findAll({
      order: [['createdAt', 'DESC']]
    });
    
    res.render('admin/products', {
      title: '商品管理',
      products,
      path: '/admin/products',
      layout: false
    });
  } catch (error) {
    req.flash('error_msg', '获取商品列表失败');
    res.redirect('/admin');
  }
});

// 添加商品
router.post('/', ensureAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, categoryId, price, stock, description } = req.body;
    const image = `/uploads/products/${req.file.filename}`;
    
    await Product.create({
      name,
      categoryId,
      price,
      stock,
      description,
      image,
      status: 'active'
    });

    req.flash('success_msg', '商品添加成功');
    res.redirect('/admin/products');
  } catch (error) {
    req.flash('error_msg', '商品添加失败');
    res.redirect('/admin/products');
  }
});

// 更新商品
router.post('/:id', ensureAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, categoryId, price, stock, description } = req.body;
    const product = await Product.findByPk(req.params.id);
    
    if (!product) {
      req.flash('error_msg', '商品不存在');
      return res.redirect('/admin/products');
    }

    const updateData = {
      name,
      categoryId,
      price,
      stock,
      description
    };

    if (req.file) {
      updateData.image = `/uploads/products/${req.file.filename}`;
    }

    await product.update(updateData);
    
    req.flash('success_msg', '商品更新成功');
    res.redirect('/admin/products');
  } catch (error) {
    req.flash('error_msg', '商品更新失败');
    res.redirect('/admin/products');
  }
});

// 切换商品状态
router.post('/:id/toggle', ensureAdmin, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    
    if (!product) {
      req.flash('error_msg', '商品不存在');
      return res.redirect('/admin/products');
    }

    await product.update({
      status: product.status === 'active' ? 'inactive' : 'active'
    });

    req.flash('success_msg', '商品状态已更新');
    res.redirect('/admin/products');
  } catch (error) {
    req.flash('error_msg', '操作失败');
    res.redirect('/admin/products');
  }
});

// 删除商品
router.post('/:id/delete', ensureAdmin, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    
    if (!product) {
      req.flash('error_msg', '商品不存在');
      return res.redirect('/admin/products');
    }

    await product.destroy();
    
    req.flash('success_msg', '商品已删除');
    res.redirect('/admin/products');
  } catch (error) {
    req.flash('error_msg', '删除失败');
    res.redirect('/admin/products');
  }
});

// 导入商品
router.post('/import', ensureAdmin, upload.single('file'), async (req, res) => {
  try {
    const xlsx = require('xlsx');
    const workbook = xlsx.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const products = xlsx.utils.sheet_to_json(sheet);

    let count = 0;
    for (const item of products) {
      await Product.create({
        name: item.name,
        categoryId: item.categoryId,
        price: item.price,
        stock: item.stock,
        description: item.description,
        status: 'active'
      });
      count++;
    }

    res.json({ success: true, count });
  } catch (error) {
    res.status(400).json({ error: '导入失败' });
  }
});

module.exports = router;