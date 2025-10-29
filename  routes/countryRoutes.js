import express from 'express';
import { refreshCountries, getAllCountries } from '../controllers/countryController.js';

const countryRouter = express.Router();

countryRouter.post('/refresh', refreshCountries);
countryRouter.get('/', getAllCountries);

export default countryRouter;