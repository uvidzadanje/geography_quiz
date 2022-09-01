import { config } from "../config";
import { Player } from "../model/player";
const baseUrl = `${config.API_URL}/players`;

function setHeader({method, payload}: {method: string, payload: Object})
{
    return {
        method: method,
        headers: {
            'Content-type': "application/json"
        },
        body: JSON.stringify(payload)
    }
}

export async function getPlayer(username: string)
{
    try {
        const API_URL = `${baseUrl}?username=${username}`;

        const response = await fetch(API_URL);

        const players = await response.json();

        if(!players.length) return null;

        return players[0];
    } catch (error) {
        return null;
    }
}

export async function updatePlayer({username, score, timeRemaining}: {username: string, score: number, timeRemaining: number})
{
    try {
        let player = await getPlayer(username) || await createPlayer(username);

        if(player.highScore > score || (player.highScore === score && player.timeRemaining < timeRemaining)) return false;

        await fetch(`${baseUrl}/${player.id}`, setHeader({
            method: "PUT", 
            payload: {
                username,
                highScore: score,
                timeRemaining
            }
        }));

        return true;
    } catch (error) {
        return false;
    }
}

export async function createPlayer(username: string)
{
    try {
        const player = await fetch(`${baseUrl}`, setHeader({
            method: "POST", 
            payload: {
                username, 
                highScore: 0
            }
        }));

        return await player.json();
    } catch (error) {
        return null;
    }
}

export async function getTop10Scores()
{
    try {
        const API_URL = `${baseUrl}?_sort=highScore,timeRemaining&_order=desc,asc&_limit=10`;

        const response = await fetch(API_URL);

        const scores: Player[] = await response.json();

        return scores;
    } catch (error) {
        return null;
    }
}