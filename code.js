var socials = document.getElementById('Socials');
var nameBox = document.getElementById('nameBox');
let iconsDownColorString = "rgba(194, 194, 194, 255)";
let iconsUpColorString = "rgba(0, 0,0, 0";
var scrolledUp = true;

function openMenu() {
    if (scrolledUp) {
        socials.style.marginBottom = "0vh";
        nameBox.style.backgroundColor = iconsDownColorString;
    }
    else  {
        socials.style.marginBottom = "100vh";
        nameBox.style.backgroundColor = iconsUpColorString;
    }
    scrolledUp = !scrolledUp;
}

nameBox.onmouseenter  = () => {
    nameBox.style.backgroundColor = scrolledUp ?iconsDownColorString : iconsUpColorString;
}

nameBox.onmouseleave = () => {
    nameBox.style.backgroundColor = scrolledUp ? iconsUpColorString : iconsDownColorString;
}

window.onload = () => {
    setTimeout(() => {console.log("set to 0");
    nameBox.style.marginTop = "0";}, 300);
}