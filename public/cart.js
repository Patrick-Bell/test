document.addEventListener('DOMContentLoaded', function () {
    const stockToast = document.querySelector('.stock-modal');
    const stockBootstrap = new bootstrap.Modal(stockToast);
    const stockBody = document.querySelector('.modal-body');
    const payBtn = document.querySelector(".checkout-btn");

    updateCheckoutButtonState()

    // Retrieve cart items from localStorage
    const cartItems = JSON.parse(localStorage.getItem('cart')) || [];


    // Add event listener to checkout button if it exists
    if (payBtn) {
        payBtn.addEventListener("click", async (event) => {
            try {
                event.preventDefault();
                payBtn.innerHTML = "Checking out...";
                payBtn.disabled = true; // Disable the button during processing

                // Array to hold details of products with insufficient stock
                const insufficientStockItems = [];

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
                    // Show modal with stock issue details
                    stockBootstrap.show();
                    stockBody.innerHTML = `<strong>${insufficientStockItems.length}</strong> item(s) require attention before proceeding to checkout.<br><br>`;
                    stockBody.innerHTML += insufficientStockItems.map(item => {
                        const remainingStock = Math.max(0, item.requestedQuantity - item.availableStock);
                        return `
                            <div>
                                <strong>${item.title}</strong><br>
                                Requested: <strong>${item.requestedQuantity}</strong><br>
                                Available: <strong>${item.availableStock}</strong><br>
                                Please remove <strong>${remainingStock}</strong> items
                            </div>
                        `;
                    }).join('<br>');

                    stockBody.innerHTML += `<br>Please remove the items from your cart or adjust quantities.`;
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
                // Reset button text and enable button after processing
                payBtn.innerHTML = "Checkout";
                payBtn.disabled = false;
            }
        });
    } else {
        console.error("Checkout button not found");
    }
});
