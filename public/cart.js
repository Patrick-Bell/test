document.addEventListener('DOMContentLoaded', function () {
    const stockToast = document.querySelector('.stock-modal')
    const stockBootstrap = new bootstrap.Modal(stockToast)
    const stockBody = document.querySelector('.modal-body')
    const payBtn = document.querySelector(".checkout-btn");

    if (payBtn) {
        payBtn.addEventListener("click", async (event) => {
            payBtn.innerHTML = "Checking out...";
            event.preventDefault();

            const cartItems = JSON.parse(localStorage.getItem('cart'));

            // Array to hold details of products with insufficient stock
            const insufficientStockItems = [];

            try {
                // Check stock for each item in the cart
                for (const item of cartItems) {
                    const response = await fetch(`/api/products/${item.id}`);
                    const product = await response.json();

                    if (!product || product.stock < item.quantity) {
                        insufficientStockItems.push({
                            title: item.title,
                            requestedQuantity: item.quantity,
                            availableStock: product ? product.stock : 0
                        });
                    }
                }

                if (insufficientStockItems.length > 0) {
                    stockBootstrap.show()
                    stockBody.innerHTML = `<strong>${insufficientStockItems.length}</strong> item(s) require attention before proceeding to checkout.<br><br>`
                    stockBody.innerHTML += insufficientStockItems.map(item => {
                        const remainingStock = parseInt(item.requestedQuantity - item.availableStock);
                        return `
                            <div>
                                <strong>${item.title}</strong><br>
                                Requested: <strong>${item.requestedQuantity}</strong><br>
                                Available: <strong>${item.availableStock}</strong><br>
                                Please remove <strong>${remainingStock}</strong> items
                            </div>
                        `;
                    }).join('<br>');
                    

                    stockBody.innerHTML += `<br>Please remove the items from your cart. Feel free to contact us to see if we will be getting more stock in these coins.`

                } else {
                    // All stock checks passed, proceed to checkout
                    const response = await fetch("/stripe-checkout", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            items: cartItems
                        }),
                    });
                    
                    const data = await response.json();
                    if (data.url) {
                        window.location.href = data.url;
                    } else {
                        console.error("Invalid URL received from the server:", data.url);
                    }
                }
            } catch (error) {
                console.error("Error checking stock:", error);
            } finally {
                // Reset button text after processing
                payBtn.innerHTML = "Checkout";
            }
        });
    } else {
        console.error("Checkout button not found");
    }
});
