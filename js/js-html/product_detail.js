// ==================== KHAI BÁO BIẾN ====================
const categories = [
  { id: "can_keo", name: "Cần kéo" },
  { id: "can_noi", name: "Cần nối" },
  { id: "can_siet", name: "Cần siết" },
  { id: "tuyt", name: "Tuýt" },
  { id: "ong_dieu", name: "Ống điếu" },
  { id: "de_co_khi", name: "Đe cơ khí" },
  { id: "dung_cu_cao", name: "Dụng cụ cảo" },
  { id: "e_to", name: "Ê tô" },
  { id: "mo_lech", name: "Mỏ lếch" },
  { id: "co_le", name: "Cờ lê" },
  { id: "luc_giac", name: "Lục giác" },
];

const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get("id");

// ==================== HÀM CHÍNH ====================

// Khởi tạo trang
async function initProductPage() {
  if (!productId) {
    showError("Không tìm thấy sản phẩm!");
    setTimeout(() => (window.location.href = "category.html"), 2000);
    return;
  }

  try {
    showLoading(true);
    await loadProductDetails();
    updateCartCount();
    setupEventListeners();
  } catch (error) {
    console.error("Lỗi khởi tạo trang:", error);
    showError("Đã xảy ra lỗi khi tải sản phẩm");
  } finally {
    showLoading(false);
  }
}

// Load chi tiết sản phẩm
async function loadProductDetails() {
  try {
    const response = await fetch("../assets/data/infor_products.json");
    if (!response.ok) throw new Error("Không thể tải dữ liệu sản phẩm");

    const data = await response.json();
    const product = data.products.find((p) => p.id == productId);

    if (!product) throw new Error("Sản phẩm không tồn tại");

    // Thêm dòng này để debug
    console.log("Product loaded:", product);

    renderProductInfo(product);
    loadReviews();
    loadRelatedProducts(product.category, product.id);
  } catch (error) {
    console.error("Lỗi tải chi tiết sản phẩm:", error);
    showError(error.message);
    setTimeout(() => (window.location.href = "category.html"), 2000);
  }
}

// ==================== RENDER UI ====================

// Hiển thị thông tin sản phẩm
function renderProductInfo(product) {
  // Thông tin cơ bản
  setElementText("js-product-title", product.name);
  setElementText("js-product-name", product.name);
  setElementText("js-product-price", `${product.price.toLocaleString()} VNĐ`);
  setElementText(
    "js-product-description",
    product.description || "Đang cập nhật mô tả"
  );

  // Ảnh sản phẩm - sửa lại để lấy ảnh đầu tiên từ mảng images
  const mainImage = document.getElementById("js-main-image");
  if (mainImage) {
    mainImage.src = product.images?.[0] || "../img/default-product.jpg";
    mainImage.alt = product.name;
  }

  // Thumbnails - sửa lại để hiển thị tất cả ảnh
  renderThumbnails(product);

  // Mô tả đầy đủ
  setElementText(
    "js-full-description",
    product.description || "Đang cập nhật mô tả chi tiết"
  );

  // Thông số kỹ thuật
  renderProductSpecs(product);

  // Danh mục
  renderProductCategory(product);
}

// Render thumbnails
function renderThumbnails(product) {
  const container = document.getElementById("js-thumbnails");
  if (!container || !product.images || product.images.length <= 1) return;

  container.innerHTML = product.images
    .map(
      (img, index) => `
    <img src="${img}" 
         class="thumbnail-img ${index === 0 ? "active-thumbnail" : ""}" 
         onclick="changeMainImage(this)" 
         alt="${product.name}">
  `
    )
    .join("");
}

// Render mô tả sản phẩm
function renderProductDescription(product) {
  const container = document.getElementById("js-full-description");
  if (!container) return;

  let html = `<p>${product.description || "Đang cập nhật mô tả sản phẩm"}</p>`;

  if (product.specs?.length) {
    html += `<ul>${product.specs
      .map(
        (spec) => `
      <li><strong>${spec.name || "Thông số"}:</strong> ${
          spec.value || "N/A"
        }</li>
    `
      )
      .join("")}</ul>`;
  }

  container.innerHTML = html;
}

// Render thông số kỹ thuật
function renderProductSpecs(product) {
  const container = document.getElementById("js-specs-table");
  if (!container) return;

  let html = `
    <tr>
      <th scope="row">Mã sản phẩm</th>
      <td>${product.sku || `SP-${product.id}`}</td>
    </tr>
  `;

  if (product.specs?.length) {
    html += product.specs
      .map(
        (spec) => `
      <tr>
        <th scope="row">${spec.name}</th>
        <td>${spec.value || "N/A"}</td>
      </tr>
    `
      )
      .join("");
  }

  container.innerHTML = html;
}

