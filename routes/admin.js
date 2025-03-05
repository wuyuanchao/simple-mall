const express = require('express');
const router = express.Router();
const multer = require('multer');
const XLSX = require('xlsx');
const { Order, OrderItem, Product, User } = require('../models');
const sequelize = require('../config/database');
const { ensureAuthenticated, ensureAdmin } = require('../middleware/auth');

// 订单管理页面
router.get('/orders', ensureAdmin, async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        {
          model: OrderItem,
          include: [Product]
        },
        {
          model: User,
          attributes: ['username', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.render('admin/orders', {
      title: '订单管理',
      orders,
      path: '/admin/orders',
      layout: false  // 添加这行，禁用默认布局
    });
  } catch (error) {
    console.error('获取订单列表失败:', error);
    req.flash('error_msg', '获取订单列表失败');
    res.redirect('/admin');
  }
});

// 更新订单状态
router.post('/orders/:id/status', ensureAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  try {
    await Order.update({ status }, { where: { id } });
    req.flash('success_msg', '订单状态更新成功');
    res.redirect('/admin/orders');
  } catch (error) {
    console.error('更新订单状态失败:', error);
    req.flash('error_msg', '更新订单状态失败');
    res.redirect('/admin/orders');
  }
});

// 配置文件上传
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.mimetype === 'application/vnd.ms-excel') {
      cb(null, true);
    } else {
      cb(new Error('只支持 Excel 文件格式'));
    }
  }
});

// 订单导入路由
router.post('/orders/import', ensureAdmin, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请上传文件' });
    }

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const orderData = XLSX.utils.sheet_to_json(worksheet);

    const validOrders = orderData.filter(order => {
      return order.orderNumber &&  // 添加 orderNumber 必填验证
             order.userId && 
             order.productId &&
             order.quantity && 
             order.shippingAddress && 
             order.recipientName && 
             order.recipientPhone;
    });

    if (validOrders.length === 0) {
      return res.status(400).json({ error: '没有有效的订单数据' });
    }

    // 按订单号分组
    const orderGroups = validOrders.reduce((groups, item) => {
      const key = item.orderNumber;  // 直接使用 Excel 中的订单号
      if (!groups[key]) {
        groups[key] = {
          orderNumber: key,
          userId: item.userId,
          status: 'pending',
          shippingAddress: item.shippingAddress,
          recipientName: item.recipientName,
          recipientPhone: item.recipientPhone,
          items: []
        };
      }
      groups[key].items.push({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price || 0
      });
      return groups;
    }, {});

    // 批量创建订单和订单项
    const createdOrders = await sequelize.transaction(async (t) => {
      const orders = await Promise.all(
        Object.values(orderGroups).map(async (orderData) => {
          // 准备订单项数据
          const orderItemsData = await Promise.all(
            orderData.items.map(async (item) => {
              const product = await Product.findOne({ 
                where: { id: item.productId }
              });
          
              if (!product) {
                throw new Error(`找不到商品为 ${item.productId} 的商品`);
              }
          
              return {
                productId: product.id,
                quantity: item.quantity,
                price: product.price
              };
            })
          );

          // 计算总金额
          const totalAmount = orderItemsData.reduce((sum, item) => {
            return sum + (item.price * item.quantity);
          }, 0);

          // 创建订单和订单项
          const order = await Order.create({
            orderNumber: orderData.orderNumber,
            userId: orderData.userId,
            status: orderData.status,
            shippingAddress: orderData.shippingAddress,
            recipientName: orderData.recipientName,
            recipientPhone: orderData.recipientPhone,
            totalAmount: totalAmount,
            OrderItems: orderItemsData.map(item => ({
              ProductId: item.productId,  // 使用大写的 ProductId
              quantity: item.quantity,
              price: item.price,
              Product: {  // 添加 Product 关联
                id: item.productId
              }
            }))
          }, {
            include: [{
              model: OrderItem
            }],
            transaction: t
          });

          return order;
        })
      );
      return orders;
    });

    res.json({
      message: '订单导入成功',
      totalImported: createdOrders.length,
      failedCount: orderData.length - validOrders.length
    });

  } catch (error) {
    console.error('订单导入错误:', error);
    res.status(500).json({ error: error.message || '订单导入失败' });
  }
});

// 用户管理页面
router.get('/users', ensureAdmin, async (req, res) => {
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
router.post('/users/:id/role', ensureAdmin, async (req, res) => {
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
router.post('/users/:id/delete', ensureAdmin, async (req, res) => {
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