import { config } from "../config";

const baseUrl = `${config.API_URL}/countries`

export async function getCountry(country: String)
{
    try {
        const response = await fetch(`${baseUrl}?name=${country}`);

        return response.json();
    } catch (error) {
        console.log(error);
        return null;
    }
}