const sendBtn = document.querySelector('.send-btn');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const numInput = document.getElementById('phone');
const subjectInput = document.getElementById('subject');
const textInput = document.getElementById('message');

const nameIcon = document.querySelector('.name-icon');
const numIcon = document.querySelector("#num-icon");
const emailIcon = document.querySelector(".email-icon");
const textIcon = document.querySelector(".text-icon");
const subjectIcon = document.querySelector(".subject-icon");

const nameError = document.querySelector('.name-error');
const emailError = document.querySelector('.email-error');
const numError = document.querySelector('.num-error');
const subjectError = document.querySelector('.subject-error');
const textError = document.querySelector(".text-error");

let includesEmailTemplate, includesNameTemplate, includesPhoneTemplate, includesTextTemplate, includesSubjectTemplate;

function checkValidatedFields() {
    if (includesNameTemplate && includesEmailTemplate && includesPhoneTemplate && includesSubjectTemplate && includesTextTemplate) {
        sendBtn.removeAttribute("disabled");
        sendBtn.style.background = "green";
        sendBtn.style.cursor = "pointer";  // Change cursor to pointer when enabled
    } else {
        sendBtn.setAttribute("disabled", "disabled");
        sendBtn.style.background = "lightgrey";
        sendBtn.style.cursor = "not-allowed";  // Change cursor to not-allowed when disabled
    }
}

subjectInput.addEventListener("input", () => {
    let subject = subjectInput.value;
    let chars = 15;
    let left = chars - subject.length;
    subjectError.innerHTML = left + ` characters left`;

    includesSubjectTemplate = subject.length >= 15;

    if (subject.length === 0) {
        subjectError.style.display = "none";
        subjectIcon.style.display = "none";
    } else if (includesSubjectTemplate) {
        subjectError.style.display = "none";
        subjectError.innerHTML = "";
        subjectIcon.style.display = "block";
        subjectIcon.classList.remove('bx-x-circle');
        subjectIcon.classList.add('bx-check-circle');
        subjectIcon.style.color = "green";
    } else {
        subjectError.style.display = "block";
        subjectIcon.style.display = "block";
        subjectIcon.classList.remove('bx-check-circle');
        subjectIcon.classList.add('bx-x-circle');
        subjectIcon.style.color = "red";
    }

    checkValidatedFields();
});

textInput.addEventListener("input", () => {
    let text = textInput.value;
    let chars = 50;
    let left = chars - text.length;
    textError.innerHTML = left + ` characters left`;

    includesTextTemplate = text.length >= 50;

    if (text.length === 0) {
        textError.style.display = "none";
        textIcon.style.display = "none";
    } else if (includesTextTemplate) {
        textError.style.display = "none";
        textError.innerHTML = "";
        textIcon.style.display = "block";
        textIcon.classList.remove('bx-x-circle');
        textIcon.classList.add('bx-check-circle');
        textIcon.style.color = "green";
    } else {
        textError.style.display = "block";
        textIcon.style.display = "block";
        textIcon.classList.remove('bx-check-circle');
        textIcon.classList.add('bx-x-circle');
        textIcon.style.color = "red";
    }

    checkValidatedFields();
});

nameInput.addEventListener("input", () => {
    let name = nameInput.value;

    nameTemplate = /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/;
    includesNameTemplate = nameTemplate.test(name);

    if (name.length === 0){
        nameError.style.display = "none";
        nameIcon.style.display = "none"
    } else if(includesNameTemplate) {
        nameError.style.display = "none";
        nameError.innerHTML = "";
        nameIcon.style.display = "block";
        nameIcon.classList.remove('bx-x-circle');  // Remove the 'bx-x-circle' class
        nameIcon.classList.add('bx-check-circle');
        nameIcon.style.color = "green";
    } else if (!includesNameTemplate) {
        nameError.style.display = "block";
        nameError.innerHTML = "Name should only contain letters";
        nameIcon.style.display = "block";
        nameIcon.classList.remove('bx-check-circle');
        nameIcon.classList.add('bx-x-circle');  // Remove the 'bx-x-circle' class
        nameIcon.style.color = "red";
    }

    checkValidatedFields();
});

emailInput.addEventListener("input", () => {
    let email = emailInput.value;
    emailTemplate = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    includesEmailTemplate = emailTemplate.test(email)

    if (email.length === 0) {
        emailError.style.display = "none";
        emailIcon.style.display = "none";
    } else if (includesEmailTemplate) {
        emailError.style.display = "none";
        emailError.innerHTML = "";
        emailIcon.style.display = "block";
        emailIcon.classList.remove('bx-x-circle');  // Remove the 'bx-x-circle' class
        emailIcon.classList.add('bx-check-circle');
        emailIcon.style.color = "green";
    } else if (!includesEmailTemplate) {
        emailError.style.display = "block";
        emailError.innerHTML = "Invalid email";
        emailIcon.style.display = "block";
        emailIcon.classList.remove('bx-check-circle');
        emailIcon.classList.add('bx-x-circle');  // Remove the 'bx-x-circle' class
        emailIcon.style.color = "red";
    }
    checkValidatedFields();
});

numInput.addEventListener("input", () => {
    let phone = numInput.value;
    phoneTemplate = /^0\d{10}$/;
    includesPhoneTemplate = phoneTemplate.test(phone);
    let letters = /[a-zA-Z]/;

    if (phone.length === 0) {
        numError.style.display = "none";
        numIcon.style.display = "none";
    } else if (includesPhoneTemplate) {
        numError.style.display = "none";
        numError.innerHTML = "";
        numIcon.style.display = "block";
        numIcon.classList.remove('bx-x-circle');  // Remove the 'bx-x-circle' class
        numIcon.classList.add('bx-check-circle');
        numIcon.style.color = "green";
    } else if (phone.match(letters)){
        numError.style.display = "block";
        numError.innerHTML = "Phone number should not contain letters";
        numIcon.style.display = "block";
        numIcon.classList.remove('bx-check-circle');  // Remove the 'bx-check-circle' class
        numIcon.classList.add('bx-x-circle');
        numIcon.style.color = "red";
    } else {
        numError.style.display = "block";
        numError.innerHTML = "Phone number must have 11 digits";
        numIcon.style.display = "block";
        numIcon.classList.remove('bx-check-circle');  // Remove the 'bx-check-circle' class
        numIcon.classList.add('bx-x-circle');
        numIcon.style.color = "red";
    }

    checkValidatedFields();
});