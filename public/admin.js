const addProductBtn = document.querySelector(".add-product");
const addProductContainer = document.querySelector(".add-product-container");
const submitProductBtn = document.querySelector(".submit-product");
const closeBtns = document.querySelector(".close-btns");
const saveEditBtn = document.querySelector(".confirm-edit");
const cancelEditBtn = document.querySelector(".cancel-edit");
const editedProductTitleInput = document.getElementById("editProductTitle");
const productTable = document.querySelector("#product-table");
let products = JSON.parse(localStorage.getItem('products')) || [];
let editedProduct = null;

class Product {
    constructor(id, title, price, description, image, stock) {
        this.id = id;
        this.title = title;
        this.price = price;
        this.description = description;
        this.image = image;
        this.stock = stock;
    }
}

function generateUniqueID() {
    let newID;
    do {
        newID = Math.floor(100 + Math.random() * 900); // Generates a random 3-digit number
    } while (products.some(product => product.id === newID));

    return newID;
}

function addProduct() {
    const productID = generateUniqueID();
    const productTitle = document.getElementById("productTitle").value;
    const productPrice = document.getElementById("productPrice").value;
    const productDescription = document.getElementById("productDescription").value;
    const productImage = document.getElementById("productImage").value;
    const productStock = document.getElementById("productStock").value;

    addProductDynamically(productID, productTitle, productPrice, productDescription, productImage, productStock);

    productTitle.value = '';
    productPrice.value = '';
    productDescription.value = '';
    productImage.value = '';
    productStock.value = '';
}

function addProductDynamically(id, title, price, description, image, stock) {
    const newProduct = new Product(id, title, price, description, image, stock);
    products.push(newProduct);
    localStorage.setItem('products', JSON.stringify(products));
    renderTable();
}

function deleteProduct(event) {
    const target = event.target;

    if (target.classList.contains('bxs-trash-alt')) {
        const productId = parseInt(target.dataset.id);
        const productIndex = products.findIndex(product => product.id === productId);

        if (productIndex !== -1) {
            const deletedProduct = products.splice(productIndex, 1)[0];
            localStorage.setItem("products", JSON.stringify(products));
            renderTable();
        } else {
            console.log("Product not found for deletion");
        }
    }
}

function openEditForm(productId) {
    editedProduct = products.find(product => product.id === productId);

    const editProductContainer = document.querySelector(".edit-product-container");

    if (editedProduct && editProductContainer) {
        console.log("Opening edit form for product ID:", productId);
        console.log("Editing product:", editedProduct);

        // Display the edit form
        editProductContainer.style.display = "block";

        // Set the values in the edit form
        editedProductTitleInput.value = editedProduct.title;
        document.getElementById("editProductPrice").value = editedProduct.price;
        document.getElementById("editProductDescription").value = editedProduct.description;
        document.getElementById("editProductImage").value = editedProduct.image;
        document.getElementById("editProductStock").value = editedProduct.stock;

    } else {
        console.error("Product or editProductContainer not found for editing");
    }
}

function saveEditedProduct() {
    console.log("Save edited product function");

    // Ensure that the required elements are available in the DOM
    const editedProductPriceInput = document.getElementById("editProductPrice");
    const editedProductDescriptionInput = document.getElementById("editProductDescription");
    const editedProductImageInput = document.getElementById("editProductImage");
    const editedProductStockInput = document.getElementById("editProductStock");

    if (!editedProduct) {
        console.error("No edited product found");
        return;
    }

    // Log the values of the form inputs
    console.log("Product title:", editedProductTitleInput.value);
    console.log("Product price:", editedProductPriceInput.value);
    console.log("Product description:", editedProductDescriptionInput.value);
    console.log("Product image:", editedProductImageInput.value);
    console.log("Product stock:", editedProductStockInput.value);

    // Update the product details based on the form inputs
    editedProduct.title = editedProductTitleInput.value;
    editedProduct.price = editedProductPriceInput.value;
    editedProduct.description = editedProductDescriptionInput.value;
    editedProduct.image = editedProductImageInput.value;
    editedProduct.stock = editedProductStockInput.value;

    localStorage.setItem("products", JSON.stringify(products));
    renderTable();

    // Close the edit form
    const editProductContainer = document.querySelector(".edit-product-container");
    if (editProductContainer) {
        editProductContainer.style.display = "none";
    } else {
        console.error("editProductContainer not found");
    }

    productTable.style.visibility = "visible";

    editedProduct = null;
}

function cancelEdit() {
    const editProductContainer = document.querySelector(".edit-product-container");
    if (editProductContainer) {
        editProductContainer.style.display = "none";
    } else {
        console.error("editProductContainer not found");
    }

    productTable.style.visibility = "visible";

    editedProduct = null;
}

const deleteProductBtnContainer = document.querySelector("#product-table tbody");
deleteProductBtnContainer.addEventListener("click", deleteProduct);

const tbody = document.querySelector("#product-table tbody");

function renderTable() {
    tbody.innerHTML = '';

    products.forEach(product => {
        const row = tbody.insertRow();
        const cell1 = row.insertCell(0);
        const cell2 = row.insertCell(1);
        const cell3 = row.insertCell(2);
        const cell4 = row.insertCell(3);
        const cell5 = row.insertCell(4);
        const cell6 = row.insertCell(5);

        cell1.textContent = product.id;
        cell2.textContent = product.title;
        cell3.textContent = product.price;
        cell4.innerHTML = `<img class="table-image" src="${product.image}" alt="Product Image">`;
        cell5.textContent = product.stock;
        // Check if stock is under 10 and apply a class for highlighting
        if (parseInt(product.stock) < 10) {
            cell5.classList.add('low-stock');
        } else if (parseInt(product.stock) >= 10 && parseInt(product.stock) < 15) {
            cell5.classList.add('medium-stock');
        } else if (parseInt(product.stock) >= 15){
            cell5.classList.add('high-stock');
        } else {
            cell5.classList.add('td')
        }

        cell6.innerHTML = `<div class="action-cell"> <i class='bx bxs-trash-alt' data-id="${product.id}"></i> <i class='bx bxs-edit' data-id="${product.id}"></i> </div>`;

    });
}

renderTable();

// Event delegation for edit buttons
// Event delegation for edit buttons
document.addEventListener("click", (event) => {
    const target = event.target;

    if (target.classList.contains("bxs-edit")) {
        console.log("Edit button clicked");
        const productId = parseInt(target.dataset.id);
        console.log("Product ID:", productId);
        openEditForm(productId);

        // Scroll to the top of the page after a short delay
        setTimeout(() => {
            console.log("scrolling to top...")
            window.scrollTo({
                top: 0,
            });
        }, 100); // You can adjust the delay as needed
    }
});


// Event listeners for save and cancel edit buttons
if (saveEditBtn) {
    saveEditBtn.addEventListener("click", saveEditedProduct);
}

if (cancelEditBtn) {
    cancelEditBtn.addEventListener("click", cancelEdit);
}

// Event listener for add product button
addProductBtn.addEventListener("click", () => {
    addProductContainer.style.display = "block";
    productTable.style.visibility = "hidden";
});

// Event listener for submit product button
submitProductBtn.addEventListener("click", () => {
    addProduct();
    console.log("Adding Product");
    addProductContainer.style.display = "none";
    productTable.style.visibility = "visible";
});

// Event listener for close buttons
closeBtns.addEventListener("click", () => {
    addProductContainer.style.display = "none";
    productTable.style.visibility = "visible";
});
