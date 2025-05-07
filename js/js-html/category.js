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

let products = [];

// ----------------- RENDER -----------------
function renderFilterList() {
  const filterList = document.getElementById("js-filter-list");
  filterList.innerHTML = categories
    .map(
      (cat) =>
        `<button class="btn btn-outline-danger mb-2 w-100" data-category="${cat.id}">${cat.name}</button>`
    )
    .join("");
}

function renderProductList(filteredCategory = null) {
  const productList = document.getElementById("js-product-list");
  const filteredProducts = filteredCategory
    ? products.filter((p) => p.category === filteredCategory)
    : products;

  if (filteredProducts.length === 0) {
    productList.innerHTML = `<div class="col-12 text-center">Không có sản phẩm nào.</div>`;
    return;
  }

  productList.innerHTML = filteredProducts
    .map(
      (p) => `
      <div class="col-md-4 mb-4" data-id="${p.id}">
        <div class="product-card p-3">
          <img src="${p.image}" class="card-img-top" alt="${p.name}" />
          <div class="mt-2">
            <h5>${p.name}</h5>
            <p class="text-danger">${p.price.toLocaleString()} VNĐ</p>
            <button class="btn btn-sm btn-danger" onclick="event.stopPropagation(); addToCartFromCategory('${
              p.id
            }')">Thêm vào giỏ</button>
          </div>
        </div>
      </div>
    `
    )
    .join("");
}

// ----------------- SỰ KIỆN -----------------
function handleFilterClick() {
  document
    .getElementById("js-filter-list")
    .addEventListener("click", function (e) {
      if (e.target.matches("button[data-category]")) {
        const category = e.target.getAttribute("data-category");
        renderProductList(category);
      }
    });
}

function handleProductClick() {
  document
    .getElementById("js-product-list")
    .addEventListener("click", function (e) {
      const productCard = e.target.closest(".product-card");
      if (productCard) {
        const productId = productCard
          .closest("[data-id]")
          ?.getAttribute("data-id");
        if (productId) {
          window.location.href = `product_detail.html?id=${productId}`;
        }
      }
    });
}

// ----------------- GIỎ HÀNG -----------------
window.addToCartFromCategory = function (productId) {
  const product = products.find((p) => p.id == productId);
  if (!product) return;

  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const index = cart.findIndex((item) => item.id === productId);

  if (index >= 0) {
    cart[index].quantity += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price.toLocaleString() + " VNĐ",
      image: product.image,
      quantity: 1,
    });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  alert("Đã thêm sản phẩm vào giỏ hàng!");
  if (typeof updateCartCount === "function") updateCartCount();
};

// ----------------- LOAD DỮ LIỆU -----------------
async function loadProducts() {
  try {
    const res = await fetch("../assets/data/products.json");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    products = await res.json();
    renderProductList();
    console.log("Dữ liệu sản phẩm đã được load:", products);
  } catch (error) {
    console.error("Lỗi khi tải sản phẩm:", error);
    alert(
      "Không thể tải danh sách sản phẩm. Vui lòng kiểm tra đường dẫn hoặc server."
    );
  }
}

// ----------------- KHỞI TẠO -----------------
document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 DOM loaded");
  renderFilterList();
  handleFilterClick();
  handleProductClick();
  loadProducts();
});
