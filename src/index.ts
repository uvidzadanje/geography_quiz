const body:HTMLDivElement = document.querySelector("div");

const button:HTMLButtonElement = document.createElement("button");
button.innerText = "START";

const europeSVG:SVGElement = document.querySelector("svg");

const usernameInput: HTMLInputElement = document.createElement("input");
usernameInput.type = "text";

body.appendChild(usernameInput);
body.appendChild(button);
