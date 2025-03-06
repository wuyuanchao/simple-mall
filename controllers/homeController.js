const { Product } = require('../models');

const getHomePage = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { status: 'active' },
      limit: 8,
      order: [['createdAt', 'DESC']]
    });

    res.render('home', {
      title: '首页',
      products
    });
  } catch (error) {
    console.error('获取首页数据失败:', error);
    res.render('home', {
      title: '首页',
      products: []
    });
  }
};

module.exports = {
  getHomePage
};