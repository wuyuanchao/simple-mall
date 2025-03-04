const ensureAuthenticated = (req, res, next) => {
  if (req.session.user) {
    return next();
  }
  req.flash('error_msg', '请先登录');
  res.redirect('/auth/login');
};

const ensureAdmin = (req, res, next) => {
  if (req.session.user && req.session.user.role === 'admin') {
    return next();
  }
  req.flash('error_msg', '无权限访问');
  res.redirect('/');
};

module.exports = { ensureAuthenticated, ensureAdmin };