const { Product, Setting } = require('../models');

const getHomePage = async (req, res) => {
  try {
    const [products, settings] = await Promise.all([
      Product.findAll({
        where: { status: 'active' },
        limit: 8,
        order: [['createdAt', 'DESC']]
      }),
      Setting.findOne()
    ]);

    // 如果没有设置数据，使用默认值
    const defaultSettings = {
      contactPhone: '400-123-4567',
      contactEmail: 'support@example.com',
      serviceHours: '周一至周日 9:00-21:00',
      companyAddress: '上海市浦东新区xxx路xxx号'
    };

    res.render('home', {
      title: '首页',
      products,
      settings: settings || defaultSettings
    });
  } catch (error) {
    console.error('获取首页数据失败:', error);
    res.render('home', {
      title: '首页',
      products: [],
      settings: defaultSettings
    });
  }
};

module.exports = {
  getHomePage
};