import { config } from "../config";

const baseUrl = `${config.API_URL}/countries`

export async function getCountry(country: String)
{
    try {
        const API_URL = `${baseUrl}?name=${country}`;

        const response = await fetch(API_URL);

        return response.json();
    } catch (error) {
        console.log(error);
        return null;
    }
}