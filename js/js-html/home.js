// home.js - Phiên bản hoàn chỉnh với kiểm tra đăng nhập khi vào giỏ hàng
document.addEventListener("DOMContentLoaded", function () {
  // Khởi tạo các chức năng chính
  initLoginStatus();
  initCart();
  initProductInteractions();
  initCategoryCarousel();
  initSearchFeature();
});

/**
 * Quản lý trạng thái đăng nhập/đăng xuất
 */
function initLoginStatus() {
  const userLogin = JSON.parse(localStorage.getItem("userLogin"));
  const userLoginElement = document.getElementById("userLogin");
  const loginRegisterSection = document.getElementById("loginRegisterSection");
  const userLoginLi = document.querySelector("#userLogin").closest("li");

  if (userLogin) {
    // Hiển thị thông tin người dùng đã đăng nhập
    userLoginElement.innerHTML = `
      <div class="dropdown">
        <span class="dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style="cursor: pointer">
          ${userLogin.userName}
        </span>
        <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
          <a class="dropdown-item" href="#" id="logoutBtn">Đăng xuất</a>
        </div>
      </div>
    `;

    loginRegisterSection.style.display = "none";
    userLoginLi.style.display = "block";

    // Xử lý sự kiện đăng xuất
    document
      .getElementById("logoutBtn")
      .addEventListener("click", function (e) {
        e.preventDefault();
        localStorage.removeItem("userLogin");
        window.location.href = "login.html";
      });

    // Kích hoạt dropdown của Bootstrap
    $(userLoginElement).find(".dropdown-toggle").dropdown();
  } else {
    userLoginElement.innerHTML = "";
    loginRegisterSection.style.display = "block";
    userLoginLi.style.display = "none";
  }
}

/**
 * Quản lý giỏ hàng với kiểm tra đăng nhập
 */
function initCart() {
  updateCartCount();

  // Thêm sự kiện click cho icon giỏ hàng
  const cartLink = document.querySelector('a[href="../html/cart.html"]');
  if (cartLink) {
    cartLink.addEventListener("click", function (e) {
      const userLogin = JSON.parse(localStorage.getItem("userLogin"));

      if (!userLogin) {
        e.preventDefault();
        showLoginRequiredToast();
      }
    });
  }
}

// Cập nhật số lượng sản phẩm trong giỏ hàng
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

  let cartBadge = document.querySelector(".badge-danger");

  // Tìm phần tử giỏ hàng chính xác hơn
  const cartIcon = document.querySelector(
    'a[href="../html/cart.html"] .fa-cart-shopping'
  );
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

// Hiển thị thông báo yêu cầu đăng nhập
function showLoginRequiredToast() {
  const toast = document.createElement("div");
  toast.className = "toast show position-fixed bottom-0 end-0 mb-3 me-3";
  toast.style.zIndex = "9999";
  toast.style.minWidth = "300px";
  toast.innerHTML = `
    <div class="toast-header bg-warning text-dark">
      <strong class="me-auto">Thông báo</strong>
      <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
    <div class="toast-body">
      <i class="fas fa-exclamation-circle me-2"></i>
      Vui lòng <a href="../html/login.html" class="text-primary fw-bold">đăng nhập</a> để sử dụng giỏ hàng
      <div class="mt-2">
        <a href="../html/register.html" class="text-success">Chưa có tài khoản? Đăng ký ngay</a>
      </div>
    </div>
  `;

  document.body.appendChild(toast);

  // Tự động đóng thông báo sau 5 giây
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 5000);
}

/**
 * Xử lý tương tác với sản phẩm
 */
function initProductInteractions() {
  fetch("../assets/data/products.json") // Đường dẫn tới file products.json
    .then((response) => response.json())
    .then((products) => {
      const productContainers = document.querySelectorAll(".product-list-s");

      productContainers.forEach((container) => {
        const category = container.previousElementSibling.textContent
          .trim()
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/\s+/g, "_");

        const filteredProducts = products.filter(
          (p) => p.category === category
        );

        container.querySelector(".row").innerHTML = filteredProducts
          .map(
            (product) => `
              <div class="col-md-4 mb-3 product-item" data-id="${product.id}">
                <img src="${
                  product.image
                }" class="img-fluid w-75 product-image">
                <h4 class="product-name">${product.name}</h4>
                <h3 class="product-price">${product.price.toLocaleString()}đ</h3>
                <button class="btn btn-sm btn-danger add-to-cart">Thêm vào giỏ</button>
                <a href="product_detail.html?id=${
                  product.id
                }" class="btn btn-sm btn-outline-secondary">Xem chi tiết</a>
              </div>
            `
          )
          .join("");
      });

      // Thêm sự kiện click cho nút thêm vào giỏ
      document.addEventListener("click", function (e) {
        if (e.target.classList.contains("add-to-cart")) {
          e.preventDefault();

          const userLogin = JSON.parse(localStorage.getItem("userLogin"));
          if (!userLogin) {
            showLoginRequiredToast();
            return;
          }

          const productItem = e.target.closest(".product-item");
          const productId = productItem.getAttribute("data-id");
          addProductToCart(productId);
        }
      });
    })
    .catch((error) => {
      console.error("Không thể tải sản phẩm từ file JSON:", error);
    });
}

