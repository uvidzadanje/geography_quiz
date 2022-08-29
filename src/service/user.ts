import { config } from "../config";
import { Player } from "../model/player";
const baseUrl = `${config.API_URL}/players`;

export async function getPlayer(username: string)
{
    try {
        const response = await fetch(`${baseUrl}?username=${username}`);

        const players = await response.json();
        if(!players.length) return null;

        return players[0];
    } catch (error) {
        return null;
    }
}

export async function updatePlayer(updateData: {username: string, score: number, timeRemaining: number})
{
    try {
        let {username, score, timeRemaining} = updateData;
        let player = await getPlayer(username) || await createPlayer(username);

        if(player.highScore > score) return false;

        await fetch(`${baseUrl}/${player.id}`, {
            method: "PUT",
            headers: {
                'Content-type': "application/json"
            },
            body: JSON.stringify({username, highScore: score, timeRemaining})
        });

        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}

export async function createPlayer(username: string)
{
    try {
        const player = await fetch(`${baseUrl}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({username, highScore: 0})
        });

        return await player.json();
    } catch (error) {
        console.log(error);
        return null;
    }
}

export async function getTop10Scores()
{
    try {
        const response = await fetch(`${baseUrl}?_sort=highScore,timeRemaining&_order=desc,asc&_limit=10`);

        const scores: Player[] = await response.json();

        return scores;
    } catch (error) {
        return null;
    }
}