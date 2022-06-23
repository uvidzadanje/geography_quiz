import { Country } from "./country"

export class Statistic
{
    private _hitPercentage: number
    constructor(
        private _country: Country
    )
    {
        this._hitPercentage = 0;
    }

    get country()
    {
        return this._country;
    }

    get hitPercentage()
    {
        return this._hitPercentage;
    }

    set hitPercentage(newHitPercentage: number)
    {
        this._hitPercentage = newHitPercentage;
    }
}