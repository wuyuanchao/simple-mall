const XLSX = require('xlsx');

// 示例数据
const orders = [
    {
        orderNumber: 'ORD20240305001',
        userId: 1,
        productId: 1,
        quantity: 2,
        status: 'pending',
        totalAmount: 199.98,
        shippingAddress: '上海市浦东新区张江高科技园区',
        recipientName: '张三',
        recipientPhone: '13800138000'
    },
    {
        orderNumber: 'ORD20240305002',
        userId: 2,
        productId: 3,
        quantity: 1,
        status: 'pending',
        totalAmount: 299.99,
        shippingAddress: '北京市朝阳区望京soho',
        recipientName: '李四',
        recipientPhone: '13900139000'
    },
    {
        orderNumber: 'ORD20240305003',
        userId: 1,
        productId: 2,
        quantity: 3,
        status: 'pending',
        totalAmount: 447.00,
        shippingAddress: '广州市天河区珠江新城',
        recipientName: '王五',
        recipientPhone: '13700137000'
    }
];

// 创建工作簿
const wb = XLSX.utils.book_new();

// 转换数据为工作表
const ws = XLSX.utils.json_to_sheet(orders);

// 设置列宽
const colWidths = [
    { wch: 15 }, // orderNumber
    { wch: 8 },  // userId
    { wch: 10 }, // productId
    { wch: 8 },  // quantity
    { wch: 10 }, // status
    { wch: 12 }, // totalAmount
    { wch: 40 }, // shippingAddress
    { wch: 12 }, // recipientName
    { wch: 15 }  // recipientPhone
];
ws['!cols'] = colWidths;

// 将工作表添加到工作簿
XLSX.utils.book_append_sheet(wb, ws, '订单数据');

// 生成 Excel 文件
XLSX.writeFile(wb, 'order_template.xlsx');

console.log('Excel 模板文件已生成：order_template.xlsx');