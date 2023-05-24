const backgroundVideo = document.getElementById("backgroundVideo");
const main = document.getElementById("main");

backgroundVideo.addEventListener("ended", (event) => {
    event.target.setAttribute("class", "introStop");
    main.setAttribute("class", "p-5 showMain");
});

const linkInput = document.getElementById("linkInput");
const downloadButton = document.getElementById("downloadButton");
const downloadPathText = document.getElementById("downloadPathText");

linkInput.addEventListener("input", (event) => {
    if (event.target.value.split("/").length >= 5 && event.target.value.includes("https://nhentai.net/g/")) {
        event.target.setAttribute("class", "form-control is-valid");
        downloadButton.setAttribute("class", "btn btn-outline-success btn-sm px-3");
        downloadButton.disabled = false;
    } else {
        event.target.setAttribute("class", "form-control is-invalid");
        downloadButton.setAttribute("class", "btn btn-outline-danger btn-sm px-3");
        downloadButton.disabled = true;
    }
});

downloadButton.addEventListener("click", () => {
    window.electronAPI.downloadManga(linkInput.value);
});

const dpButton = document.getElementById("dpButton");

dpButton.addEventListener("click", () => {
    window.electronAPI.chooseDp();
});

window.electronAPI.downloadPath((event, path) => {
    downloadPathText.innerText = `Download path: ${path}`;
});

const downloadingDisplay = document.getElementById("downloadingDisplay");
const mainContent = document.getElementById("mainContent");

window.electronAPI.downloading((event, callback) => {
    linkInput.disabled = true;
    dpButton.disabled = true;
    downloadButton.disabled = true;
    downloadingDisplay.setAttribute("class", "p-5 rounded shadow-lg d-block");
    mainContent.setAttribute("class", "blurMainContent");
});

window.electronAPI.notDownloading((event, callback) => {
    linkInput.disabled = false;
    dpButton.disabled = false;
    downloadButton.disabled = false;
    downloadingDisplay.setAttribute("class", "p-5 rounded shadow-lg d-none");
    mainContent.setAttribute("class", "noBlurMainContent");
});