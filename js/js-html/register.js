// Lấy ra element của trang
const formRegister = document.getElementById("formRegister");
const userNameElement = document.getElementById("userName");
const emailElement = document.getElementById("email");
const passwordElement = document.getElementById("password");
const rePasswordElement = document.getElementById("rePassword");
const addressElement = document.getElementById("address");

// Element liên quan đến lỗi
const userNameError = document.getElementById("userNameError");
const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");
const rePasswordError = document.getElementById("rePasswordError");

// Lấy dữ liệu từ LocalStorage
const userLocal = JSON.parse(localStorage.getItem("users")) || [];

/**
 * Validate địa chỉ email
 * @param {*} email: Chuỗi email người dùng nhập vào
 * @returns: Dữ liệu nếu email đúng định dạng, undifined nếu email không đúng định dạng
 */

function validateEmail(email) {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
}

//Lắng nghe sự kiện submit form đăng ký tài khoản
formRegister.addEventListener("submit", function (e) {
  // Ngăn chặn sự kiện load lại trang
  e.preventDefault();

  //   Validate dữ liệu đầu vào
  if (!userNameElement.value) {
    // Hiển thị lỗi
    userNameError.style.display = "block";
  } else {
    // Ẩn lỗi
    userNameError.style.display = "none";
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

  if (!rePasswordElement.value) {
    rePasswordError.style.display = "block";
  } else {
    rePasswordError.style.display = "none";
  }

  //   Kiểm tra mật khẩu với nhập lại mật khẩu
  if (passwordElement.value !== rePasswordElement.value) {
    rePasswordError.style.display = "block";
    rePasswordError.innerHTML = "Mật khẩu không khớp";
  }

  //   Gửi dữ liệu từ form lên LocalStorage
  if (
    userNameElement.value &&
    emailElement.value &&
    passwordElement.value &&
    rePasswordElement.value &&
    passwordElement.value === rePasswordElement.value
  ) {
    // Lấy dữ liệu từ form và gộp thành đối tượng user
    const user = {
      userId: Math.ceil(Math.random() * 100000000),
      userName: userNameElement.value,
      email: emailElement.value,
      password: passwordElement.value,
      rePassword: rePasswordElement.value,
      address: addressElement.value,
    };

    // Push user vào trong mảng userLocal
    userLocal.push(user);

    // Lưu trữ dữ liệu lên Local
    localStorage.setItem("users", JSON.stringify(userLocal));

    // Chuyển hướng về trang đăng nhập
    setTimeout(function () {
      //Chuyển hướng về trang đăng nhập sau 1s
      window.location.href = "login.html";
    }, 1000);
  }
});
