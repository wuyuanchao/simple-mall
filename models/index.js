const User = require('./User');
const Product = require('./Product');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const CartItem = require('./CartItem');

// 用户-订单关联
User.hasMany(Order);
Order.belongsTo(User);

// 订单-订单项关联
Order.hasMany(OrderItem);
OrderItem.belongsTo(Order);

// 商品-订单项关联
Product.hasMany(OrderItem);
OrderItem.belongsTo(Product);

// 用户-购物车关联
User.hasMany(CartItem);
CartItem.belongsTo(User);

// 商品-购物车关联
Product.hasMany(CartItem);
CartItem.belongsTo(Product);

module.exports = {
  User,
  Product,
  Order,
  OrderItem,
  CartItem
};