// Render danh mục sản phẩm
function renderProductCategory(product) {
  const category = categories.find((c) => c.id === product.category);
  if (category) {
    setElementText("js-category-name", category.name);
  }
}

// ==================== GIỎ HÀNG ====================

// Thêm vào giỏ hàng
function addToCart() {
  const quantity = getProductQuantity();
  const product = getCurrentProductInfo();

  if (!product) return;

  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const existingItemIndex = cart.findIndex((item) => item.id === productId);

  if (existingItemIndex >= 0) {
    cart[existingItemIndex].quantity += quantity;
  } else {
    cart.push({
      id: productId,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: quantity,
    });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  showToast("Đã thêm sản phẩm vào giỏ hàng!");
  updateCartCount();
}

// Lấy số lượng sản phẩm
function getProductQuantity() {
  const quantityInput = document.getElementById("js-quantity");
  return quantityInput ? parseInt(quantityInput.value) || 1 : 1;
}

// Lấy thông tin sản phẩm hiện tại
function getCurrentProductInfo() {
  return {
    name: getElementText("js-product-name") || "Sản phẩm",
    price: getElementText("js-product-price") || "0 VNĐ",
    image: document.getElementById("js-main-image")?.src || "",
  };
}

// Cập nhật số lượng giỏ hàng
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

// ==================== XỬ LÝ SỐ LƯỢNG ====================

// Cập nhật số lượng
function updateQuantity(change) {
  const quantityInput = document.getElementById("js-quantity");
  if (!quantityInput) return;

  let quantity = parseInt(quantityInput.value) || 1;
  quantity = Math.max(1, Math.min(99, quantity + change));
  quantityInput.value = quantity;
}

// Tăng số lượng
function increaseQuantity() {
  updateQuantity(1);
}

// Giảm số lượng
function decreaseQuantity() {
  updateQuantity(-1);
}

// ==================== ĐÁNH GIÁ SẢN PHẨM ====================

function loadReviews() {
  const reviews = [
    {
      name: "Nguyễn Văn A",
      rating: 5,
      date: "15/10/2023",
      comment: "Sản phẩm rất tốt, chất lượng như mô tả!",
    },
    {
      name: "Trần Thị B",
      rating: 4,
      date: "10/10/2023",
      comment: "Sản phẩm tốt, giá cả hợp lý",
    },
  ];

  renderReviews(reviews);
  initReviewForm();
}

// Render đánh giá
function renderReviews(reviews) {
  const container = document.getElementById("js-reviews-container");
  if (!container) return;

  container.innerHTML = reviews
    .map(
      (review) => `
    <div class="card mb-3">
      <div class="card-body">
        <h6 class="card-title">${review.name}</h6>
        <div class="rating mb-2">
          ${'<i class="fas fa-star text-warning"></i>'.repeat(review.rating)}
          ${'<i class="far fa-star text-warning"></i>'.repeat(
            5 - review.rating
          )}
        </div>
        <p class="card-text">${review.comment}</p>
        <small class="text-muted">${review.date}</small>
      </div>
    </div>
  `
    )
    .join("");
}

// Khởi tạo form đánh giá
function initReviewForm() {
  const form = document.getElementById("reviewForm");
  if (!form) return;

  // Xử lý rating stars
  const stars = form.querySelectorAll(".rating-star");
  stars.forEach((star) => {
    star.addEventListener("click", function () {
      const rating = parseInt(this.dataset.rating);
      document.getElementById("reviewRating").value = rating;

      stars.forEach((s, i) => {
        s.classList.toggle("fas", i < rating);
        s.classList.toggle("far", i >= rating);
      });
    });
  });

  // Xử lý submit form
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    submitReview();
  });
}

// Submit đánh giá
function submitReview() {
  const name = document.getElementById("reviewName").value.trim();
  const rating = parseInt(document.getElementById("reviewRating").value);
  const comment = document.getElementById("reviewText").value.trim();

  if (!rating) {
    showToast("Vui lòng chọn số sao đánh giá");
    return;
  }

  const newReview = {
    name: name || "Khách hàng ẩn danh",
    rating: rating,
    date: new Date().toLocaleDateString("vi-VN"),
    comment: comment || "Không có bình luận",
  };

  addReviewToUI(newReview);
  document.getElementById("reviewForm").reset();
  showToast("Cảm ơn đánh giá của bạn!");
}

