let currentPage = 1;
const itemsPerPage = 8; // 👈 ĐÃ ĐỔI THÀNH 8 MÓN TRÊN 1 TRANG Ở ĐÂY NHA NÍ

function updatePagination() {
    const allCards = Array.from(document.querySelectorAll('.product-grid .product-card'));
    const visibleCards = allCards.filter(card => card.getAttribute('data-search-hidden') !== 'true');
    
    const totalPages = Math.ceil(visibleCards.length / itemsPerPage);

    allCards.forEach(card => card.style.display = 'none');

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
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

    const prevBtn = document.createElement('button');
    prevBtn.className = 'pagination-btn';
    prevBtn.innerText = '❮';
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => { currentPage--; goToTop(); };
    wrapper.appendChild(prevBtn);

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.className = `pagination-btn ${currentPage === i ? 'active' : ''}`;
        btn.innerText = i;
        btn.onclick = () => { currentPage = i; goToTop(); };
        wrapper.appendChild(btn);
    }

    const nextBtn = document.createElement('button');
    nextBtn.className = 'pagination-btn';
    nextBtn.innerText = '❯';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.onclick = () => { currentPage++; goToTop(); };
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
        const productName = card.querySelector('h3').innerText.toLowerCase();
        if (productName.includes(filterValue)) {
            card.removeAttribute('data-search-hidden');
        } else {
            card.setAttribute('data-search-hidden', 'true');
        }
    });

    currentPage = 1;
    updatePagination();
}

document.getElementById('search-btn')?.addEventListener('click', filterProducts);
document.getElementById('search-input')?.addEventListener('input', filterProducts);

let cart = [];

function toggleCart() {
    const cartDropdown = document.getElementById('cart-dropdown');
    if (cartDropdown) cartDropdown.classList.toggle('hidden');
}

document.querySelectorAll('.btn-buy').forEach(button => {
    button.addEventListener('click', (e) => {
        const name = e.target.getAttribute('data-name');
        const price = parseInt(e.target.getAttribute('data-price'));
        addToCart(name, price);
    });
});

function addToCart(name, price) {
    const existingItem = cart.find(item => item.name === name);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ name: name, price: price, quantity: 1 });
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

// Thay thế hàm updateCartUI cũ trong file java-index.js bằng đoạn này:
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
                    <span style="font-size: 13px; max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${item.name}</span>
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

    // ĐÂY LÀ DÒNG LỆNH THẦN THÁNH: Lưu giỏ hàng vào máy của khách
    localStorage.setItem('ntpt_shop_cart', JSON.stringify(cart));
}

// Tìm đoạn code DOMContentLoaded ở cuối cùng file java-index.js, sửa lại như vầy để tự tải lại giỏ hàng khi mở web:
document.addEventListener("DOMContentLoaded", () => {
    // Lấy giỏ hàng cũ đã lưu ra (nếu có)
    const savedCart = localStorage.getItem('ntpt_shop_cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartUI(); // Hiện lại giỏ hàng cũ lên màn hình
    }
    updatePagination();
});
function checkoutZalo() {
    // 1. Kiểm tra nếu giỏ hàng trống thì không cho đặt
    if (cart.length === 0) {
        alert("Giỏ hàng của ní còn trống không, lựa đồ bỏ vô giỏ trước đã nhe!");
        return;
    }

    // 2. NHẬP SỐ ĐIỆN THOẠI ZALO CỦA NÍ VÀO ĐÂY (Viết liền, không khoảng cách, ví dụ: 0912345678)
    const myZaloPhone = "0763299408"; 

    // 3. Tự động gom và định dạng toàn bộ dữ liệu món hàng thành tin nhắn văn bản
    let message = `🛒 ĐƠN HÀNG MỚI TỪ WEBSITE NTPT SHOP 🛒\n`;
    message += `----------------------------------\n`;
    
    // Vòng lặp quét qua từng món đồ có trong giỏ
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        message += `📦 Món ${index + 1}: ${item.name}\n`;
        message += `   🔹 Số lượng: ${item.quantity}\n`;
        message += `   🔹 Đơn giá: ${item.price.toLocaleString('vi-VN')} đ\n`;
        message += `   🔹 Thành tiền: ${itemTotal.toLocaleString('vi-VN')} đ\n`;
        message += `----------------------------------\n`;
    });
    
    // Tính tổng số tiền cuối cùng của đơn hàng
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    message += `\n💰 TỔNG TIỀN ĐƠN HÀNG: ${totalPrice.toLocaleString('vi-VN')} đ\n`;
    message += `\n👉 Nhờ shop kiểm tra kho hàng và phản hồi sớm giúp mình nhe! Thank sốp!`;

    // 4. Mã hóa tin nhắn thành định dạng URL để trình duyệt hiểu được các ký tự xuống dòng và khoảng cách
    const encodeMessage = encodeURIComponent(message);
    
    // Tạo đường dẫn liên kết kích hoạt chat kèm nội dung soạn sẵn của Zalo
    const zaloUrl = `https://zalo.me{myZaloPhone}?text=${encodeMessage}`;

    // 5. Bật tab mới mở thẳng ứng dụng Zalo của khách lên để gửi tin nhắn cho sốp
    window.open(zaloUrl, '_blank');
}

