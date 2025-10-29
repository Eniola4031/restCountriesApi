import express from 'express'; 
import { refreshCountries,
     getAllCountries,
      getCountryByName,
       deleteCountryByName,
        getStatus,
        getSummaryImage
    } from '../controllers/countryController.js';


const countryRouter = express.Router();

countryRouter.post('/countries/refresh', refreshCountries);
countryRouter.get('/countries/', getAllCountries);
countryRouter.get('/countries/:name', getCountryByName);
countryRouter.delete('/countries/:name', deleteCountryByName);
countryRouter.get('/status', getStatus);  
countryRouter.get('countries/image', getSummaryImage);   



export default countryRouter;