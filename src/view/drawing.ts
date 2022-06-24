import { countryInput } from "../controller/observable";
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