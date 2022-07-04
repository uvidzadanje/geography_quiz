import { Player } from "./player"
import { Country } from "./country"

export class Game
{
    private _affectedCountries: Country[];

    constructor(
        private _player: Player, 
    ) 
    {
        this._affectedCountries = [];
    }

    get player()
    {
        return this._player;
    }

    get affectedCountries()
    {
        return this._affectedCountries;
    }

    addAffectedCountry(country: Country)
    {
        if(!country) return;
        this._affectedCountries.push(country);
    }
}