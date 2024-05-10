// Defining the variables
document.addEventListener('DOMContentLoaded', renderProductsOnPage);
const tags = document.querySelector('.tags')
let products
let category


const AllProductList = document.getElementById('allItemList'); // This is the product div, all products go inside this
const coinTypeSelect = document.getElementById("coin-type");
const paginationContainer = document.querySelector('.pagination-container')
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let filteredProducts

// Function to fetch products from the server
async function fetchProducts() {
    try {
        const response = await fetch('/api/products');
        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }
        products = await response.json(); // Assign the fetched products to the higher-scoped variable
        console.log('Fetched products:', products);
        return products;
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error; // Rethrow the error to be caught by the calling function
    }
}

// Function to render products on the page
async function renderProductsOnPage() {
    try {
        // Fetch products from the server
        await fetchProducts();

        // Render products on the page
        filterProducts(category);
        renderProducts(AllProductList, products);
        checkStockProducts()
        addEventListenersToCartButtons();
        updateCartIcon();
        calculateTotal()
        addSearchEventListener();

    } catch (error) {
        console.error('Error rendering products on the page:', error);
    }
}


// Call the function to render products on the page when the DOM is loaded

function renderProducts(productList, productData, pageNumber = 1, pageSize = 15) {
    console.log('Product Data:', productData);
    const startIndex = (pageNumber - 1) * pageSize;
    let endIndex = startIndex + pageSize;
    const productsPerPage = productData.slice(startIndex, endIndex);

    // Check if the productList element exists
    if (!productList) {
        console.error('Product list element not found');
        return;
    }

    productList.innerHTML = productsPerPage.map(product => `
        <div class="product">
            <img src="${product.image}" alt="${product.title}">
            <h4 class="productTitle">${product.title}</h4>
            <h4>£${product.price}</h4>
            <div class="cart">
                <a><i class="bi bi-cart add-to-cart" data-id="${product.id}"></i></a>
                <div class="tags" style="background-color: ${getTagStyles(product.tag).backgroundColor}; color: ${getTagStyles(product.tag).color}">
                    ${product.tag}
                </div>
            </div>
        </div>`
    ).join("");

    // Pagination logic
    const totalPages = Math.ceil(productData.length / pageSize);

    if (endIndex > productData.length) {
        endIndex = productData.length;
    }

    numOfItems.innerHTML = `Showing Products <strong>${startIndex + 1} - ${endIndex}</strong> out of <strong>${products.length}</strong>`


    paginationContainer.innerHTML = '';

    // Previous page button
    const previousButton = document.createElement('button');
    previousButton.textContent = '<';
    previousButton.addEventListener("click", () => {
        if (pageNumber > 1) {
            renderProducts(productList, productData, pageNumber - 1, pageSize);
            scrollToTop()
        }
    });
    paginationContainer.appendChild(previousButton);


    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.addEventListener("click", () => {
            renderProducts(productList, productData, i, pageSize);
            scrollToTop()
        });
        if (i === pageNumber) {
            pageButton.classList.add('active'); // Highlight active page
        }
        paginationContainer.appendChild(pageButton);
    }

    // Next page button
    const nextPageButton = document.createElement('button');
    nextPageButton.textContent = '>';
    nextPageButton.addEventListener("click", () => {
        if (pageNumber < totalPages) {
            renderProducts(productList, productData, pageNumber + 1, pageSize);
            scrollToTop()
        }
    });
    paginationContainer.appendChild(nextPageButton);

    const openPage = document.createElement('input');
    openPage.placeholder = '#';
    openPage.addEventListener('input', (event) => {
    const pageNumber = parseInt(event.target.value); // Extract the page number entered by the user
    if (!isNaN(pageNumber) && pageNumber > 0 && pageNumber <= totalPages) {
        // Only render products if the entered page number is valid
        renderProducts(productList, productData, pageNumber, pageSize);
        scrollToTop();
    }
});

paginationContainer.appendChild(openPage);

    previousButton.disabled = pageNumber === 1;
    nextPageButton.disabled = pageNumber === totalPages

    addEventListenersToCartButtons();
}


const scrollToTop = () => {
    window.scrollTo({
        top: 0,
        behaviour: 'smooth'
    })
}

async function checkStockProducts() {
    try {
        const response = await fetch('/api/products');
        products = await response.json(); // Assign the fetched products to the higher-scoped variable

        products.forEach(product => {
            const isProductOutOfStock = product.stock < 1;

            // Get the "Add to Cart" button element
            const addToCartButton = document.querySelector(`[data-id="${product.id}"]`);

            if (isProductOutOfStock && addToCartButton) {
                // Disable the button
                addToCartButton.disabled = true;
                // Optionally, you can change the button text or style to indicate it's out of stock
                addToCartButton.style.background = "red"
                addToCartButton.setAttribute('disabled', 'disabled');
                addToCartButton.style.cursor = "not-allowed"
            }
        });
    } catch (error) {
        console.error('Error checking stock:', error);
    }
}


function getTagStyles(tag) {
    switch (tag.toLowerCase()) {
        case "sale":
            return { backgroundColor: "yellow", color: "black" };
        case "new":
            return { backgroundColor: "blue", color: "white" };
        case "hot":
            return { backgroundColor: "red", color: "white"};
        case "none":
            return { backgroundColor: "white", color: "white"};
        default:
            return { backgroundColor: "transparent", color: "black" }; // You can set default colors
    }
}



function addEventListenersToCartButtons() {
    const addToCartButtons = document.getElementsByClassName('add-to-cart');
    for (let i = 0; i < addToCartButtons.length; i++) {
        const addToCartButton = addToCartButtons[i];
        addToCartButton.addEventListener("click", addToCart);
    }
}

