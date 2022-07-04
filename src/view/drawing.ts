import { fromEvent, merge, switchMap, from, Subscription } from "rxjs";
import { countryInput, timerObservable } from "../controller/observable";
import { Country } from "../model/country";
import { Game } from "../model/game";
import { getTop10Scores, updatePlayer } from "../service/user";

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
    inputContainer.id = "start";

    const usernameInput: HTMLInputElement = drawUsernameInput();
    const button: HTMLButtonElement = drawStartButton();

    fromEvent(button, "click").subscribe(() => runStart(body, usernameInput.value));

    appendToDiv(inputContainer, [usernameInput, button]);

    appendToDiv(body, [inputContainer]);
}

export function drawStartButton()
{
    const button:HTMLButtonElement = getButton("START");

    return button;
}

export function drawUsernameInput()
{
    const usernameInput: HTMLInputElement = getInput();

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

    return timer;
}

export function setTimer(seconds: number, timer: HTMLParagraphElement)
{
    timer.innerText = `${pad(Math.floor(seconds/60))}:${pad(seconds%60)}`;

    if(!seconds) document.dispatchEvent(new Event("timerTick"));
}

export function runStart(body: HTMLDivElement, username: string)
{
    resetColor(getSVGMap());
    
    body.removeChild(document.querySelector("#start"));

    const divContainer: HTMLDivElement = document.createElement("div");
    divContainer.id = "game";

    const game: Game = new Game({username, highScore: 0});

    const input: HTMLInputElement = getInput();

    const button: HTMLButtonElement = getButton("GIVE UP");

    const timer: HTMLParagraphElement = drawTimer();

    const buttonObs = fromEvent(button, "click");
    const timerTick = fromEvent(document, "timerTick");

    
    const timerObs = timerObservable();
    const timerSubscription = timerObs.subscribe(seconds => setTimer(seconds, timer));
    
    const inputObs = countryInput(input);

    inputObs.subscribe((country: Country) => {
        fillCountry(getSVGMap() ,country, input);
        game.addAffectedCountry(country);
    });

    merge(buttonObs, timerTick).pipe(
        switchMap(() => from(updatePlayer(game.player.username, game.affectedCountries.length)))
    ).subscribe(() => showScore(body, game.affectedCountries.length, timerSubscription))

    appendToDiv(divContainer, [timer, input, button]);
    appendToDiv(body, [divContainer]);
}

async function showScore(body:HTMLDivElement, score: number, timerSubscription: Subscription)
{
    body.removeChild(document.querySelector("#game"));
    drawHomePage(body);
    const scoreText = document.createElement("h3");
    scoreText.innerText = `Your score: ${score}`;
    timerSubscription.unsubscribe();

    prependToDiv(document.querySelector("#start"), [scoreText]);
    appendToDiv(document.querySelector("#start"), [await drawScores()]);
}

export function getInput()
{
    const input: HTMLInputElement = document.createElement("input");
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
    const scoreDiv: HTMLDivElement = document.createElement("div");
    scoreDiv.innerHTML += "<h2>Top 10 scores:</h2>";

    await drawTop10Scores(scoreDiv);

    return scoreDiv;
}

export async function drawTop10Scores(scoreDiv: HTMLDivElement)
{
    const scores = await getTop10Scores();

    scores.forEach((element, index) => {
        scoreDiv.innerHTML += `<h3>${index+1}. ${element.username} ${element.highScore}</h3>`
    })
}

export function resetColor(svgImage: SVGElement)
{
    const fill = Array.from(svgImage.children)

    fill.forEach(element => {
        element.setAttribute("fill", "#ececec");
    })
}

export function pad(n: number)
{
    return n < 10 ? `0${n}` : n;
}