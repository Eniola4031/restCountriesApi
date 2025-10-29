import express from 'express';
import dotenv from 'dotenv';
import { createTable } from './models/countryModel.js';
import countryRouter from './ routes/countryRoutes.js';

dotenv.config();
const app = express();

app.use(express.json());
app.use('/', countryRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  await createTable();
  console.log(`Server running on port ${PORT}`);
});
