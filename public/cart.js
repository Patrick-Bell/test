document.addEventListener('DOMContentLoaded', function () {
    const payBtn = document.querySelector(".checkout-btn");

    if (payBtn) {
        payBtn.addEventListener("click", (event) => {
            payBtn.innerHTML = "Checking out..."
            event.preventDefault();

            fetch("/stripe-checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    items: JSON.parse(localStorage.getItem('cart'))
                }),
            })
                .then((res) => res.json())
                .then((data) => {
                    if (data.url) {
                        window.location.href = data.url;
                    } else {
                        console.error("Invalid URL received from the server:", data.url);
                    }
                })
                .catch((err) => console.error(err));
        });
    } else {
        console.error("Checkout button not found");
    }
});
