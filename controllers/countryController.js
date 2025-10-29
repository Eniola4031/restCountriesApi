import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { createCanvas } from 'canvas';
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
        //save to DB
    await insertCountries(countries);
        // Generate Summary Image
        await generateSummaryImage(countries);

    res.json({ message: 'Countries refreshed successfully', count: countries.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to refresh countries' });
  }
};
// 🖼️ Utility: Generate summary image
const generateSummaryImage = async (countries) => {
  const total = countries.length;
  const top5 = [...countries]
    .filter((c) => c.estimated_gdp)
    .sort((a, b) => b.estimated_gdp - a.estimated_gdp)
    .slice(0, 5);
  const timestamp = new Date().toLocaleString();

  const width = 800;
  const height = 600;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#f0f4f7';
  ctx.fillRect(0, 0, width, height);

  // Title
  ctx.fillStyle = '#1b4332';
  ctx.font = 'bold 28px Arial';
  ctx.fillText('🌍 Country Summary', 50, 60);

  // Total countries
  ctx.font = '22px Arial';
  ctx.fillText(`Total Countries: ${total}`, 50, 120);

  // Top 5 GDP
  ctx.font = 'bold 22px Arial';
  ctx.fillText('Top 5 Countries by Estimated GDP:', 50, 180);
  ctx.font = '20px Arial';
  top5.forEach((c, i) => {
    ctx.fillText(`${i + 1}. ${c.name} — ${c.estimated_gdp.toLocaleString()}`, 70, 220 + i * 40);
  });

  // Timestamp
  ctx.font = '18px Arial';
  ctx.fillStyle = '#555';
  ctx.fillText(`Last Refresh: ${timestamp}`, 50, 460);

  // Save Image
  const buffer = canvas.toBuffer('image/png');
  const cacheDir = path.resolve('cache');
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);
  fs.writeFileSync(path.join(cacheDir, 'summary.png'), buffer);
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
export const getSummaryImage = (req, res) => {
  const imagePath = path.resolve('cache', 'summary.png');

  if (!fs.existsSync(imagePath)) {
    return res.status(404).json({ error: 'Summary image not found' });
  }

  res.sendFile(imagePath);
};

