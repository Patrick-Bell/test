document.addEventListener('DOMContentLoaded', () => {
    const addProductForm = document.getElementById('addProductContainer');
    const submitProductBtn = document.getElementById('submitProductBtn');
    const productTableBody = document.querySelector('#productTable tbody');
    const addProductModal = document.getElementById('addProductBtn')
    const productsModal = document.getElementById('productsModal')
    const closeProductModal = document.getElementById('closeBtn')
    const editProductsModal = document.getElementById("editProductsModal")


    // Toggle visibility of the add product modal
    addProductModal.addEventListener("click", () => {
      productsModal.showModal()
    })

    closeProductModal.addEventListener("click", () => {
      productsModal.close()
      resetAddProductForm()
    })

    function generateRandomProductID() {
      const minID = 1;
      const maxID = 99999;
    
      // Generate a random ID within the specified range
      const randomID = Math.floor(Math.random() * (maxID - minID + 1)) + minID;
    
      return randomID.toString();
    }

    function resetAddProductForm() {
      document.getElementById('productTitle').value = "";
      document.getElementById('productImage').value = "";
      document.getElementById('productPrice').value = "";
      document.getElementById('productDescription').value = "";
      document.getElementById('productStock').value = "";
      document.getElementById('productCategory').value = "";
      document.getElementById('productTag').value = "";
    }
    

    // Handle form submission
    submitProductBtn.addEventListener('click', async () => {
      const productData = {
        id: generateRandomProductID(),
        title: document.getElementById('productTitle').value,
        image: document.getElementById('productImage').value,
        price: document.getElementById('productPrice').value,
        description: document.getElementById('productDescription').value,
        stock: document.getElementById('productStock').value,
        category: document.getElementById('productCategory').value,
        tag: document.getElementById('productTag').value,
      };

      resetAddProductForm()
      productsModal.close()
  
      try {
        // Send a POST request to the server to add a new product
        const response = await axios.post('/api/products', productData);
  
        // Display the newly added product in the table
        displayProduct(response.data);
        fetchAndDisplayProducts()
            findTotalProducts();
            findTotalMonies();
            findLowItemStocks()
            findNumberOfCategories();
            findOutOfStockItems()
        // Close the add product modal
      } catch (error) {
        console.error('Error adding product:', error);
      }
    });


// deleting a product
let productId;

const parentTable = document.getElementById('productTable');

parentTable.addEventListener("click", async (event) => {
  if (event.target.classList.contains('bxs-trash-alt')) {
    // Confirm deletion with the user
    const confirmed = window.confirm("Are you sure you want to delete this product?");
    if (!confirmed) {
      return; // Do nothing if the user cancels the deletion
    }

    const closestElement = event.target.closest('tr');
    productId = closestElement.dataset.productId;

    try {
      console.log('Deleting product with ID:', productId);

      // Send a DELETE request to delete the product
      await axios.delete(`/api/products/${productId}`);

      // Remove the table row from the UI after successful deletion
      closestElement.remove();
            findTotalProducts();
            findTotalMonies();
            findLowItemStocks()
            findNumberOfCategories();
            findOutOfStockItems()
      
      console.log("Product deleted successfully");
    } catch (error) {
      console.error("Error deleting product", error);
    }
  }
});

    parentTable.addEventListener('click', async (event) => {
        if (event.target.classList.contains('bxs-edit')) {
            console.log("Clicking element");
    
            // Traverse up the DOM to find the closest table row (tr)
            const closestTableRow = event.target.closest('tr');
    
            // Extract the product ID from the data-product-id attribute
            productId = closestTableRow.dataset.productId;
            console.log('Product ID:', productId);
    
            // Fetch product details using the product ID
            try {
                console.log('Fetching product details for ID:', productId);
                const response = await axios.get(`/api/products/${productId}`);
                const productDetails = response.data;
    
                // Populate the editProductsModal with productDetails
                populateEditProductsModal(productDetails);
    
                // Open the editProductsModal
                editProductsModal.showModal();
            } catch (error) {
                console.error('Error fetching product details:', error);
            }
        }
    });
    
    document.getElementById('updateProductBtn').addEventListener('click', async () => {
        // Ensure that productId is defined
        if (!productId) {
            console.error('Product ID is not defined.');
            return;
        }
    
        // Gather the updated data from the modal inputs
        const updatedProductData = {
            title: document.getElementById('editProductTitle').value,
            image: document.getElementById('editProductImage').value,
            price: document.getElementById('editProductPrice').value,
            description: document.getElementById('editProductDescription').value,
            stock: document.getElementById('editProductStock').value,
            category: document.getElementById('editProductCategory').value,
            tag: document.getElementById('editProductTag').value,
        };
    
        try {
            // Make a PUT or PATCH request to update the product in the database
            const response = await axios.put(`/api/products/${productId}`, updatedProductData);
    
            // Optionally, you can handle the response or perform additional actions
            console.log('Product updated successfully:', response.data);
            fetchAndDisplayProducts()
            findTotalProducts();
            findTotalMonies();
            findLowItemStocks()
            findNumberOfCategories();
            findOutOfStockItems()
    
            // Close the editProductsModal after updating
            editProductsModal.close();
        } catch (error) {
            console.error('Error updating product:', error);
        }
    });


// Function to populate the editProductsModal with product details
const populateEditProductsModal = (productDetails) => {
    // Assuming you have elements in your modal like productTitleInput, productImageInput, etc.
    document.getElementById('EditProductID').value = productDetails.id;
    document.getElementById('editProductTitle').value = productDetails.title;
    document.getElementById('editProductImage').value = productDetails.image;
    document.getElementById('editProductPrice').value = productDetails.price;
    document.getElementById('editProductDescription').value = productDetails.description;
    document.getElementById('editProductStock').value = productDetails.stock;
    document.getElementById('editProductCategory').value = productDetails.category;
    document.getElementById('editProductTag').value = productDetails.tag;
};

document.querySelector('.cancel-edit').addEventListener('click', () => {
    editProductsModal.close();
});

    const displayProduct = (product) => {
      const row = productTableBody.insertRow();
  
      // Create cells and set innerHTML
      const cell1 = row.insertCell(0);
      cell1.innerHTML = product.id;
      row.dataset.productId = product.id; // Add this line

  
      const cell2 = row.insertCell(1);
      cell2.innerHTML = product.title;
  
      const cell3 = row.insertCell(2);
      cell3.innerHTML = `<img class="table-image" src="${product.image}" alt="${product.title}">`;
  
      const cell4 = row.insertCell(3);
      cell4.innerHTML = `£${Number(product.price).toFixed(2)}`;
  
      const cell5 = row.insertCell(4);
      cell5.innerHTML = product.stock;
      if (product.stock >= 20) {
        cell5.classList.add("high-stock");
      } else if (product.stock >= 10 && product.stock < 20) {
        cell5.classList.add("medium-stock")
      } else if (product.stock == 0) {
        cell5.classList.add('no-stock')
      } else {
        cell5.classList.add("low-stock")
        }
  
      const cell6 = row.insertCell(5);
      cell6.innerHTML = `<div class="action-cell">
      <i class="bx bxs-edit" data-product-id="${product.id}"></i>
      <i class="bx bxs-trash-alt" data-product-id=${product.id}></i>
      </div>`
  };

    // Function to fetch and display products
    const fetchAndDisplayProducts = async () => {
      try {
        // Fetch products from the server
        const response = await axios.get('/api/products');
        const products = response.data;
  
        // Clear existing table rows
        productTableBody.innerHTML = '';
  
        // Populate the table with products
        products.forEach((product) => {
          displayProduct(product);
        });
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
  
    // Call the function to fetch and display products initially
    fetchAndDisplayProducts();
    
  });
  

  const findTotalProducts = async () => {
    try {
      let totalProductsFound = document.querySelector(".product-count");
      const response = await axios.get('/api/products');
      const products = response.data;
      totalProductsFound.innerHTML = `${products.length}`;
    } catch (error) {
      console.error(error);
    }
  };
  
  findTotalProducts();

  const findTotalMonies = async () => {
    try {
      let totalMoniesCalculate = document.querySelector(".total-monies");
      const response = await axios.get('/api/products');
      const products = response.data;
  
      // Use reduce to calculate the total sum of prices multiplied by quantities
      const totalMoney = products.reduce((sum, product) => sum + (product.price * product.stock), 0);
  
      // Convert totalMoney to a string before setting innerHTML
      totalMoniesCalculate.innerHTML = `£${totalMoney.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
    } catch (error) {
      console.error(error);
    }
  };
  
  findTotalMonies();
  
  const findLowItemStocks = async () => {
    try {
      const response = await axios.get('/api/products');
      const products = response.data
      let lowStockItems = document.querySelector(".low-stock-count")
      lowStockItemsCheck = products.filter(product => product.stock < 10)
      lowStockItems.innerHTML = `${lowStockItemsCheck.length}`
    } catch(error) {
      console.log(error)
    }
  }

  findLowItemStocks()

  const findNumberOfCategories = async () => {
    try {
      const response = await axios.get('/api/products');
      const products = response.data;
  
      // Extract unique categories from products
      const uniqueCategories = [...new Set(products.map(product => product.category))];
  
      let categoryCounter = document.querySelector(".category-count");
      categoryCounter.innerHTML = `${uniqueCategories.length}`;
    } catch (error) {
      console.log(error);
    }
  };
  
  findNumberOfCategories();

  const findOutOfStockItems = async () => {
    try {
      const response = await axios.get('/api/products')
      const products = response.data
      let outOfStockItems = document.querySelector(".out-of-stock-count")
      let findOutOfStockItems = products.filter(product => product.stock == 0)
      outOfStockItems.innerHTML = `${findOutOfStockItems.length}`
    } catch(error) {
      console.log(error)
    }
  }

  findOutOfStockItems()
  
  