import express from 'express'; 
import { refreshCountries, getAllCountries, getCountryByName, deleteCountryByName, getStatus} from '../controllers/countryController.js';


const countryRouter = express.Router();

countryRouter.post('countries/refresh', refreshCountries);
countryRouter.get('countries/', getAllCountries);
countryRouter.get('countries/:name', getCountryByName);
countryRouter.delete('countries/:name', deleteCountryByName);
countryRouter.get('/status', getStatus);  



export default countryRouter;