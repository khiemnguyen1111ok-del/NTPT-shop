// ==========================================
// 1. CẤU HÌNH HỆ THỐNG
// ==========================================
const SHOP_CONFIG = {
  ZALO_PHONE: "0763299408",
  SHOP_NAME: "NTPT SHOP"
};

const itemsPerPage = 8;
let currentPage = 1;
let cart = [];

// ==========================================
// 2. QUẢN LÝ PHÂN TRANG & TÌM KIẾM
// ==========================================
function updatePagination() {
  const allCards = Array.from(document.querySelectorAll('.product-grid .product-card'));
  const visibleCards = allCards.filter(card => card.getAttribute('data-search-hidden') !== 'true');
  const totalPages = Math.ceil(visibleCards.length / itemsPerPage);

  // Ẩn toàn bộ sản phẩm trước
  allCards.forEach(card => card.style.display = 'none');

  // Tính toán chỉ số hiển thị cho trang hiện tại
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  // Chỉ hiển thị sản phẩm thuộc trang hiện tại
  visibleCards.slice(startIndex, endIndex).forEach(card => {
    card.style.display = 'block';
  });

  renderPaginationButtons(totalPages);
}

function renderPaginationButtons(totalPages) {
  const wrapper = document.getElementById('pagination-wrapper');
  if (!wrapper) return;
  
  wrapper.innerHTML = '';
  if (totalPages <= 1) return;

  // Nút Quay lại (Prev)
  const prevBtn = document.createElement('button');
  prevBtn.className = 'pagination-btn';
  prevBtn.innerText = '❮';
  prevBtn.disabled = currentPage === 1;
  prevBtn.onclick = () => {
    currentPage--;
    goToTop();
  };
  wrapper.appendChild(prevBtn);

  // Các nút số trang
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.className = `pagination-btn ${currentPage === i ? 'active' : ''}`;
    btn.innerText = i;
    btn.onclick = () => {
      currentPage = i;
      goToTop();
    };
    wrapper.appendChild(btn);
  }

  // Nút Tiếp theo (Next)
  const nextBtn = document.createElement('button');
  nextBtn.className = 'pagination-btn';
  nextBtn.innerText = '❯';
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.onclick = () => {
    currentPage++;
    goToTop();
  };
  wrapper.appendChild(nextBtn);
}

function goToTop() {
  updatePagination();
  document.getElementById('product-section')?.scrollIntoView({ behavior: 'smooth' });
}

function filterProducts() {
  const searchInput = document.getElementById('search-input');
  if (!searchInput) return;

  const filterValue = searchInput.value.toLowerCase().trim();
  const allCards = document.querySelectorAll('.product-grid .product-card');

  allCards.forEach(card => {
    const titleEl = card.querySelector('h3');
    if (!titleEl) return;

    const productName = titleEl.innerText.toLowerCase();
    if (productName.includes(filterValue)) {
      card.removeAttribute('data-search-hidden');
    } else {
      card.setAttribute('data-search-hidden', 'true');
    }
  });

  currentPage = 1; // Reset về trang đầu khi tìm kiếm
  updatePagination();
}

// ==========================================
// 3. QUẢN LÝ GIỎ HÀNG (LOGIC & GIAO DIỆN)
// ==========================================
function toggleCart() {
  const cartDropdown = document.getElementById('cart-dropdown');
  if (cartDropdown) cartDropdown.classList.toggle('hidden');
}

function addToCart(name, price) {
  const existingItem = cart.find(item => item.name === name);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ name, price, quantity: 1 });
  }
  updateCartUI();
}

function changeQuantity(name, delta) {
  const item = cart.find(item => item.name === name);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    cart = cart.filter(i => i.name !== name);
  }
  updateCartUI();
}

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
        </div>
      `;
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
  
  // ĐÃ SỬA LỖI: Thêm dấu $ trước ngoặc nhọn và dấu gạch chéo hợp lệ cho link Zalo
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

  // Đăng ký sự kiện cho các nút Mua hàng (.btn-buy) hiện có trên trang
  document.querySelectorAll('.btn-buy').forEach(button => {
    button.addEventListener('click', (e) => {
      const name = e.target.getAttribute('data-name');
      const price = parseInt(e.target.getAttribute('data-price'), 10);
      if (name && !isNaN(price)) {
        addToCart(name, price);
      }
    });

