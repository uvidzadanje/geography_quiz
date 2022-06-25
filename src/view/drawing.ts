import { countryInput, timerObservable } from "../controller/observable";
import { Country } from "../model/country";

export function fillCountry(svgImage: SVGElement, country: Country, usernameInput: HTMLInputElement)
{
    if(!country) return;

    const fill = Array
                .from(svgImage.children)
                .filter(element => element.getAttribute("name") === country.name);

    if(!fill.length) return;

    fill.forEach(element => {
        element.setAttribute("fill", "lightgreen");
    })

    usernameInput.value = "";
}

export function drawHomePage(body: HTMLDivElement)
{
    const inputContainer: HTMLDivElement = document.createElement("div");

    const usernameInput: HTMLInputElement = drawUsernameInput();
    const button: HTMLButtonElement = drawStartButton();

    const timer: HTMLParagraphElement = drawTimer();

    appendToDiv(body, [timer]);

    appendToDiv(inputContainer, [usernameInput, button]);

    appendToDiv(body, [inputContainer]);
}

export function drawStartButton()
{
    const button:HTMLButtonElement = document.createElement("button");
    button.innerText = "START";

    return button;
}

export function drawUsernameInput()
{
    const usernameInput: HTMLInputElement = document.createElement("input");
    usernameInput.type = "text";

    const inputObs = countryInput(usernameInput);

    inputObs.subscribe((country: Country) => fillCountry(getSVGMap() ,country, usernameInput));

    return usernameInput;
}

export function getSVGMap()
{
    return document.querySelector("svg");
}

export function appendToDiv(div: HTMLDivElement, elements: HTMLElement[])
{
    elements.forEach(element => {
        div.appendChild(element);
    })
}

export function prependToDiv(div: HTMLDivElement, elements: HTMLElement[])
{
    elements.forEach(element => {
        div.prepend(element);
    })
}

export function drawTimer()
{
    const timer: HTMLParagraphElement = document.createElement("p");
    timer.style.fontSize = "30px";
    timer.style.fontWeight = "bold";

    const timerObs = timerObservable();
    timerObs.subscribe(seconds => setTimer(seconds, timer));

    return timer;
}

export function setTimer(seconds: number, timer: HTMLParagraphElement)
{
    timer.innerText = `${Math.floor(seconds/60) < 10 ? `0${Math.floor(seconds/60)}`: Math.floor(seconds/60)}:${seconds%60 < 10 ? `0${seconds%60}` : seconds%60}`;
}