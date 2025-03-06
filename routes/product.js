const express = require('express');
const router = express.Router();
const { Product } = require('../models');
const { Op, Sequelize } = require('sequelize');
const sequelize = require('../config/database');

// 商品列表页
router.get('/', async (req, res) => {
  try {
    const { category, search, sort } = req.query;
    let where = { status: 'active' };
    let order = [['createdAt', 'DESC']];

    if (category) {
      where.category = category;
    }

    if (search) {
      where.name = { [Op.like]: `%${search}%` };
    }

    if (sort) {
      switch (sort) {
        case 'price-asc':
          order = [['price', 'ASC']];
          break;
        case 'price-desc':
          order = [['price', 'DESC']];
          break;
      }
    }

    const products = await Product.findAll({ where, order });
    const categories = await Product.findAll({
      attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('category')), 'category']]
    });

    res.render('products/index', {
      title: '商品列表',
      products,
      categories: categories.map(c => c.category),
      currentCategory: category,
      search,
      sort
    });
  } catch (error) {
    console.error('获取商品列表失败:', error);
    req.flash('error_msg', '获取商品列表失败');
    res.redirect('/');
  }
});

// 商品详情页
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      req.flash('error_msg', '商品不存在');
      return res.redirect('/products');
    }

    // 获取相关商品推荐
    const relatedProducts = await Product.findAll({
      where: {
        category: product.category,
        id: { [Op.ne]: product.id }
      },
      limit: 4
    });

    res.render('products/detail', {
      title: product.name,
      product,
      relatedProducts
    });
  } catch (error) {
    console.error('获取商品详情失败:', error);
    req.flash('error_msg', '获取商品详情失败');
    res.redirect('/products');
  }
});

module.exports = router;