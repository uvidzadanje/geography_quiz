import { config } from "../config";

export async function getCountry(country: String)
{
    const response = await fetch(`${config.API_URL}/players?name=${country}`);
    
    const countries = await response.json();
    
    if(countries.length !== 1) return null;

    return countries;
}