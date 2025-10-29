import pool from '../config/db.js';

export const createTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS countries (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100),
      capital VARCHAR(100),
      region VARCHAR(50),
      population BIGINT,
      currency_code VARCHAR(10),
      exchange_rate FLOAT,
      estimated_gdp FLOAT,
      flag_url TEXT,
      last_refreshed_at TIMESTAMP
    );
  `;
  await pool.query(query);
};

export const insertCountries = async (countries) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM countries'); // refresh
    const query = `
      INSERT INTO countries
      (name, capital, region, population, currency_code, exchange_rate, estimated_gdp, flag_url, last_refreshed_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    `;
    for (const c of countries) {
      await client.query(query, [
        c.name,
        c.capital,
        c.region,
        c.population,
        c.currency_code,
        c.exchange_rate,
        c.estimated_gdp,
        c.flag_url,
        new Date(),
      ]);
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const getCountries = async (filters) => {
  const { region, currency, sort } = filters;
  let baseQuery = 'SELECT * FROM countries';
  const conditions = [];
  const values = [];

  if (region) {
    values.push(region);
    conditions.push(`region = $${values.length}`);
  }

  if (currency) {
    values.push(currency);
    conditions.push(`currency_code = $${values.length}`);
  }

  if (conditions.length) {
    baseQuery += ` WHERE ${conditions.join(' AND ')}`;
  }

  if (sort === 'gdp_desc') baseQuery += ' ORDER BY estimated_gdp DESC';
  if (sort === 'gdp_asc') baseQuery += ' ORDER BY estimated_gdp ASC';

  const { rows } = await pool.query(baseQuery, values);
  return rows;
};
export const getCountryByNameModel = async (name) => {
  const result = await pool.query('SELECT * FROM countries WHERE name = $1', [name]);
  return result.rows[0];
};

export const deleteCountryByNameModel = async (name) => {
  const result = await pool.query('DELETE FROM countries WHERE name = $1', [name]);
  return result.rowCount; // returns 1 if deleted, 0 if not found
};
// Get total number of countries
export const getCountryCount = async () => {
  const result = await pool.query('SELECT COUNT(*) AS count FROM countries');
  return parseInt(result.rows[0].count);
};

// Get last refresh timestamp
export const getLastRefreshTime = async () => {
  const result = await pool.query('SELECT MAX(last_refreshed_at) AS last_refreshed_at FROM countries');
  return result.rows[0].last_refreshed_at;
};
