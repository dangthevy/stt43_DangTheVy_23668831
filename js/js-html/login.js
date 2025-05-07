const formLogin = document.getElementById("formLogin");
const emailElement = document.getElementById("email");
const passwordElement = document.getElementById("password");
const alertError = document.getElementById("alertError");

// Element liên quan đến lỗi
const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");

//Lắng nghe sự kiện submit form đăng nhập tài khoản
formLogin.addEventListener("submit", function (e) {
  // Ngăn chặn sự kiện load lại trang
  e.preventDefault();
  //   Validate xử lý đầu vào
  function validateEmail(email) {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  }

  if (!emailElement.value) {
    emailError.style.display = "block";
  } else {
    emailError.style.display = "none";
    //   Kiểm tra định dạng email
    if (!validateEmail(emailElement.value)) {
      emailError.style.display = "block";
      emailError.innerHTML = "Email không đúng định dạng";
    }
  }

  if (!passwordElement.value) {
    passwordError.style.display = "block";
  } else {
    passwordError.style.display = "none";
  }

  //   Lấy dữ liệu từ local về
  const userLocal = JSON.parse(localStorage.getItem("users")) || [];

  //   Tìm kiếm email và mật khẩu người dùng nhập vào có tồn tại không ?
  const findUser = userLocal.find(
    (user) =>
      user.email === emailElement.value &&
      user.password === passwordElement.value
  );

  if (!findUser) {
    //   Nếu có thì đăng nhập thành công và chuyển hướng về trang chủ
    alertError.style.display = "block";
  } else {
    //    Nếu không thì thông báo người dùng nhập lại dữ liệu
    window.location.href = "home.html";
  }

  //   Lưu thông tin của user đăng nhập lên local
  localStorage.setItem("userLogin", JSON.stringify(findUser));
});
