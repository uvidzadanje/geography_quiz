import { debounceTime, fromEvent, map, filter, switchMap, from, Observable, timer, take, merge } from 'rxjs'
import { Country } from '../model/country';
import { Game } from '../model/game';
import { getCountry } from '../service/country';
import { updatePlayer } from '../service/user';

type milisecond = number;
type second = number;

export function countryInput(
    countryInput: HTMLInputElement,
    game: Game
)
{
    return fromEvent(countryInput, "input").pipe(
        debounceTime(100),
        map((ev: InputEvent) => (<HTMLInputElement>ev.target).value),
        filter((countryName) => countryName.length >= 4),
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
    const TIMER_IN_SECONDS: second = 300;
    const ONE_SECOND: milisecond = 1000;

    return timer(0, ONE_SECOND).pipe(
        map((secondsPassed: second)  => TIMER_IN_SECONDS - secondsPassed),
        take(TIMER_IN_SECONDS+1)
    )
}

export function buttonClickObservable(button: HTMLButtonElement)
{
    return fromEvent(button, "click");
}

export function timerTickObservable()
{
    return fromEvent(document, "timerTick");
}

export function allCountriesObservable()
{
    return fromEvent(document, "allCountries");
}

export function mergeGameOver(observables: Observable<any>[], dataForUpdate: {username: string, score: number})
{
    return merge(...observables).pipe(
        switchMap(() => editPlayer(dataForUpdate))
    )
}

export function editPlayer(dataForUpdate: {username: string, score: number})
{
    return from(updatePlayer(dataForUpdate))
}