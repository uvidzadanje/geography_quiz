import { 
    buttonClickObservable,
    gameStartObservable,
    setSubscriberForEvent,
} from "../controller/observable";
import { Country } from "../model/country";
import { getTop10Scores } from "../service/user";

const COUNTRY_ATTRIBUTE_NAME = "name";

const COUNTRY_HIT_FILL_COLOR = "lightgreen";
const COUNTRY_DEFAULT_FILL_COLOR = "#ececec";

const INPUT_CONTAINER_CLASSNAME = "input-container";
const SCORE_INFO_CLASSNAME = "score-info";
const TIMER_CLASSNAME = "timer";
const GAME_CLASSNAME = "game";
const HIGH_SCORES_CLASSNAME = "high-scores";
const MAP_CLASSNAME = "map";

const SVG_TAG_NAME = "svg";
const APP_ID_NAME = "app";

export function fillCountry({country, svgImage, countryInput}: {country: Country, svgImage: SVGElement, countryInput: HTMLInputElement})
{
    if(!country) return;

    const fill = Array
                .from(svgImage.children)
                .filter(element => element.getAttribute(COUNTRY_ATTRIBUTE_NAME) === country.name);

    if(!fill.length) return;


    fillCountryPathsWithColor(fill, COUNTRY_HIT_FILL_COLOR);

    countryInput.value = "";
}

export function drawHomePage(body: HTMLDivElement)
{
    const inputContainer: HTMLDivElement = createInputContainer();

    const usernameInput: HTMLInputElement = drawUsernameInput();
    const button: HTMLButtonElement = drawStartButton();

    setSubscriberForEvent(buttonClickObservable(button), () => {
        if(!usernameInput.value)
        {
            alert("Username is required!");
            return;
        }
        drawStart(body, usernameInput.value)
    });

    appendToDiv(inputContainer, [usernameInput, button]);

    prependToDiv(body, [inputContainer]);
}

export function drawStartButton()
{
    const BUTTON_TEXT = "START";
    const button:HTMLButtonElement = createButton({
        text: BUTTON_TEXT
    });

    return button;
}

export function drawUsernameInput()
{
    const PLACEHOLDER_TEXT = "username";
    const usernameInput: HTMLInputElement = createInput({
        placeholderText: PLACEHOLDER_TEXT
    });

    return usernameInput;
}

export function getSVGMap()
{
    return document.querySelector(SVG_TAG_NAME);
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
    timer.classList.add(TIMER_CLASSNAME);

    return timer;
}

export function setTimer(seconds: number, timer: HTMLParagraphElement)
{
    timer.innerText = formatTime(seconds);
}

export function resetStart(body: HTMLDivElement)
{
    resetColor(getSVGMap());
    
    body.removeChild(document.querySelector(getClassFormatForQuery(INPUT_CONTAINER_CLASSNAME)));

    const scoreInfoElement = document.querySelector(getClassFormatForQuery(SCORE_INFO_CLASSNAME))

    if(scoreInfoElement) {
        body.removeChild(scoreInfoElement);
    }
}

export function drawStart(body: HTMLDivElement, username: string)
{
    resetStart(body);

    const divContainer: HTMLDivElement = document.createElement("div");
    divContainer.classList.add(GAME_CLASSNAME);

    const inputContainer: HTMLDivElement = createInputContainer();

    const PLACEHOLDER_TEXT = "country";
    const input: HTMLInputElement = createInput({placeholderText: PLACEHOLDER_TEXT});

    const BUTTON_TEXT = "GIVE UP";
    const button: HTMLButtonElement = createButton({text: BUTTON_TEXT});

    appendToDiv(inputContainer, [input, button]);

    const timer: HTMLParagraphElement = drawTimer();

    appendToDiv(divContainer, [timer, inputContainer]);
    prependToDiv(body, [divContainer]);

    gameStartObservable({username, body, giveUpButton: button, countryInput: input, timerElement: timer});
}

export async function showScore(body:HTMLDivElement, score: number, timeRemaining: number)
{
    body.removeChild(document.querySelector(getClassFormatForQuery(GAME_CLASSNAME)));
    drawHomePage(body);
    const scoreText = document.createElement("h3");
    scoreText.classList.add(SCORE_INFO_CLASSNAME);
    scoreText.innerText = `Your score: ${score} countries
                           For: ${formatTime(timeRemaining)}`;

    prependToDiv(document.querySelector(getIdFormatForQuery(APP_ID_NAME)), [scoreText]);
    await drawScores();
}

export function createInput({placeholderText}: {placeholderText?: string})
{
    const input: HTMLInputElement = document.createElement("input");
    if(placeholderText) input.placeholder = placeholderText;
    input.type = "text";
    return input;
}

export function createButton({ text }: {text: string})
{
    const button:HTMLButtonElement = document.createElement("button");
    button.innerText = text;

    return button
}

export function createInputContainer()
{
    const inputContainer: HTMLDivElement = document.createElement("div");
    inputContainer.classList.add(INPUT_CONTAINER_CLASSNAME);

    return inputContainer;
}

export async function drawScores()
{
    let scoreDiv: HTMLDivElement;
    if(document.querySelector(getClassFormatForQuery(HIGH_SCORES_CLASSNAME)))
    {
        scoreDiv = document.querySelector(getClassFormatForQuery(HIGH_SCORES_CLASSNAME));
        scoreDiv.innerHTML = "";
    } 
    else {
        scoreDiv = document.createElement("div");
        scoreDiv.classList.add(HIGH_SCORES_CLASSNAME);
        appendToDiv(document.querySelector(getClassFormatForQuery(MAP_CLASSNAME)), [scoreDiv]);
    }

    scoreDiv.innerHTML += "<h2>Top 10 scores</h2>";
    
    await drawTop10Scores(scoreDiv);
}

export async function drawTop10Scores(scoreDiv: HTMLDivElement)
{
    const scores = await getTop10Scores();

    scores.forEach((element, index) => {
        scoreDiv.innerHTML += `<h3>${index+1}. ${element.username}: ${element.highScore} countries for ${formatTime(element.timeRemaining)}</h3>`
    })
}

export function resetColor(svgImage: SVGElement)
{
    const fill = Array.from(svgImage.children);

    fillCountryPathsWithColor(fill, COUNTRY_DEFAULT_FILL_COLOR);
}

export function pad(n: number)
{
    return n < 10 ? `0${n}` : n;
}

export function formatTime(seconds: number)
{
    return `${pad(Math.floor(seconds/60))}:${pad(seconds%60)}`
}

export function fillCountryPathsWithColor(paths: Element[], color: string)
{
    paths.forEach(element => {
        element.setAttribute("fill", color);
    })
}

export function getClassFormatForQuery(className: string)
{
    return `.${className}`;
}

export function getIdFormatForQuery(id: string)
{
    return `#${id}`;
}