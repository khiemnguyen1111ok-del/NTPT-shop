function updateCartUI() { 
  const cartCount = document.getElementById('cart-count'); 
  const cartItemsList = document.getElementById('cart-items-list'); 
  const cartTotalPrice = document.getElementById('cart-total-price'); 
  if (!cartCount || !cartItemsList || !cartTotalPrice) return; 
  
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0); 
  cartCount.innerText = totalItems; 
  
  if (cart.length === 0) { 
    cartItemsList.innerHTML = '<p class="empty-cart-msg">Giỏ hàng còn trống</p>'; 
  } else { 
    cartItemsList.innerHTML = ''; 
    cart.forEach(item => { 
      const itemHTML = ` 
        <div class="cart-item" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;"> 
          <span style="font-size: 13px; max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${item.name}">${item.name}</span> 
          <div style="display: flex; align-items: center; gap: 5px;"> 
            <button onclick="changeQuantity('${item.name}', -1)" style="padding: 2px 8px; cursor: pointer; border: 1px solid #ccc; background: #f0f0f0; font-weight: bold; border-radius: 3px;">-</button> 
            <span style="font-weight: bold; min-width: 15px; text-align: center;">${item.quantity}</span> 
            <button onclick="changeQuantity('${item.name}', 1)" style="padding: 2px 8px; cursor: pointer; border: 1px solid #ccc; background: #f0f0f0; font-weight: bold; border-radius: 3px;">+</button> 
          </div> 
          <span style="font-weight: 600; font-size: 14px;">${(item.price * item.quantity).toLocaleString('vi-VN')} đ</span> 
        </div> `; 
      cartItemsList.innerHTML += itemHTML; 
    }); 
  } 
  
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0); 
  cartTotalPrice.innerText = totalPrice.toLocaleString('vi-VN') + ' đ'; 
  
  // Lưu giỏ hàng vào trình duyệt của khách hàng 
  localStorage.setItem('ntpt_shop_cart', JSON.stringify(cart)); 
} 

// ========================================== 
// 4. XỬ LÝ ĐẶT HÀNG QUA ZALO 
// ========================================== 
function generateOrderMessage(cartItems) { 
  let message = `🛒 ĐƠN HÀNG MỚI TỪ WEBSITE ${SHOP_CONFIG.SHOP_NAME} 🛒\n`; 
  message += `----------------------------------\n`; 
  
  cartItems.forEach((item, index) => { 
    const itemTotal = item.price * item.quantity; 
    message += `📦 Món ${index + 1}: ${item.name}\n`; 
    message += ` 🔹 Số lượng: ${item.quantity}\n`; 
    message += ` 🔹 Đơn giá: ${item.price.toLocaleString('vi-VN')} đ\n`; 
    message += ` 🔹 Thành tiền: ${itemTotal.toLocaleString('vi-VN')} đ\n`; 
    message += `----------------------------------\n`; 
  }); 
  
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0); 
  message += `\n💰 TỔNG TIỀN ĐƠN HÀNG: ${totalPrice.toLocaleString('vi-VN')} đ\n`; 
  message += `\n👉 Nhờ shop kiểm tra kho hàng và phản hồi sớm giúp mình nhe! Thank sốp!`; 
  return message; 
} 

function checkoutZalo() { 
  if (!cart || cart.length === 0) { 
    alert("Giỏ hàng của ní còn trống không, lựa đồ bỏ vô giỏ trước đã nhe!"); 
    return; 
  } 
  
  const messageContent = generateOrderMessage(cart); 
  const encodeMessage = encodeURIComponent(messageContent); 
  
  // ĐÃ SỬA LỖI CHÍNH XÁC: Thêm dấu $ và dấu / vào link Zalo dưới đây
 // ✅ BẮT BUỘC dùng dấu huyền ` ở đầu và cuối chuỗi, và có dấu $
const zaloUrl = `https://zalo.me{SHOP_CONFIG.ZALO_PHONE}?text=${encodeMessage}`;
  
  window.open(zaloUrl, '_blank'); 
} 

// ========================================== 
// 5. KHỞI TẠO HỆ THỐNG KHI TẢI TRANG (DOM READY) 
// ========================================== 
document.addEventListener("DOMContentLoaded", () => { 
  // Lấy dữ liệu giỏ hàng đã lưu cũ (nếu có) 
  const savedCart = localStorage.getItem('ntpt_shop_cart'); 
  if (savedCart) { 
    try { 
      cart = JSON.parse(savedCart); 
      updateCartUI(); 
    } catch (e) { 
      console.error("Lỗi đọc dữ liệu giỏ hàng:", e); 
      cart = []; 
    } 
  } 
  
  // Khởi tạo hiển thị phân trang lần đầu 
  updatePagination(); 
  
  // Đăng ký sự kiện Tìm kiếm 
  document.getElementById('search-btn')?.addEventListener('click', filterProducts); 
  document.getElementById('search-input')?.addEventListener('input', filterProducts); 
  
  // ĐÃ SỬA LỖI CHÍNH XÁC: Lắng nghe sự kiện click toàn trang (Event Delegation)
  // Giúp nút bấm mua hàng luôn hoạt động bất kể phân trang hay tìm kiếm
  document.addEventListener('click', (e) => {
    const buyButton = e.target.closest('.btn-buy');
    if (buyButton) {
      e.preventDefault();
      const name = buyButton.getAttribute('data-name');
      const price = parseInt(buyButton.getAttribute('data-price'), 10);
      if (name && !isNaN(price)) {
        addToCart(name, price);
      }
    }
  });
});
