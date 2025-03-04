$(document).ready(function() {
  // 数量选择器
  $('#increase').click(function() {
    let $input = $('#quantity');
    let currentVal = parseInt($input.val());
    let max = parseInt($input.attr('max'));
    if (currentVal < max) {
      $input.val(currentVal + 1);
    }
  });

  $('#decrease').click(function() {
    let $input = $('#quantity');
    let currentVal = parseInt($input.val());
    if (currentVal > 1) {
      $input.val(currentVal - 1);
    }
  });

  // 加入购物车
  $('.add-to-cart').click(function() {
    const productId = $(this).data('id');
    const quantity = $('#quantity').val();
    
    // TODO: 这里添加加入购物车的 AJAX 请求
    
    // 显示提示
    $('.toast').toast('show');
  });

  // 立即购买
  $('.buy-now').click(function() {
    const productId = $(this).data('id');
    const quantity = $('#quantity').val();
    
    // TODO: 这里添加立即购买的逻辑
    window.location.href = `/checkout?product=${productId}&quantity=${quantity}`;
  });
});