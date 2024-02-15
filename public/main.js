document.addEventListener('DOMContentLoaded', function() {
        const productList = document.getElementById('productList');
        const cartItemsElement = document.getElementById('cartItems');
        const cartTotalElement = document.getElementById('cartTotal');
    
    
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
        function renderProducts() {
            const filteredProducts = products.filter(product => product.id >= 1 && product.id <= 3);
        
            productList.innerHTML = filteredProducts.map(
                (product) => `
                <div class="product">
                   <img src="${product.image}" alt="${product.title}">
                   <h4>${product.title}</h4>
                   <h5 class="old-price">Was: £7.99<h5>Now: ${product.price}</h5>
                   <div class="cart">
                       <a><i class="bi bi-cart add-to-cart" data-id="${product.id}"></i></a>
                   </div>
               </div>`
            ).join("");
    
            addEventListenersToCartButtons()
            }

            function addEventListenersToCartButtons() {
                const addToCartButtons = document.getElementsByClassName('add-to-cart');
                for (let i = 0; i < addToCartButtons.length; i++) {
                    const addToCartButton = addToCartButtons[i];
                    addToCartButton.addEventListener("click", addToCart);
                }
            }

    
        function addToCart(event) {
            const productID = parseInt(event.target.dataset.id);
            const product = products.find((product) => product.id === productID);
    
            if (product) {
                const existingItem = cart.find((item) => item.id === productID);
    
                if (existingItem) {
                    existingItem.quantity++;
                } else {
                    const cartItem = {
                        id: product.id,
                        title: product.title,
                        price: product.price,
                        image: product.image,
                        quantity: 1,
                    };
                    cart.push(cartItem);
                }
                updateCartIcon();
                renderCartItems();
                saveToLocalStorage();
                calculateTotal();
            }
        }
    
        function removeFromCart(event) {
            const productID = parseInt(event.target.dataset.id);
            cart = cart.filter((item) => item.id !== productID);
            saveToLocalStorage();
            renderCartItems();
            calculateTotal();
            updateCartIcon();
        }
    
        function changeQuantity(event) {
            const productID = parseInt(event.target.dataset.id);
            const quantity = parseInt(event.target.value);
    
            if (quantity > 0) {
                const cartItem = cart.find((item) => item.id === productID);
                if (cartItem) {
                    cartItem.quantity = quantity;
                    saveToLocalStorage();
                    calculateTotal();
                    updateCartIcon();
                }
            }
        }
    
        function saveToLocalStorage() {
            localStorage.setItem("cart", JSON.stringify(cart));
        }
    
        function renderCartItems() {
            const cartItemsElement = document.getElementById('cartItems');
            if (!cartItemsElement) {
                console.error("cartItemsElement not found");
                return;
            }
        
            cartItemsElement.innerHTML = cart.map(
                (item) => `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.title}">
                    <div class="cart-item-info">
                        <h2 class="cart-item-title">${item.title}</h2>
                        <input 
                            class="cart-item-quantity"
                            type="number" 
                            min="1" 
                            value="${item.quantity}" 
                            data-id="${item.id}" 
                        />
                    </div>
                    <h2 class="cart-item-price">£${item.price}</h2>
                    <button class="remove-from-cart" data-id="${item.id}">X</button>
                </div>`
            ).join("");
        
            const removeButtons = document.getElementsByClassName('remove-from-cart');
            for (let i = 0; i < removeButtons.length; i++) {
                const removeButton = removeButtons[i];
                removeButton.addEventListener("click", removeFromCart);
            }
        
            const quantityInputs = document.querySelectorAll(".cart-item-quantity");
            quantityInputs.forEach((input) => {
                input.addEventListener("change", changeQuantity);
            });
        }
        
        function calculateTotal() {
            const cartTotalElement = document.getElementById('cartTotal');
            if (!cartTotalElement) {
                console.error("cartTotalElement not found");
                return;
            }
        
            const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
            cartTotalElement.textContent = `Total: £${total.toFixed(2)}`;
        }
    
        function updateCartIcon() {
            const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
            const cartIcon = document.getElementById("cart-icon");
            cartIcon.setAttribute("data-quantity", totalQuantity);
        }
    
        function updateCartIconOnCartChange() {
            updateCartIcon();
        }
    
        function clearCart() {
            cart = [];
            saveToLocalStorage();
            updateCartIcon;
        }
    
        window.addEventListener("storage", updateCartIconOnCartChange);
    
        if (window.location.pathname.includes("cart.html")) {
            renderCartItems();
            calculateTotal();
        } else if (window.location.pathname.includes("success.html")){
            clearCart();
        } else {
            renderProducts();
        }
    
        updateCartIcon();



        let valueDisplays = document.querySelectorAll(".about-number");
        let interval = 10000;
        
        valueDisplays.forEach(valueDisplay => {
            let startValue = 0;
            let endValueString = valueDisplay.getAttribute("data-val");
        
            // Parse the numeric part of the string using parseFloat
            let endValue = parseFloat(endValueString);
            console.log(endValue);
        
            let duration = Math.floor(interval / endValue);
            let counter = setInterval(function() {
                startValue += 1;
                valueDisplay.textContent = startValue + ' +';
                if (startValue == endValue) {
                    clearInterval(counter);
                }
            }, duration);
        });
        
    
let nameError = document.querySelector(".name-err-msg");
let emailError = document.querySelector(".email-err-msg");
let numberError = document.querySelector(".num-err-msg");
let messageError = document.querySelector(".msg-err-msg");
let submitError = document.querySelector("submit-err");

let nameBorder = document.querySelector("#name-border")

let nameInput = document.getElementById("name")
let numberInput = document.getElementById("number")
let emailInput = document.getElementById("email")
let messageInput = document.getElementById("message")

function validateName() {

   const name = nameInput.value.trim();
   console.log("validating name")
   console.log(name)

   if (name.length == 0) {
    nameError.style.display = "block";
    nameError.innerHTML = "Please enter your name";
    return false

   } else {
    nameError.style.display = "none";
    nameError.innerHTML = "";
    nameBorder.style.border = "green"
    return true
   }

}

function validateNumber() {
    const phone = numberInput.value.trim();
    console.log("validating nuimber")
   console.log(phone)
  
    if (phone.length == 0) {
      numberError.style.display = "block"
      numberError.innerHTML = 'Please enter your phone number'
      return false;
    }

    if (phone.length !== 11) {
      numberError.style.display = "block"
      numberError.innerHTML = 'Phone number should be 11 digits'
      return false;
    }
  
    if (!phone.match(/^[0-9]{11}$/)) {
      numberError.style.display = "block"
      numberError.innerHTML = 'Please only enter digits'
      return false;
 }
    else {
        numberError.style.display = "none";
        numberError.innerHTML = "";
        return true;
    }
    
  }

  function validateEmail() {
    const email = emailInput.value;
  
    if (email.length == 0) {
      emailError.innerHTML = 'Please enter your email'
      return false;
    }
  
    if (!email.match(/^[A-Za-z\._\-[0-9]*[@][A-Za-z]*[\.][a-z]{2,4}$/)) {
      emailError.innerHTML = 'Email invalid'
      return false;
    }
  
    emailError.innerHTML = '<i class="fa-solid fa-circle-check" style="color: #0ba300;"></i>'
    return true;
  }


  function validateMessage() {
    const message = messageInput.value;
    const required = 50;
    const left = required - message.length;
  
    if (left > 0) {
      messageError.innerHTML = left + ' more characters required';
      return false;
    }
  
    messageError.innerHTML = '<i class="fa-solid fa-circle-check" style="color: #0ba300;"></i>'
    return true;
  }

  function validateForm() {
    if (!validateName() || !validateNumber() || !validateEmail() || !validateMessage()) {
      submitError.style.display = 'block';
      submitError.innerHTML = 'Please fill out the contact form correctly';
      setTimeout(function () {
        submitError.style.display = 'none';
      }, 3000);
      return false;
    }
  }



  let countDownDate = new Date("Dec 25, 2024 00:00:00").getTime();

let x = setInterval(function(){
    let now = new Date().getTime();
    let distance = countDownDate - now;

    let days = Math.floor(distance / (1000 * 60 * 60 * 24));
    let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
    let seconds = Math.floor((distance % (1000 * 60) / 1000));

    document.getElementById("days").innerHTML = days.toString().padStart(2, '0') + " :";
    document.getElementById("hours").innerHTML = hours.toString().padStart(2, '0') + " :";;
    document.getElementById("minutes").innerHTML = minutes.toString().padStart(2, '0') + " :";;
    document.getElementById("seconds").innerHTML = seconds.toString().padStart(2, '0');

    if(distance < 0){
        clearInterval(x);
        document.getElementById("days").innerHTML = "00";
        document.getElementById("hours").innerHTML = "00";
        document.getElementById("minutes").innerHTML = "00";
        document.getElementById("seconds").innerHTML = "00";
    }

},1000)


  
const newSwiper = new Swiper('.swiper', {
    // Optional parameters
    direction: 'horizontal',
    loop: true,
    autoplay: {
        delay: 3000, 
        disableOnInteraction: false, 
      },
  
    // If we need pagination
    pagination: {
      el: '.swiper-pagination',
    },
    // And if we need scrollbar
    scrollbar: {
      el: '.swiper-scrollbar',
    },
  });

});