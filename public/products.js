// Defining the variables
document.addEventListener('DOMContentLoaded', renderProductsOnPage);


const AllProductList = document.getElementById('allItemList'); // This is the product div, all products go inside this
const coinTypeSelect = document.getElementById("coin-type");
let cart = JSON.parse(localStorage.getItem('cart')) || [];

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
        renderProducts(AllProductList, products);
        addEventListenersToCartButtons();
    } catch (error) {
        console.error('Error rendering products on the page:', error);
    }
}


// Call the function to render products on the page when the DOM is loaded

function renderProducts(productList, productData) {
    console.log('Product Data:', productData);

    // Check if the productList element exists
    if (!productList) {
        console.error('Product list element not found');
        return;
    }

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
        addToCartButton.addEventListener("click", (event) => addToCart(event, [...products])); // Pass a copy of the products array
    }
}

async function addToCart(event) {
    try {
      // Fetch products from the server
      const products = await fetchProducts();
  
      // Find the product with the given ID
          const productId = parseInt(event.target.dataset.id);

      const product = products.find((product) => product.id === productId);
  
      if (product) {
        const existingItem = cart.find((item) => item.id === product.id);
  
        if (existingItem) {
          // If the item already exists in the cart, increment the quantity
          existingItem.quantity++;
        } else {
          // If the item is not in the cart, add a new entry
          const cartItem = {
            id: product.id,
            title: product.title,
            price: product.price,
            image: product.image,
            quantity: 1,
          };
          cart.push(cartItem);
        }
  
        // You can update the UI or perform other actions here
        console.log('Cart after adding:', cart);
      } else {
        console.error('Product not found');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  }
  





// Removing an item from the cart

function removeFromCart(event) {
    const productID = parseInt(event.target.dataset.id);
    console.log('Removing product with ID:', productID);

    // Check if the productID exists in the cart before filtering
    console.log('Cart before removal:', cart);

    cart = cart.filter((item) => item.id !== productID);
    console.log('Updated cart:', cart);

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
    console.log(localStorage.getItem('cart'))
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
            <button data-id="${item.id}" class="remove-from-cart">Remove</button>
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
