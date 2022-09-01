import { debounceTime, fromEvent, map, filter, switchMap, from, Observable, timer, take, merge, BehaviorSubject } from 'rxjs';
import { Country } from '../model/country';
import { Game } from '../model/game';
import { getCountry } from '../service/country';
import { updatePlayer } from '../service/user';
import { drawHomePage, fillCountry, getSVGMap, setTimer, showScore } from '../view/drawing';

type milisecond = number;
type second = number;

export const TIMER_IN_SECONDS: second = 300;
export const ONE_SECOND_IN_MILISECONDS: milisecond = 1000;
export const DEBOUNCE_TIME: number = 100;
export const MINIMAL_COUTRY_NAME_LENGTH = 4;
export const NUM_OF_COUNTRIES = 41;

export const INPUT_EVENT_NAME: string = "input";
export const BUTTON_CLICK_EVENT_NAME: string = "click";
export const TIMER_TICK_EVENT_NAME: string = "timerTick";
export const ALL_COUNTRIES_HIT_EVENT_NAME: string = "allCountries";

export function countryInputObservable(
    countryInput: HTMLInputElement,
    game: Game
)
{
    return fromEvent(countryInput, INPUT_EVENT_NAME).pipe(
        debounceTime(DEBOUNCE_TIME),
        map((ev: InputEvent) => (<HTMLInputElement>ev.target).value),
        filter((countryName) => countryName.length >= MINIMAL_COUTRY_NAME_LENGTH),
        filter((countryName) => !game.affectedCountries.map(element => element.name).filter((element) => element === countryName.toLowerCase()).length),
        switchMap((countryName) => selectCountry(countryName)),
        map((data) => data[0])
    )
}

export function selectCountry(countryName: string): Observable<Country[]>
{
    return from(getCountry(countryName.toLowerCase()));
}

export function timerObservable(): Observable<number>
{
    return timer(0, ONE_SECOND_IN_MILISECONDS).pipe(
        map((secondsPassed: second)  => TIMER_IN_SECONDS - secondsPassed),
        take(TIMER_IN_SECONDS+1)
    )
}

export function buttonClickObservable(button: HTMLButtonElement)
{
    return fromEvent(button, BUTTON_CLICK_EVENT_NAME);
}

export function timerTickObservable()
{
    return fromEvent(document, TIMER_TICK_EVENT_NAME);
}

export function allCountriesObservable()
{
    return fromEvent(document, ALL_COUNTRIES_HIT_EVENT_NAME);
}

export function mergeGameOver(observables: Observable<any>[])
{
    return merge(...observables);
}

export function switchMapForGameOver(dataForUpdate: {username: string, score: number, timeRemaining: number})
{
    return switchMap(() => editPlayer(dataForUpdate));
}

export function editPlayer(dataForUpdate: {username: string, score: number, timeRemaining: number})
{
    return from(updatePlayer(dataForUpdate))
}

export function setSubscriberForEvent(event$: Observable<Event>, subscribeFunction: (value? : Event) => void)
{
    return setSubscriber(event$, subscribeFunction);
}

export function setSubscriber(observer: Observable<any>, subscribeFunction: (value?: any) => void)
{
    return observer.subscribe(subscribeFunction);
}

export function gameStartObservable({
    username, 
    body,
    giveUpButton,
    countryInput,
    timerElement,
}: 
{
    username: string,
    body: HTMLDivElement
    giveUpButton: HTMLButtonElement,
    countryInput: HTMLInputElement,
    timerElement: HTMLParagraphElement
})
{
    let timeRemaining = TIMER_IN_SECONDS;

    const game: Game = new Game({username, highScore: 0, timeRemaining });

    const buttonClick$ = buttonClickObservable(giveUpButton);
    const timerTick$ = timerTickObservable();
    const allCountries$ = allCountriesObservable();
    const timer$ = timerObservable();
    const input$ = countryInputObservable(countryInput, game);

    let numberOfAffectedCountries: BehaviorSubject<number> = new BehaviorSubject(game.affectedCountries.length);

    const timerSubscription = setSubscriber(timer$, seconds => {
        timeRemaining = TIMER_IN_SECONDS - seconds;
        setTimer(seconds, timerElement)
        if(!seconds) document.dispatchEvent(new Event(TIMER_TICK_EVENT_NAME));
    });


    setSubscriber(input$,  (country: Country) => {
        fillCountry({
            svgImage: getSVGMap(),
            country,
            countryInput
        });
        game.addAffectedCountry(country);
        numberOfAffectedCountries.next(game.affectedCountries.length);
    })


    setSubscriber(numberOfAffectedCountries.pipe(), (numberOfAffectedCountries) => {
        if(numberOfAffectedCountries !== NUM_OF_COUNTRIES) return;

        document.dispatchEvent(new Event(ALL_COUNTRIES_HIT_EVENT_NAME));
    })

    setSubscriber(mergeGameOver([
        buttonClick$,
        timerTick$,
        allCountries$])
    .pipe(switchMap(() => editPlayer({username: game.player.username, score: game.affectedCountries.length, timeRemaining})))
    ,() => {
        showScore(body, game.affectedCountries.length, timeRemaining);
        timerSubscription.unsubscribe();
    })
}