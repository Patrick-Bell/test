// Defining the variables

const AllProductList = document.getElementById('allItemList'); // This is the product div, all products go inside this
const coinTypeSelect = document.getElementById("coin-type");
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let products = JSON.parse(localStorage.getItem('products')) || [];


// Array of products

// Rendering all the products

function renderProducts(productList, productData) {
    productList.innerHTML = productData.map(product => `
        <div class="product">
            <img src="${product.image}" alt="${product.title}">
            <h4>${product.title}</h4>
            <h5>${product.price}</h5>
            <div class="cart">
                <a><i class="bi bi-cart add-to-cart" data-id="${product.id}"></i></a>
            </div>
        </div>`
    ).join("");

    // Add event listeners to the newly rendered "Add to Cart" buttons
    addEventListenersToCartButtons();
    
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

// Removing an item from the cart

function removeFromCart(event) {
    const productID = parseInt(event.target.dataset.id);
    cart = cart.filter((item) => item.id !== productID);
    saveToLocalStorage();
    renderCartItems();
    calculateTotal();
    updateCartIcon();
}

// Changing the quantity

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

// Saving to local storage so it saves after refreshing

function saveToLocalStorage() {
    localStorage.setItem("cart", JSON.stringify(cart));
}

function renderCartItems() {
    const cartItemsElement = document.getElementById('cartItems');
    if (!cartItemsElement) {
        console.error("cartItemsElement not found");
        return;
    }

    // Cart page layout

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
            <button data-id="${item.id}" class="remove-from-cart"></button>
        </div>`
    ).join("");

    // Removing item from the cart

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

// Calculating the total

function calculateTotal() {
    const cartTotalElement = document.getElementById('cartTotal');
    if (!cartTotalElement) {
        console.error("cartTotalElement not found");
        return;
    }

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    cartTotalElement.textContent = `Total: £${total.toFixed(2)}`;
}

// Updating the number on the cart that shows the quantity

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
    updateCartIcon();
}


let numOfItems = document.querySelector(".items-found");
let lengthItems;

// Filtering system via the select/options 

function filterProducts(category) {
    let filteredProducts;

    if (category === "all") {
        filteredProducts = products;
    } else if (category === "science") {
        filteredProducts = products.filter(product => product.id >= 47 && product.id <= 52);
    } else if (category === "olympic") {
        filteredProducts = products.filter(product => product.id >= 1 && product.id <= 31);
    } else if (category === "potter") {
        filteredProducts = products.filter(product => product.id >= 32 && product.id <= 46);
    } else if (category === "alphabet") {
        filteredProducts = products.filter(product => product.id >= 53 && product.id <= 78);
    } else if (category === "collection") {
        filteredProducts = products.filter(product => product.id == 20 || product.id == 79);
    }

    // Displaying the number of items

    lengthItems = filteredProducts.length;
    numOfItems.innerHTML = `Items Found: <strong>${lengthItems}</strong>`;

    // Render the filtered products
    renderProducts(AllProductList, filteredProducts);
}

coinTypeSelect.addEventListener("change", () => {
    const selectedCategory = coinTypeSelect.value;
    const filteredProducts = filterProducts(selectedCategory);
    renderProducts(AllProductList, filteredProducts);
});

renderProducts(AllProductList, products);



// search function

let productSearch = document.querySelector(".product-search");
let submitBtn = document.querySelector(".product-submit");
let itemsFound = document.querySelector(".items-found");

function handleSearch() {
    let searchInput = productSearch.value.toLowerCase();
    let foundProducts = products.filter(product => product.title.toLowerCase().includes(searchInput));

    if (foundProducts.length > 0) {
        itemsFound.innerHTML = `Items Found: <strong>${foundProducts.length}</strong>`;
        renderProducts(AllProductList, foundProducts);
    } else if (searchInput) {
        itemsFound.innerHTML = "Items not found. Please try again.";
        AllProductList.innerHTML = "";
    } else {
        renderProducts(AllProductList, products);
    }
}

// As soon as there is a change in input, it will handle the search (search for relevant items)

productSearch.addEventListener("input", handleSearch);

