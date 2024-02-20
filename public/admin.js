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
      row.innerHTML = `
        <td>${product.id}</td>
        <td>${product.title}</td>
        <td>${product.image}</td>
        <td>${product.price}</td>
        <td>${product.description}</td>
        <td>${product.stock}</td>
      `;
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
  