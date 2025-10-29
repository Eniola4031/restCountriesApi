import axios from 'axios';
import { insertCountries, getCountries } from '../models/countryModel.js';
import { randomBetween } from '../utils/helpers.js';

export const refreshCountries = async (req, res) => {
  try {
    // Fetch countries
    const { data: countriesData } = await axios.get(
      'https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies'
    );

    // Fetch exchange rates
    const { data: rateData } = await axios.get('https://open.er-api.com/v6/latest/USD');
    const exchangeRates = rateData.rates;

    // Transform data
    const countries = countriesData.map((c) => {
      const currency_code = c.currencies?.[0]?.code || 'N/A';
      const exchange_rate = exchangeRates[currency_code] || null;
      const estimated_gdp =
        exchange_rate && c.population
          ? (c.population * randomBetween(1000, 2000)) / exchange_rate
          : null;

      return {
        name: c.name,
        capital: c.capital,
        region: c.region,
        population: c.population,
        currency_code,
        exchange_rate,
        estimated_gdp,
        flag_url: c.flag,
      };
    });

    await insertCountries(countries);
    res.json({ message: 'Countries refreshed successfully', count: countries.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to refresh countries' });
  }
};

export const getAllCountries = async (req, res) => {
  try {
    const countries = await getCountries(req.query);
    res.json(countries);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get countries' });
  }
};