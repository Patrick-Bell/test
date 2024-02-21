document.addEventListener('DOMContentLoaded', () => {
    const addProductForm = document.getElementById('addProductContainer');
    const submitProductBtn = document.getElementById('submitProductBtn');
    const productTableBody = document.querySelector('#productTable tbody');
  
    // Toggle visibility of the add product modal
    document.getElementById('addProductBtn').addEventListener('click', () => {
      addProductForm.style.display = 'block';
    });
  
    // Close the add product modal
    document.getElementById('closeBtn').addEventListener('click', () => {
      addProductForm.style.display = 'none';
    });
  
    // Handle form submission
    submitProductBtn.addEventListener('click', async () => {
      const productData = {
        id: document.getElementById('productID').value,
        title: document.getElementById('productTitle').value,
        image: document.getElementById('productImage').value,
        price: document.getElementById('productPrice').value,
        description: document.getElementById('productDescription').value,
        stock: document.getElementById('productStock').value,
      };
  
      try {
        // Send a POST request to the server to add a new product
        const response = await axios.post('/api/products', productData);
  
        // Display the newly added product in the table
        displayProduct(response.data);
  
        // Close the add product modal
        addProductForm.style.display = 'none';
      } catch (error) {
        console.error('Error adding product:', error);
      }
    });
  
    const displayProduct = (product) => {
      const row = productTableBody.insertRow();
  
      // Create cells and set innerHTML
      const cell1 = row.insertCell(0);
      cell1.innerHTML = product.id;
  
      const cell2 = row.insertCell(1);
      cell2.innerHTML = product.title;
  
      const cell3 = row.insertCell(2);
      cell3.innerHTML = `<img  class="table-image" src="${product.image}" alt="${product.title}">`;
  
      const cell4 = row.insertCell(3);
      cell4.innerHTML = `£${Number(product.price).toFixed(2)}`;
  
      const cell5 = row.insertCell(4);
      cell5.innerHTML = product.stock;
  
      const cell6 = row.insertCell(5);
      cell6.innerHTML = `<button>Edit</button>`
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
  