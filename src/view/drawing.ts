import { Subscription, BehaviorSubject, merge, switchMap } from "rxjs";
import { 
    allCountriesObservable, 
    buttonClickObservable, 
    countryInput, 
    editPlayer, 
    mergeGameOver, 
    setSubscriber, 
    setSubscriberForEvent, 
    switchMapForGameOver, 
    timerObservable, 
    timerTickObservable, 
    TIMER_IN_SECONDS 
} from "../controller/observable";
import { Country } from "../model/country";
import { Game } from "../model/game";
import { getTop10Scores } from "../service/user";

const NUM_OF_COUNTRIES = 41;

export function fillCountry(svgImage: SVGElement, country: Country, usernameInput: HTMLInputElement)
{
    if(!country) return;

    const fill = Array
                .from(svgImage.children)
                .filter(element => element.getAttribute("name") === country.name);

    if(!fill.length) return;

    fillCountryPathsWithColor(fill, "lightgreen");

    usernameInput.value = "";
}

export function drawHomePage(body: HTMLDivElement)
{
    const inputContainer: HTMLDivElement = document.createElement("div");
    inputContainer.classList.add("input-container");
    inputContainer.id = "start";

    const usernameInput: HTMLInputElement = drawUsernameInput();
    const button: HTMLButtonElement = drawStartButton();

    setSubscriberForEvent(buttonClickObservable(button), () => runStart(body, usernameInput.value));

    appendToDiv(inputContainer, [usernameInput, button]);

    prependToDiv(body, [inputContainer]);
}

export function drawStartButton()
{
    const button:HTMLButtonElement = getButton("START");

    return button;
}

export function drawUsernameInput()
{
    const usernameInput: HTMLInputElement = getInput("username");

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
    timer.classList.add("timer");

    return timer;
}

export function setTimer(seconds: number, timer: HTMLParagraphElement)
{
    timer.innerText = formatTime(seconds);

    if(!seconds) document.dispatchEvent(new Event("timerTick"));
}

export function runStart(body: HTMLDivElement, username: string)
{
    resetColor(getSVGMap());
    
    body.removeChild(document.querySelector("#start"));

    if(document.querySelector(".score-info")) {
        body.removeChild(document.querySelector(".score-info"));
    }

    const divContainer: HTMLDivElement = document.createElement("div");
    divContainer.classList.add("game");
    divContainer.id = "game";

    let timeRemaining = TIMER_IN_SECONDS;

    const game: Game = new Game({username, highScore: 0, timeRemaining });

    const inputContainer: HTMLDivElement = document.createElement("div");
    inputContainer.classList.add("input-container");

    const input: HTMLInputElement = getInput("country");

    const button: HTMLButtonElement = getButton("GIVE UP");

    appendToDiv(inputContainer, [input, button]);

    const timer: HTMLParagraphElement = drawTimer();

    const buttonClick$ = buttonClickObservable(button);
    const timerTick$ = timerTickObservable();
    const allCountries$ = allCountriesObservable();
    
    const timer$ = timerObservable();

    const timerSubscription = setSubscriber(timer$, seconds => {
        timeRemaining = TIMER_IN_SECONDS - seconds;
        setTimer(seconds, timer)
    });

    const input$ = countryInput(input, game);

    setSubscriber(input$,  (country: Country) => {
        fillCountry(getSVGMap() ,country, input);
        game.addAffectedCountry(country);
        numberOfAffectedCountries.next(game.affectedCountries.length);
    })

    let numberOfAffectedCountries: BehaviorSubject<number> = new BehaviorSubject(game.affectedCountries.length);

    setSubscriber(numberOfAffectedCountries.pipe(), (numberOfAffectedCountries) => {
        if(numberOfAffectedCountries !== NUM_OF_COUNTRIES) return;

        document.dispatchEvent(new Event("allCountries"));
    })

    setSubscriber(mergeGameOver([
        buttonClick$,
        timerTick$,
        allCountries$])
    .pipe(switchMap(() => editPlayer({username: game.player.username, score: game.affectedCountries.length, timeRemaining})))
    ,() => showScore(body, game.affectedCountries.length, timeRemaining, timerSubscription))

    appendToDiv(divContainer, [timer, inputContainer]);
    prependToDiv(body, [divContainer]);
}

async function showScore(body:HTMLDivElement, score: number, timeRemaining: number, timerSubscription: Subscription)
{
    body.removeChild(document.querySelector("#game"));
    drawHomePage(body);
    const scoreText = document.createElement("h3");
    scoreText.classList.add("score-info");
    scoreText.innerText = `Your score: ${score} countries
                           For: ${formatTime(timeRemaining)}`;
    timerSubscription.unsubscribe();

    prependToDiv(document.querySelector("#app"), [scoreText]);
    await drawScores();
}

export function getInput(placeholderText?: string)
{
    const input: HTMLInputElement = document.createElement("input");
    if(placeholderText) input.placeholder = placeholderText;
    input.type = "text";
    return input;
}

export function getButton(text: string)
{
    const button:HTMLButtonElement = document.createElement("button");
    button.innerText = text;

    return button
}

export async function drawScores()
{
    let scoreDiv: HTMLDivElement;
    if(document.querySelector(".high-scores"))
    {
        scoreDiv = document.querySelector(".high-scores");
        scoreDiv.innerHTML = "";
    } 
    else {
        scoreDiv = document.createElement("div");
        scoreDiv.classList.add("high-scores");
        appendToDiv(document.querySelector(".map"), [scoreDiv]);
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

    fillCountryPathsWithColor(fill, "#ececec");
}

function pad(n: number)
{
    return n < 10 ? `0${n}` : n;
}

function formatTime(seconds: number)
{
    return `${pad(Math.floor(seconds/60))}:${pad(seconds%60)}`
}

function fillCountryPathsWithColor(paths: Element[], color: string)
{
    paths.forEach(element => {
        element.setAttribute("fill", color);
    })
}