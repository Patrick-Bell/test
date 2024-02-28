document.addEventListener('DOMContentLoaded', function() {
        

        let valueDisplays = document.querySelectorAll(".about-number");
        let interval = 10000;
        
        valueDisplays.forEach(valueDisplay => {
            let startValue = 0;
            let endValueString = valueDisplay.getAttribute("data-val");
        
            // Parse the numeric part of the string using parseFloat
            let endValue = parseFloat(endValueString);
            console.log(endValue);
        
            let duration = Math.floor(interval / endValue);
            let counter = setInterval(function() {
                startValue += 1;
                valueDisplay.textContent = startValue + ' +';
                if (startValue == endValue) {
                    clearInterval(counter);
                }
            }, duration);
        });
        



  let countDownDate = new Date("Dec 25, 2024 00:00:00").getTime();

let x = setInterval(function(){
    let now = new Date().getTime();
    let distance = countDownDate - now;

    let days = Math.floor(distance / (1000 * 60 * 60 * 24));
    let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
    let seconds = Math.floor((distance % (1000 * 60) / 1000));

    document.getElementById("days").innerHTML = days.toString().padStart(2, '0') + " :";
    document.getElementById("hours").innerHTML = hours.toString().padStart(2, '0') + " :";;
    document.getElementById("minutes").innerHTML = minutes.toString().padStart(2, '0') + " :";;
    document.getElementById("seconds").innerHTML = seconds.toString().padStart(2, '0');

    if(distance < 0){
        clearInterval(x);
        document.getElementById("days").innerHTML = "00";
        document.getElementById("hours").innerHTML = "00";
        document.getElementById("minutes").innerHTML = "00";
        document.getElementById("seconds").innerHTML = "00";
    }

},1000)


  
const newSwiper = new Swiper('.swiper', {
    // Optional parameters
    direction: 'horizontal',
    loop: true,
    autoplay: {
        delay: 3000, 
        disableOnInteraction: false, 
      },
  
    // If we need pagination
    pagination: {
      el: '.swiper-pagination',
    },
    // And if we need scrollbar
    scrollbar: {
      el: '.swiper-scrollbar',
    },
  });

});