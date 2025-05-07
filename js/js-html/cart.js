// Hàm load giỏ hàng
function loadCart() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const cartItemsContainer = document.getElementById("js-cart-items");

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
      <tr>
        <td colspan="5" class="text-center py-5">
          <i class="fas fa-shopping-cart fa-3x mb-3 text-muted"></i>
          <p>Giỏ hàng của bạn đang trống</p>
          <a href="./category.html" class="btn btn-danger">Mua sắm ngay</a>
        </td>
      </tr>
    `;

    // Ẩn nút cập nhật và thanh toán
    document.querySelectorAll(".btn-update, .btn-checkout").forEach((btn) => {
      btn.style.display = "none";
    });
    return;
  }

  // Hiển thị sản phẩm trong giỏ hàng
  cartItemsContainer.innerHTML = cart
    .map((item) => {
      const price = parseInt(item.price.replace(/\D/g, "")) || 0;
      return `
      <tr>
        <td>
          <div class="d-flex align-items-center">
            <img src="${item.image}" alt="${
        item.name
      }" class="cart-item-image mr-3">
            <span>${item.name}</span>
          </div>
        </td>
        <td>${item.price}</td>
        <td>
          <input type="number" min="1" value="${item.quantity}"
            class="form-control quantity-input"
            data-id="${item.id}">
        </td>
        <td>
          ${(price * item.quantity).toLocaleString()} VNĐ
        </td>
        <td>
          <button class="btn btn-sm btn-outline-danger"
            onclick="removeFromCart('${item.id}')">
            <i class="fas fa-trash-alt"></i>
          </button>
        </td>
      </tr>
    `;
    })
    .join("");

  // Hiển thị nút cập nhật và thanh toán
  document.querySelectorAll(".btn-update, .btn-checkout").forEach((btn) => {
    btn.style.display = "inline-block";
  });

  // Tính toán tổng tiền
  calculateTotal();
}

// Hàm xóa sản phẩm khỏi giỏ hàng
function removeFromCart(productId) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart = cart.filter((item) => item.id.toString() !== productId.toString());

  localStorage.setItem("cart", JSON.stringify(cart));

  // Load lại giỏ hàng
  loadCart();
  // Cập nhật số lượng trên header
  updateCartCount();
}

// Hàm cập nhật giỏ hàng
function updateCart() {
  const quantityInputs = document.querySelectorAll(".quantity-input");
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  quantityInputs.forEach((input) => {
    const productId = input.getAttribute("data-id");
    const newQuantity = parseInt(input.value) || 1; // Mặc định là 1 nếu không hợp lệ

    if (newQuantity > 0) {
      const itemIndex = cart.findIndex((item) => item.id === productId);
      if (itemIndex >= 0) {
        cart[itemIndex].quantity = newQuantity;
      }
    }
  });

  localStorage.setItem("cart", JSON.stringify(cart));
  loadCart();
  updateCartCount();
  alert("Giỏ hàng đã được cập nhật!");
}

// Hàm tính tổng tiền
function calculateTotal() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  let subtotal = 0;

  cart.forEach((item) => {
    const price = parseInt(item.price.replace(/\D/g, "")) || 0;
    subtotal += price * item.quantity;
  });

  // Tính phí vận chuyển
  const shipping = subtotal >= 500000 ? 0 : 30000;

  // Hiển thị
  document.getElementById("js-subtotal").innerText =
    subtotal.toLocaleString() + " VNĐ";
  document.getElementById("js-shipping").innerText =
    shipping.toLocaleString() + " VNĐ";
  document.getElementById("js-total").innerText =
    (subtotal + shipping).toLocaleString() + " VNĐ";
}

// Hàm thanh toán
function checkout() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  if (cart.length === 0) {
    alert("Giỏ hàng của bạn đang trống!");
    return;
  }

  // Chuyển đến trang thanh toán
  window.location.href = "checkout.html";
}

// Hàm cập nhật số lượng trên giỏ hàng (header)
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

  // Dùng selector chung
  let cartBadge = document.querySelector(".badge-danger");

  const cartIcon = document.querySelector(".fa-cart-shopping");
  if (!cartIcon) return;

  if (!cartBadge && totalItems > 0) {
    cartBadge = document.createElement("span");
    cartBadge.className = "position-absolute badge badge-pill badge-danger";
    cartBadge.style.top = "-8px";
    cartBadge.style.left = "25px";
    cartIcon.parentElement.appendChild(cartBadge);
  }

  if (cartBadge) {
    cartBadge.innerText = totalItems;
    cartBadge.style.display = totalItems > 0 ? "block" : "none";
  }
}

// Khi DOM đã tải xong
document.addEventListener("DOMContentLoaded", function () {
  loadCart();
  updateCartCount();
});
