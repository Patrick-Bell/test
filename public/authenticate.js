const passwordInput = document.getElementById('password');
const usernameInput = document.getElementById('username');
const passwordError = document.querySelector(".password-error");
const usernameError = document.querySelector(".username-error");
const emailInput = document.getElementById("email");
const emailError = document.querySelector(".email-error");
const registerButton = document.querySelector("#register-btn");
const confirmPasswordInput = document.getElementById('confirm-password');
const confirmPasswordError = document.querySelector(".confirm-password-error");
const showHidePassword = document.querySelector(".show_hide");

let validLength, includesLowercase, includesUppercase, includesSpecialChar, includesEmailTemplate, includesUsernameTemplate;

usernameInput.addEventListener("input", () => {
    const username = usernameInput.value;

    usernameTemplate = /^[A-Za-z]+$/;
    includesUsernameTemplate = usernameTemplate.test(username)

    if (username.length === 0){
        usernameError.style.display = "none"
    } else if(includesUsernameTemplate) {
        usernameError.style.display = "block";
        usernameError.style.background = "green";
        usernameError.innerHTML = "Valid name"
    } else {
        usernameError.style.display = "block";
        usernameError.style.background = "red";
        usernameError.innerHTML = "Name should only contain letters"
    }

    checkValidatedFields()
})

// Event listener for email input
emailInput.addEventListener("input", () => {
    const email = emailInput.value;

    const emailTemplate = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    includesEmailTemplate = emailTemplate.test(email);

    if (email.length === 0) {
        emailError.style.display = "none";
    } else if (includesEmailTemplate) {
        emailError.style.display = "block";
        emailError.style.background = "green";
        emailError.innerHTML = "Valid Email";
    } else {
        emailError.style.display = "block";
        emailError.innerHTML = "Invalid email address.";
        emailError.style.background = "red";
        registerButton.setAttribute('disabled', 'disabled');
    }

    checkValidatedFields();
});

// Event listener for password input
passwordInput.addEventListener("input", () => {
    const password = passwordInput.value;

    const lowercase = /[a-z]/;
    const uppercase = /[A-Z]/;
    const specialChar = /[!@#$%^&*(),.?":{}|<>]/;

    validLength = password.length >= 8;
    includesLowercase = lowercase.test(password);
    includesUppercase = uppercase.test(password);
    includesSpecialChar = specialChar.test(password);

    if (password.length === 0) {
        passwordError.style.display = "none";
    } else if (validLength && includesLowercase && includesUppercase && includesSpecialChar) {
        passwordError.style.display = "block";
        passwordError.style.background = "green";
        passwordError.innerHTML = "Password Valid";
    } else {
        passwordError.style.display = "block";
        passwordError.style.background = "red";
        passwordError.innerHTML = "Password invalid";
    }

    checkPasswords()
    checkValidatedFields();
});

confirmPasswordInput.addEventListener("input", () => {
    let password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (confirmPassword.length === 0){
        confirmPasswordError.style.display = "none"
    } else if (password === confirmPassword) {
        confirmPasswordError.style.display = "block";
        confirmPasswordError.style.background = "green";
        confirmPasswordError.innerHTML = "Passwords match"
    } else {
        confirmPasswordError.style.display = "block";
        confirmPasswordError.style.background = "red";
        confirmPasswordError.innerHTML = "Passwords do not match"
    }

    checkPasswords()
    checkValidatedFields()
})

function checkPasswords () {
    const val1 = passwordInput.value;
    const val2 = confirmPasswordInput.value;

    if(val1 === val2) {
        confirmPasswordError.style.display = "block";
        confirmPasswordError.style.background = "green";
        confirmPasswordError.innerHTML = "Passwords match"
    } else {
        confirmPasswordError.style.display = "block";
        confirmPasswordError.style.background = "red";
        confirmPasswordError.innerHTML = "Passwords do not match"
    }
    if (val2 === ""){
        confirmPasswordError.style.display = "none";
    }
}

function checkValidatedFields() {
    const passwordsMatch = passwordInput.value === confirmPasswordInput.value && confirmPasswordInput.value.length > 0;

    if (validLength && includesLowercase && includesUppercase && includesSpecialChar && includesEmailTemplate && includesUsernameTemplate && passwordsMatch) {
        registerButton.removeAttribute("disabled");
        registerButton.style.background = "green"
    } else {
        registerButton.setAttribute('disabled', 'disabled');
        registerButton.style.background = "lightgrey"
    }
}


showHidePassword.addEventListener("click", () => {
    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        showHidePassword.innerHTML = showHidePassword.innerHTML.replace("show", "hide");
    } else {
        passwordInput.type = "password";
        showHidePassword.innerHTML = showHidePassword.innerHTML.replace("hide", "show");
    }
});


document.addEventListener('DOMContentLoaded', function () {
    setTimeout(function () {
      var errorMessage = document.getElementById('error-message');
      if (errorMessage) {
        errorMessage.style.display = 'none';
      }
    }, 3000);
  });


