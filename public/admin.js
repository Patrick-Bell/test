document.addEventListener('DOMContentLoaded', () => {
    const submitProductBtn = document.getElementById('submitProductBtn');
    const productTableBody = document.querySelector('#productTable tbody');
    const productsModal = document.getElementById('productsModal')
    const editProductsModal = document.querySelector(".edit-product-modal")
    const editProductBootstrap = new bootstrap.Modal(editProductsModal)
    const deleteProductModal = document.querySelector('.delete-modal');
    const deleteProductBootstrap = new bootstrap.Modal(deleteProductModal)
    const addProductModal = document.querySelector('.add-product-modal');
    const addProductBootstrap = new bootstrap.Modal(addProductModal)
    const openAddProductModal = document.getElementById('addProductBtn');
    const logOutBtn = document.querySelector('.logout-modal');
    const logOutModal = document.getElementById('logOutBtn')
    const logOutBootstrap = new bootstrap.Modal(logOutBtn)
    const filterBtn = document.getElementById('filter-btn');




let currentProductPage = 1
const productsPerPage = 5
let totalProducts = 0

    openAddProductModal.addEventListener('click', () => {
      addProductBootstrap.show()
    })

    logOutModal.addEventListener('click', () => {
      logOutBootstrap.show()
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
      addProductBootstrap.hide()
  
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


const editProduct = async (productId) => {
  const editText = document.querySelector('.edit-text')
  editText.innerHTML = `Edit Product <strong>${productId}</strong>`;

  try {
    const response = await axios.get(`/api/products/${productId}`);
    const productDetails = response.data;
    populateEditProductsModal(productDetails);

    document.getElementById('updateProductBtn').addEventListener('click', async () => {
      const updatedProductData = {
        title: document.getElementById('editProductTitle').value,
        image: document.getElementById('editProductImage').value,
        price: document.getElementById('editProductPrice').value,
        description: document.getElementById('editProductDescription').value,
        stock: document.getElementById('editProductStock').value,
        category: document.getElementById('editProductCategory').value,
        tag: document.getElementById('editProductTag').value
      };

      try {
        const updatedResponse = await axios.put(`/api/products/${productId}`, updatedProductData);
        console.log('Updated product:', updatedResponse.data);
        editProductBootstrap.hide();
      } catch (err) {
        console.error('Error updating product:', err);
        alert('Failed to update product. Please try again.');
      }
    });
  } catch (error) {
    console.error('Error fetching product details:', error);
    alert('Failed to fetch product details. Please try again.');
  }
};





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
      <i class="bx bxs-edit"></i>
      <i class="bx bxs-trash-alt"></i>
      </div>`
      const deleteButton = cell6.querySelector('.bxs-trash-alt');
      const editButton = cell6.querySelector('.bxs-edit')
      deleteButton.addEventListener('click', () => {
        deleteProduct(row, product.id)
      })
      editButton.addEventListener('click', () => {
        editProduct(product.id)
        editProductBootstrap.show()

      })
  };

  // Function to delete a product
const deleteProduct = async (row, productId) => {
  // Show the delete confirmation modal
  const deleteText = document.querySelector('.delete-text')
  deleteText.innerHTML = `Are you sure you want to delete product <strong>${productId}</strong>. This action cannot be <strong>CANNOT</strong> be undone.`
  deleteProductBootstrap.show();

  // Handle confirmation when delete button is clicked
  const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
  confirmDeleteBtn.addEventListener('click', async () => {
    try {
      // Send DELETE request to delete the product
      const response = await axios.delete(`/api/products/${productId}`);
      console.log('Product deleted:', response.data);

      // Remove the corresponding row from the table
      row.remove();

      // Close the modal after deletion
      deleteProductBootstrap.hide();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  });
};


const searchInput = document.getElementById('search-input')
searchInput.addEventListener('input', () => {
  currentProductPage = 1;
  fetchAndDisplayProducts()
})


    // Function to fetch and display products
    const fetchAndDisplayProducts = async () => {
      try {
        const response = await axios.get('/api/products');
        let products = response.data;
        console.log(products)
    
        const searchQuery = searchInput.value.trim().toLowerCase();
        const stockLevel = stockLevelSelect.value;
        const sortPriceOption = priceOptionSelect.value;
        const chosenCategory = categorySelect.value
        const chosenTag = tagSelect.value

// Filter products based on search query, stock level, and price option
  products = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery) || product.id.includes(searchQuery);
    const meetsStockLevel = (stockLevel === 'all') ||
    (stockLevel === 'zero' && product.stock <= 0) ||
    (stockLevel === 'low' && product.stock > 0 && product.stock < 10) ||
    (stockLevel === 'medium' && product.stock >= 10 && product.stock < 20) ||
    (stockLevel === 'good' && product.stock >= 20);
    const categoryLevel = (chosenCategory === 'all') ||
    (chosenCategory === 'olympic' && product.category === 'olympic') ||
    (chosenCategory === 'a-z' && product.category === 'alphabet') ||
    (chosenCategory === 'nhs' && product.category === 'nhs') ||
    (chosenCategory === 'king-anniversary' && product.category === 'king-anniversary') ||
    (chosenCategory === 'peter-rabbit' && product.category === 'peter-rabbit') ||
    (chosenCategory === 'collection' && product.category === 'collection')
    const tagLevel = (chosenTag === 'all') ||
    (chosenTag === 'sale' && product.tag === 'sale') ||
    (chosenTag === 'hot' && product.tag === 'hot') ||
    (chosenTag === 'new' && product.tag === 'new')

  // Convert product price to numeric value
  product.numericPrice = parseFloat(product.price);

  let matchesPriceOption = true;
  if (sortPriceOption === 'l-h') {
    matchesPriceOption = product.numericPrice >= 0; // Adjust this condition if needed
  } else if (sortPriceOption === 'h-l') {
    matchesPriceOption = product.numericPrice >= 0; // Adjust this condition if needed
  }

  return matchesSearch && meetsStockLevel && matchesPriceOption && categoryLevel && tagLevel;
});

// Sort products based on price option
if (sortPriceOption === 'l-h') {
  products.sort((a, b) => a.numericPrice - b.numericPrice); // Low to high price
} else if (sortPriceOption === 'h-l') {
  products.sort((a, b) => b.numericPrice - a.numericPrice); // High to low price
}

        // Reset current page to 1 when applying a new filter
    
        totalProducts = products.length;
    
        const startIndex = (currentProductPage - 1) * productsPerPage;
        const endIndex = Math.min(startIndex + productsPerPage, totalProducts);
        const paginatedProducts = products.slice(startIndex, endIndex);
    
        // Clear existing table rows
        productTableBody.innerHTML = '';
    
        // Populate the table with filtered products
        paginatedProducts.forEach((product) => {
          displayProduct(product);
        });
    
        updatePaginationButtons();
    
        const productPageInfo = document.getElementById('page-text');
        productPageInfo.innerHTML = `Showing products <strong>${startIndex + 1}</strong> - <strong>${endIndex}</strong> out of <strong>${totalProducts}</strong>`;
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    
    // Event listener for search input
    searchInput.addEventListener('input', fetchAndDisplayProducts);
    
    // Event listener for stock level filter
    const stockLevelSelect = document.getElementById('stock-level');
    stockLevelSelect.addEventListener('change', () => {
      // Reset current page to 1 when stock level filter changes
      currentProductPage = 1;
      fetchAndDisplayProducts();
    });

    const tagSelect = document.getElementById('tag')
tagSelect.addEventListener('change', () => {
  currentProductPage = 1
  fetchAndDisplayProducts()
})

    
    const priceOptionSelect = document.getElementById('sort-price')
    priceOptionSelect.addEventListener('change', () => {
      currentProductPage = 1
      fetchAndDisplayProducts()
    })

    const categorySelect = document.getElementById('sort-category')
    categorySelect.addEventListener('change', () => {
      currentProductPage = 1
      fetchAndDisplayProducts()
    })
    // Call the function to fetch and display products initially
    fetchAndDisplayProducts();
    



  const updatePaginationButtons = () => {
    const totalPages = Math.ceil(totalProducts / productsPerPage)
    console.log(totalPages)

    const backButton = document.getElementById('back-btn')
    const nextButton = document.getElementById('next-btn')

    backButton.disabled = currentProductPage === 1;
    nextButton.disabled = currentProductPage === totalPages
  }

  document.getElementById('back-btn').addEventListener('click', () => {
    if (currentProductPage > 1) {
      currentProductPage--;
      fetchAndDisplayProducts(); // Fetch and display products for the previous page
    }
  });
  
  document.getElementById('next-btn').addEventListener('click', () => {
    const totalPages = Math.ceil(totalProducts / productsPerPage);
    if (currentProductPage < totalPages) {
      currentProductPage++;
      fetchAndDisplayProducts(); // Fetch and display products for the next page
    }
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
      let lowStockItemsCheck = products.filter(product => product.stock < 10)
      lowStockItems.innerHTML = `${lowStockItemsCheck.length}`
    } catch(error) {
      console.log(error)
    }
  }

  findLowItemStocks()


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


})


const findTotalOrders = async () => {
  try {
    let totalOrdersFound = document.querySelector(".order-count");
    const response = await axios.get('/api/orders');
    const orders = response.data;
    totalOrdersFound.innerHTML = `${orders.length}`;
  } catch (error) {
    console.error(error);
  }
};

findTotalOrders();

const findTotalOrderRevenue = async () => {
  try {
    let totalOrderRevenueElement = document.querySelector('.order-revenue');
    let totalOrderAverage = document.querySelector('.order-average')
    const response = await axios.get('/api/orders');
    const orders = response.data;
    const totalRevenue = orders.reduce((sum, order) => {
      return sum + (order.totalPrice || 0); // Accumulate the total price of each order
    }, 0);
    const totalAverage = totalRevenue / orders.length
    totalOrderRevenueElement.innerHTML = `£${(totalRevenue / 100).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`; // Display total revenue with two decimal places
    totalOrderAverage.innerHTML = `£${(totalAverage / 100).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`
  } catch (error) {
    console.log('Error fetching total order revenue:', error);
  }
};

findTotalOrderRevenue()


const calculateSalesLast30Days = async () => {
  try {
    const currentDate = new Date();
    const startDate = new Date();
    startDate.setDate(currentDate.getDate() - 0);
    const last30DaysText = document.querySelector('.last-30-text')

    const formattedStartDate = startDate.toISOString().split('T')[0];

    const response = await axios.get(`/api/date-orders?startDate=${formattedStartDate}`);
    const orders = response.data;

    const totalSalesLast30Days = orders.reduce((sum, order) => {
      return sum + (order.totalPrice || 0);
    }, 0);

    last30DaysText.innerHTML = `£${(totalSalesLast30Days / 100).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`
    return totalSalesLast30Days.toFixed(2);

  } catch (error) {
    console.log('Error calculating sales for the last 30 days:', error);
    return null;
  }
};

calculateSalesLast30Days().then(total => {
  if (total !== null) {
    console.log(`Total sales in the last 30 days: £${total}`);
    // Handle/display the total sales amount
  } else {
    console.log('Failed to calculate total sales for the last 30 days.');
  }
});


calculateSalesLast30Days()