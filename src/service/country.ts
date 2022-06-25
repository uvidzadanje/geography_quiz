import { config } from "../config";
import { Country } from "../model/country";

export async function getCountry(country: String)
{
    try {
        const response = await fetch(`${config.API_URL}/countries?name=${country}`);

        return response.json();
    } catch (error) {
        console.log(error);
        return null;
    }
}