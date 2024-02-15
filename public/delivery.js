document.addEventListener('DOMContentLoaded', function () {
    const tabItems = document.querySelectorAll('.tab-item');
    const tabContentItems = document.querySelectorAll('.tab-content-item');

    function selectItem(e) {
        console.log("selectItem function executed");
        removeBorder();
        removeShow();
    
        const color = this.getAttribute('data-color');
        
        // Set styles for the active tab
        this.style.borderColor = color;
        this.style.color = color;
    
        // Set styles for the inactive tabs
        tabItems.forEach(item => {
            if (item !== this) {
                item.style.borderColor = 'lightgray';
                item.style.color = 'lightgray';
                item.querySelector('i').style.color = 'lightgray'; 
                item.querySelector('p').style.color = 'lightgray';
            } else{
                item.style.borderColor = 'black';
                item.style.color = 'black';
                item.querySelector('i').style.color = 'black'; 
                item.querySelector('p').style.color = 'black'; 
            }
        });
    
        const tabContentItem = document.querySelector(`#${this.id}-content`);
        tabContentItem.classList.add('show');
    }

    function removeBorder() {
        console.log("removeBorder function executed"); // Add this line
        tabItems.forEach(item => {
            item.style.borderColor = 'lightgray';
            item.style.color = 'lightgray';
        });
    }

    function removeShow() {
        console.log("removeShow function executed"); // Add this line
        tabContentItems.forEach(item => item.classList.remove('show'));
    }

    selectItem.call(tabItems[0]);
    console.log("Initial selection executed"); // Add this line

    tabItems.forEach(item => item.addEventListener('click', selectItem));
    console.log("Event listeners registered"); // Add this line



    const deliverySwiper = new Swiper('.delivery-swiper', {
        autoplay: true,
        // Optional parameters
        direction: 'vertical',
        loop: true,
      
      });
});
