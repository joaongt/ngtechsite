function fecharPopup() {
    document.getElementById("popupOverlay").style.display = "none";
}

const whatEnt = document.querySelector("#whatsappEnter");
whatEnt.addEventListener("click", () => {
    window.open("https://wa.me/5531982925328?text=Olá!%20Tenho%20interesse%20em%20saber%20mais.", "_blank");
})

const saibaMais1 = document.querySelector("#saBaMais1");
const saibaMais2 = document.querySelector("#saBaMais2");
const saibaMais3 = document.querySelector("#saBaMais3");

saibaMais1.addEventListener("click", () => {
    window.open("https://www.instagram.com/neurooart/", "_blank");
})

saibaMais2.addEventListener("click", () => {
    window.open("https://www.instagram.com/neurooart/", "_blank");
})

saibaMais3.addEventListener("click", () => {
    window.open("https://www.instagram.com/neurooart/", "_blank");
})