// Function to update checkout button state based on cart content
function updateCheckoutButtonState() {
    const payBtn = document.querySelector(".checkout-btn");
    const cartItems = JSON.parse(localStorage.getItem('cart')) || [];

    // Disable checkout button if cart is empty
    if (cartItems.length === 0) {
        payBtn.disabled = true;
        console.log('no items so disable button')
    } else {
        payBtn.disabled = false;
        console.log('more than 1 item so undisable buutton')
    }
}

async function addToCart(event) {
    try {
        // Fetch products from the server
        const products = await fetchProducts();

        // Find the product with the given ID
        const productId = event.target.dataset.id; // Keep it as a string
        const product = products.find((product) => product.id === productId);

        if (product) {
            const isProductOutOfStock = product.stock < 1;

            if (!isProductOutOfStock) {
                // Check if the product is already in the cart
                const existingItemIndex = cart.findIndex((item) => item.id === product.id);

                if (existingItemIndex !== -1) {
                    // If the item already exists in the cart, increment the quantity
                    cart[existingItemIndex].quantity++;
                } else {
                    // If the item is not in the cart, add a new entry with quantity 1
                    const cartItem = {
                        id: product.id,
                        title: product.title,
                        price: product.price,
                        image: product.image,
                        quantity: 1,
                    };
                    cart.push(cartItem);
                }

                renderCartItems();
                saveToLocalStorage();
                calculateTotal();
                updateCartIcon(); 
                updateCheckoutButtonState()
            } else {
                console.error('Product is out of stock');
            }
        } else {
            console.error('Product not found');
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
    }
}







// Removing an item from the cart

function removeFromCart(event) {
    const productID = event.target.dataset.id;
    console.log('Removing product with ID:', productID);

    // Check if the productID exists in the cart before filtering
    console.log('Cart before removal:', cart);

    cart = cart.filter((item) => item.id !== productID);
    console.log('Updated cart:', cart);

    saveToLocalStorage();
    renderCartItems();
    calculateTotal();
    updateCartIcon();
    updateCheckoutButtonState()
}


// Changing the quantity

function changeQuantity(event) {
    const productID = parseInt(event.target.dataset.id);
    const quantity = parseInt(event.target.value);

    if (quantity > 0) {
        const cartItem = cart.find((item) => item.id === productID);
        if (cartItem) {
            cartItem.quantity = quantity;
            saveToLocalStorage(); // Save updated cart to localStorage
            calculateTotal(); // Recalculate total based on updated quantities
            updateCartIcon(); // Update cart icon or UI to reflect changes
            updateCheckoutButtonState()
        }
    }
}


// Saving to local storage so it saves after refreshing

async function saveToLocalStorage() {
    try {
        localStorage.setItem("cart", JSON.stringify(cart));
        console.log("Cart saved to local storage:", cart);
    } catch (error) {
        console.error("Error saving cart to local storage:", error);
    }
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
                    disabled
                />
            </div>
            <h2 class="cart-item-price">£${item.price}</h2>
            <button data-id="${item.id}" class="remove-from-cart">X</button>
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
        console.log(input)
    });

    calculateTotal();
    updateCartIconOnCartChange();
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



// search and filtering system 

let numOfItems = document.querySelector(".items-found");
let lengthItems;


// Function to add event listener for search input
function addSearchEventListener() {
    const searchInput = document.querySelector('.product-search');
    
    if (searchInput) {
        searchInput.addEventListener('input', function (event) {
            const searchText = event.target.value.trim()
            checkStockProducts()
            filterProducts(searchText);
        });
    }
}

function filterProducts(searchText) {
    const filteredProducts = products.filter(product => {
        return product.title.toLowerCase().includes(searchText);
    });

    lengthItems = filteredProducts.length;
    numOfItems.innerHTML = `Items Found: <strong>${lengthItems}</strong>`;

    // Render the filtered products
    renderProducts(AllProductList, filteredProducts);
}


function filterCategory(category) {
    let filteredProducts;

    if (category === "all") {
        filteredProducts = products.slice().sort((a, b) => b.id - a.id)
    } else if (category === "olympic") {
        filteredProducts = products.filter(product => product.category === "olympic");
    } else if (category === "alphabet") {
        filteredProducts = products.filter(product => product.category === "alphabet");
    } else if (category === "collection") {
        filteredProducts = products.filter(product => product.category === "collection");
    } else if (category === "price") {
        filteredProducts = products.slice().sort((a, b) => a.price - b.price);
    } else if (category === "sale") {
        filteredProducts = products.filter(product => product.tag === "sale")
    } else if (category === "peter-rabbit") {
        filteredProducts = products.filter(product => product.category === "peter-rabbit")
    } else if (category === "nhs") {
        filteredProducts = products.filter(product => product.category === "nhs")
    } else if (category === "king-anniversary") {
        filteredProducts = products.filter(product => product.category === "king-anniversary")
    } else if (category === "price2") {
        filteredProducts = products.slice().sort((a, b) => b.price - a.price)
    }

    lengthItems = filteredProducts.length;
    numOfItems.innerHTML = `Items Found: <strong>${lengthItems}</strong>`;
    // Render the filtered products
    checkStockProducts()
    renderProducts(AllProductList, filteredProducts);
}


coinTypeSelect.addEventListener("change", () => {
    const selectedCategory = coinTypeSelect.value;
    const filteredProducts = filterCategory(selectedCategory);
    renderProducts(AllProductList, filteredProducts);
});
