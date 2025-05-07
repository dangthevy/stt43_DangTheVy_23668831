$(document).ready(function () {
  $(".owl-carousel").owlCarousel({
    loop: false,
    margin: 10, // Khoảng cách giữa các item
    nav: false, // Tắt nút điều hướng
    dots: false, // Tắt chấm chỉ mục
    responsive: {
      // Cấu hình responsive cho từng màn hình
      0: { items: 4 }, // Mobile: 4 item
      600: { items: 6 }, // Tablet: 6 item
      1000: { items: 11 }, // Desktop: HIỂN THỊ ĐỦ 11 ITEM
    },
    autoWidth: false, // Quan trọng: Tắt tự động co giãn item
    stagePadding: 20, // Thêm khoảng đệm hai bên (nếu cần)
  });
});
