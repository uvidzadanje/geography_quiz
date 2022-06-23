export class Player
{
    constructor(
        private _username: string,
        private _highScore: number,
    ) {}

    get username()
    {
        return this._username;
    }

    get highScore()
    {
        return this._highScore;
    }

    set highScore(newHighScore: number)
    {
        this._highScore = newHighScore;
    }

    setPR(newScore: number)
    {
        this._highScore = Math.max(this._highScore, newScore);
    }
}