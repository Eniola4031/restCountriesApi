import express from 'express';
import dotenv from 'dotenv';
import { createTable } from './models/countryModel.js';
import countryRouter from './ routes/countryRoutes.js';

// const express = require('express');
// const dotenv = require('dotenv');
// const { createTable } = require('./models/countryModel');
// const countryRoutes = require('./routes/countryRoutes');

dotenv.config();
const app = express();

app.use(express.json());
app.use('/countries', countryRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  await createTable();
  console.log(`Server running on port ${PORT}`);
});
