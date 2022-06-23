export class Country
{
    constructor(
        private _id: number,
        private _name: string,
        private _population: number,
        private _populationDenstiny: number
    ) {}

    get id()
    {
        return this._id;
    }

    get name()
    {
        return this._name;
    }

    get population()
    {
        return this._population;
    }

    get populationDenstiny()
    {
        return this._populationDenstiny;
    }
}