//////// HAMBURGER MENU ////////

const hamburgerCb = document.getElementById("hamburger-cb");
const headerNav = document.getElementById("header__nav");

hamburgerCb.addEventListener("change", () => {
	if (hamburgerCb.checked) {
		headerNav.style.setProperty("display", "flex");
	} else {
		headerNav.style.removeProperty("display");
	}
});

//////// SHORTENER ////////

const shortenerForm = document.getElementById("shortener__form");
const shortenerInput = document.getElementById("shortener__input");
const shortenerItems = document.getElementById("shortener__items");
const spinner = document.getElementById("spinner");
const errorMessageContainer = document.getElementById("shortener__error-message-container");

function createItem(original, shortened) {
	let item = document.createElement("div");
	item.classList.add("shortener__item");
	item.innerHTML = `<div class="shortener__item-original-wrapper"><p class="shortener__item-original">${original}</p></div><a class="shortener__item-shortened" href="https://www.${shortened}" target="_blank">${shortened}</a><button class="btn btn-square-ish-small-fixed">Copy</button>`;
	let copyBtn = item.childNodes[2];
	copyBtn.addEventListener("click", () => {
		navigator.clipboard
			.writeText(shortened)
			.then(() => {
				let activeBtns = document.querySelectorAll(".btn-active");
				activeBtns.forEach((elem) => {
					elem.classList.remove("btn-active");
					elem.innerText = "Copy";
				});
				copyBtn.classList.add("btn-active");
				copyBtn.innerText = "Copied!";
			})
			.catch((err) => console.log(err));
	});
	return item;
}

//// LOCAL STORAGE ////
let shortenedHistory = localStorage.getItem("shortenedHistory");
if (shortenedHistory) {
	shortenedHistory = JSON.parse(shortenedHistory);
	shortenedHistory.forEach((item) => {
		shortenerItems.appendChild(createItem(item.original, item.shortened));
	});
} else {
	shortenedHistory = [];
}

//// SHORTENER FORM ////
shortenerForm.addEventListener("submit", (e) => {
	e.preventDefault();
	if (!shortenerInput.checkValidity()) {
		shortenerInput.focus();
		shortenerInput.select();
	} else {
		spinner.style.setProperty("display", "unset");
		fetch("https://api.shrtco.de/v2/shorten?url=" + shortenerInput.value)
			.then((res) => res.json())
			.then((res) => {
				if (res.ok) {
					let newItem = createItem(res.result.original_link, res.result.short_link);
					shortenerInput.value = "";
					if (shortenerItems.childNodes.length === 3) {
						shortenedHistory.shift();
						shortenerItems.removeChild(shortenerItems.firstChild);
					}
					shortenedHistory.push({
						original: res.result.original_link,
						shortened: res.result.short_link,
					});
					shortenerItems.appendChild(newItem);
					localStorage.setItem("shortenedHistory", JSON.stringify(shortenedHistory));
					newItem.childNodes[2].focus();
					newItem.childNodes[2].blur();
				} else {
					throw new Error(res.error);
				}
			})
			.catch((error) => {
				errorMessageContainer.classList.toggle("error-active");
				errorMessageContainer.children[0].innerText = error;
				setTimeout(() => {
					errorMessageContainer.classList.toggle("error-active");
					errorMessageContainer.children[0].innerText = "Please add a link (https://...)";
				}, 2000);
			})
			.finally(() => {
				spinner.style.removeProperty("display");
			});
	}
});
