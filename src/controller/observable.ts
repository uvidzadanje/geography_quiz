import { debounceTime, fromEvent, map, filter, switchMap, from, Observable } from 'rxjs'
import { Country } from '../model/country';
import { getCountry } from "../service/country"

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
    return from(
        fetch(`http://localhost:3000/countries?name=${countryName}`)
        .then((response) => {
            return response.json();
        })
        .catch((error) => {
            console.log(error);
        })
    )
}