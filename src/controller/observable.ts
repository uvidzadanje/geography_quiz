import { debounceTime, fromEvent, map, filter, switchMap, from, Observable, timer, take } from 'rxjs'
import { config } from '../config';
import { Country } from '../model/country';
import { getCountry } from '../service/country';

type milisecond = number;
type second = number;

export function countryInput(
    usernameInput: HTMLInputElement
)
{
    return fromEvent(usernameInput, "input").pipe(
        debounceTime(100),
        map((ev: InputEvent) => (<HTMLInputElement>ev.target).value),
        filter((countryName) => countryName.length >= 4),
        switchMap((countryName) => selectCountry(countryName)),
        map((data) => data[0])
    )
}

export function selectCountry(countryName: string): Observable<Country[]>
{
    return from(getCountry(countryName));
}

export function timerObservable(): Observable<number>
{
    const TIMER_IN_SECONDS: second = 300;
    const ONE_SECOND: milisecond = 1000;

    return timer(ONE_SECOND, ONE_SECOND).pipe(
        map((secondsPassed: number)  => TIMER_IN_SECONDS - secondsPassed),
        take(TIMER_IN_SECONDS+1)
    )
}