// Thêm sản phẩm vào giỏ hàng
function addProductToCart(productId) {
  const productItem = document.querySelector(
    `.product-item[data-id="${productId}"]`
  );

  if (!productItem) return;

  const product = {
    id: productId,
    name: productItem.querySelector(".product-name").textContent,
    price: productItem.querySelector(".product-price").textContent,
    image: productItem.querySelector(".product-image").src,
    quantity: 1,
  };

  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const existingItem = cart.find((item) => item.id === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push(product);
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();

  // Hiển thị thông báo
  showToast("Đã thêm sản phẩm vào giỏ hàng");
}

// Hiển thị thông báo thêm vào giỏ hàng thành công
function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast show position-fixed bottom-0 end-0 mb-3 me-3";
  toast.style.zIndex = "9999";
  toast.innerHTML = `
    <div class="toast-header bg-danger text-white">
      <strong class="me-auto">Thông báo</strong>
      <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
    <div class="toast-body">
      <i class="fas fa-check-circle me-2"></i>
      ${message}
    </div>
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/**
 * Khởi tạo carousel danh mục
 */
function initCategoryCarousel() {
  document.querySelectorAll(".category-icon").forEach((icon) => {
    icon.addEventListener("click", function () {
      const categoryName = this.querySelector("h5").textContent;
      const categoryId = categoryName
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "_");
      window.location.href = `category.html?category=${categoryId}`;
    });
  });
}

// Tim kiem
function initSearchFeature() {
  const searchInput = document.getElementById("searchInput");
  const searchBtn = document.getElementById("searchBtn");
  let productsCache = null; // Cache dữ liệu sản phẩm

  if (!searchInput || !searchBtn) {
    console.error("Search elements not found");
    return;
  }

  // Thêm sự kiện
  searchBtn.addEventListener("click", handleSearch);
  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleSearch();
  });

  async function loadProducts() {
    if (productsCache) return productsCache;

    try {
      const response = await fetch("../assets/data/products.json");
      if (!response.ok) throw new Error("Network response was not ok");
      productsCache = await response.json();
      return productsCache;
    } catch (error) {
      console.error("Error loading products:", error);
      throw error;
    }
  }

  async function handleSearch() {
    const keyword = searchInput.value.trim();
    if (!keyword) {
      showToast("Vui lòng nhập từ khóa tìm kiếm", "warning");
      return;
    }

    // Hiển thị loading
    showLoading(true);

    try {
      const products = await loadProducts();
      displaySearchResults(keyword, products);
    } catch (error) {
      showToast("Lỗi khi tải dữ liệu sản phẩm", "danger");
    } finally {
      showLoading(false);
    }
  }

  function showLoading(show) {
    let loadingElement = document.getElementById("searchLoading");

    if (show) {
      if (!loadingElement) {
        loadingElement = document.createElement("div");
        loadingElement.id = "searchLoading";
        loadingElement.className = "text-center my-3";
        loadingElement.innerHTML = `
          <div class="spinner-border text-danger" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-2">Đang tìm kiếm...</p>
        `;
        document.querySelector(".contain .container").prepend(loadingElement);
      }
    } else if (loadingElement) {
      loadingElement.remove();
    }
  }

  function displaySearchResults(keyword, products) {
    // Xóa kết quả cũ và loading nếu có
    document.getElementById("searchResults")?.remove();
    document.getElementById("searchLoading")?.remove();

    const matchedProducts = products.filter((p) =>
      p.name.toLowerCase().includes(keyword.toLowerCase())
    );

    const resultsContainer = document.createElement("div");
    resultsContainer.id = "searchResults";
    document.querySelector(".contain .container").prepend(resultsContainer);

    if (matchedProducts.length === 0) {
      resultsContainer.innerHTML = `
        <div class="alert alert-info">
          <i class="fas fa-search me-2"></i>
          Không tìm thấy sản phẩm nào phù hợp với "${keyword}"
          <button class="btn btn-link p-0 ms-2" onclick="this.closest('#searchResults').remove()">
            <i class="fas fa-times"></i>
          </button>
        </div>
      `;
    } else {
      resultsContainer.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-3">
          <div class="product_title border-bottom">
            <strong class="bg-danger text-white p-2">
              KẾT QUẢ TÌM KIẾM: ${
                matchedProducts.length
              } sản phẩm phù hợp với "${keyword}"
            </strong>
          </div>
          <button class="btn btn-sm btn-outline-secondary" onclick="this.closest('#searchResults').remove()">
            <i class="fas fa-times"></i> Đóng
          </button>
        </div>
        <div class="row mt-3">
          ${matchedProducts
            .map(
              (product) => `
            <div class="col-md-4 mb-4">
              <div class="card h-100">
                <img src="${product.image}" class="card-img-top" alt="${
                product.name
              }" style="height: 200px; object-fit: contain">
                <div class="card-body">
                  <h5 class="card-title">${product.name}</h5>
                  <p class="text-danger fw-bold">${product.price.toLocaleString()}đ</p>
                </div>
                <div class="card-footer bg-white">
                  <button class="btn btn-sm btn-danger add-to-cart" data-id="${
                    product.id
                  }">
                    <i class="fas fa-cart-plus me-1"></i> Thêm giỏ hàng
                  </button>
                  <a href="product_detail.html?id=${product.id}" 
                     class="btn btn-sm btn-outline-secondary">
                    Xem chi tiết
                  </a>
                </div>
              </div>
            </div>
          `
            )
            .join("")}
        </div>
      `;
    }
  }
}
