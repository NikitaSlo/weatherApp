let isOpen = false; 

document.querySelector(".expand button").addEventListener("click", function () {
    const openIcon = this.querySelector(".open");
    const closeIcon = this.querySelector(".close");

    let infoCard = document.getElementById("weather-add");
    
    if (!isOpen) {
        openIcon.classList.add("moving");
        infoCard.style.visibility = "visible";

        setTimeout(() => {
            openIcon.classList.add("hidden"); 
            closeIcon.classList.remove("hidden"); 
            closeIcon.style.zIndex = "1"; 
            closeIcon.style.transform = "translate(-50%, -50%)"; 
        }, 400); 
    } else {
        closeIcon.style.transform = "translate(-150%, -50%)";
        infoCard.style.visibility = "hidden";

        setTimeout(() => {
            closeIcon.classList.add("hidden");
            openIcon.classList.remove("hidden");
            openIcon.classList.remove("moving");
        }, 400)
    }

    isOpen = !isOpen;
});
