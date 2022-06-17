var socials = document.getElementById('Socials');
var websites = document.getElementById('websites');
var topBar = document.getElementById("topBar");
var nameBox = document.getElementById('nameBox');
let iconsDownColorString = "rgba(31,31,31,1)";
let iconsUpColorString = "rgba(0, 0,0, 0)";
var scrolledUp = true;

function openMenu() {
    if (scrolledUp) {
        socials.style.marginBottom = "0vh";
        websites.style.marginRight = "0vh";
        topBar.style.marginRight = "0vh";
        topBar.style.zIndex = "2";
        nameBox.style.backgroundColor = iconsDownColorString;
        nameBox.style.border = "5px solid rgb(51, 225, 228)";
        document.getElementById("name").style.color = "rgb(230, 230, 230)";
    }
    else  {
        socials.style.marginBottom = "100vh";
        websites.style.marginRight = "100vh";
        topBar.style.marginRight = "100vh";
        topBar.style.zIndex = "-1";
        nameBox.style.backgroundColor = iconsUpColorString;
        nameBox.style.border = "5px solid rgb(98, 98, 98)";
        document.getElementById("name").style.color = "rgb(51, 225, 228)";
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