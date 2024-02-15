let menu = document.getElementById("menu-icon");
let navbar = document.querySelector(".navbar");

menu.addEventListener("click", () => {
    navbar.classList.toggle("active");

    // Get the icon element within the menu
    let iconElement = document.querySelector('header i');

    if (navbar.classList.contains("active")) {
        // If the navbar has the "active" class, change the icon to close (x)
        iconElement.className = 'bi bi-x-circle';
    } else {
        // If the navbar does not have the "active" class, change the icon to the original one
        iconElement.className = 'bi bi-list'; 
    }
});



const notifications = document.querySelector(".notifications");
const toastDetails = {
    timer: 5000,
    added: {
        icon: "bi-check-circle-fill",
        text: "Item added to cart"
    },
    removed: {
        icon: "bi-x-circle-fill",
        text: "Item removed from cart"
    },
};

const removeToast = (toast) => {
    toast.classList.add("hide");
    if (toast.timeoutId) clearTimeout(toast.timeoutId);
};

const createToast = (type) => {
    const { icon, text } = toastDetails[type];
    const toast = document.createElement("li");
    toast.className = `toast ${type}`;
    toast.innerHTML = `<div class="column">
                        <i class="bi ${icon}"></i>
                        <span>${text}</span>
                    </div>`;
    notifications.appendChild(toast);
    toast.timeoutId = setTimeout(() => {
        removeToast(toast);
    }, toastDetails.timer);
};

document.body.addEventListener("click", function (event) {
    console.log("Clicked element:", event.target);

    // Check if the clicked element or its parent has the class "bi-cart"
    const cartBtn = event.target.closest(".bi-cart");
    if (cartBtn) {
        console.log("Added to cart clicked");
        createToast("added");
    }

    // Check if the clicked element or its parent has the class "remove-from-cart"
    const removeBtn = event.target.closest(".remove-from-cart");
    if (removeBtn) {
        console.log("Remove from cart clicked");
        createToast("removed");
    }
});