// Thêm đánh giá mới vào UI
function addReviewToUI(review) {
  const container = document.getElementById("js-reviews-container");
  if (!container) return;

  container.insertAdjacentHTML(
    "afterbegin",
    `
    <div class="card mb-3">
      <div class="card-body">
        <h6 class="card-title">${review.name}</h6>
        <div class="rating mb-2">
          ${'<i class="fas fa-star text-warning"></i>'.repeat(review.rating)}
          ${'<i class="far fa-star text-warning"></i>'.repeat(
            5 - review.rating
          )}
        </div>
        <p class="card-text">${review.comment}</p>
        <small class="text-muted">${review.date}</small>
      </div>
    </div>
  `
  );
}

// ==================== SẢN PHẨM LIÊN QUAN ====================

async function loadRelatedProducts(categoryId, excludeId) {
  const container = document.getElementById("js-related-products");
  if (!container) return;

  try {
    const response = await fetch("../assets/data/products.json");
    if (!response.ok) throw new Error("Không thể tải sản phẩm liên quan");

    const products = await response.json();
    const relatedProducts = products
      .filter((p) => p.category === categoryId && p.id != excludeId)
      .slice(0, 4);

    if (relatedProducts.length === 0) {
      container.innerHTML =
        '<p class="text-muted">Hiện chưa có sản phẩm liên quan</p>';
      return;
    }

    renderRelatedProducts(relatedProducts);
  } catch (error) {
    console.error("Lỗi tải sản phẩm liên quan:", error);
    container.innerHTML =
      '<p class="text-muted">Không thể tải sản phẩm liên quan</p>';
  }
}

// Render sản phẩm liên quan
function renderRelatedProducts(products) {
  const container = document.getElementById("js-related-products");
  if (!container) return;

  container.innerHTML = products
    .map(
      (product) => `
    <div class="col-md-3 mb-4">
      <div class="card h-100">
        <img src="${product.image}" class="card-img-top" alt="${product.name}">
        <div class="card-body">
          <h5 class="card-title">${product.name}</h5>
          <p class="text-danger">${product.price.toLocaleString()} VNĐ</p>
          <a href="product_detail.html?id=${
            product.id
          }" class="btn btn-sm btn-danger">Xem chi tiết</a>
        </div>
      </div>
    </div>
  `
    )
    .join("");
}

// ==================== TIỆN ÍCH ====================

// Hiển thị loading
function showLoading(show) {
  const loader = document.getElementById("js-loading");
  if (loader) loader.style.display = show ? "block" : "none";
}

// Hiển thị lỗi
function showError(message) {
  const errorContainer = document.getElementById("js-error");
  if (errorContainer) {
    errorContainer.textContent = message;
    errorContainer.style.display = "block";
  }
}

// Hiển thị thông báo
function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "position-fixed bottom-0 end-0 p-3";
  toast.style.zIndex = "11";
  toast.innerHTML = `
    <div class="toast show" role="alert">
      <div class="toast-body bg-success text-white">
        ${message}
      </div>
    </div>
  `;
  document.body.appendChild(toast);

  setTimeout(() => toast.remove(), 3000);
}

// Thiết lập event listeners
function setupEventListeners() {
  // Nút số lượng
  document
    .getElementById("js-increase-btn")
    ?.addEventListener("click", increaseQuantity);
  document
    .getElementById("js-decrease-btn")
    ?.addEventListener("click", decreaseQuantity);

  // Nút thêm vào giỏ hàng
  document
    .getElementById("js-add-to-cart")
    ?.addEventListener("click", addToCart);

  // Thay đổi ảnh chính
  document.querySelectorAll(".thumbnail-img").forEach((img) => {
    img.addEventListener("click", function () {
      changeMainImage(this);
    });
  });
}

// Helper - Đặt nội dung cho element
function setElementText(id, text) {
  const element = document.getElementById(id);
  if (element) element.textContent = text;
}

// Helper - Lấy nội dung từ element
function getElementText(id) {
  const element = document.getElementById(id);
  return element ? element.textContent : "";
}

// ==================== KHỞI CHẠY ====================
// Khai báo các hàm cần sử dụng trong HTML
// Thay đổi ảnh chính khi click thumbnail
function changeMainImage(imgElement) {
  const mainImage = document.getElementById("js-main-image");
  if (mainImage && imgElement?.src) {
    mainImage.src = imgElement.src;
  }

  // Highlight thumbnail được chọn
  document.querySelectorAll(".thumbnail-img").forEach((img) => {
    img.classList.remove("active-thumbnail");
  });
  imgElement.classList.add("active-thumbnail");
}

window.changeMainImage = changeMainImage;
window.increaseQuantity = increaseQuantity;
window.decreaseQuantity = decreaseQuantity;
window.addToCart = addToCart;

// Khởi chạy khi DOM tải xong
document.addEventListener("DOMContentLoaded", initProductPage);
