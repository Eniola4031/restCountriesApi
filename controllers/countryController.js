import axios from 'axios';
import { insertCountries,
   getCountries,
    getCountryByNameModel,
     deleteCountryByNameModel,
      getCountryCount, 
  getLastRefreshTime
  } from '../models/countryModel.js';
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
// Get one country by name
export const getCountryByName = async (req, res) => {
  try {
    const { name } = req.params;
    const country = await getCountryByNameModel(name); // model function
    
    if (!country) {
      return res.status(404).json({ error: 'Country not found' });
    }
    
    res.json(country);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get country' });
  }
};

// Delete a country by name
export const deleteCountryByName = async (req, res) => {
  try {
    const { name } = req.params;
    const deleted = await deleteCountryByNameModel(name); // model function
    
    if (deleted === 0) {
      return res.status(404).json({ error: 'Country not found' });
    }

    res.json({ message: `${name} deleted successfully` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete country' });
  }
};

export const getStatus = async (req, res) => {
  try {
    const total_countries = await getCountryCount();
    const last_refreshed_at = await getLastRefreshTime();

    res.json({
      total_countries,
      last_refreshed_at: last_refreshed_at || 'No refresh yet',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get status' });
  }
};

