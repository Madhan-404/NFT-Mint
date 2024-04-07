import express from 'express';
import { getMinterByAddress,addMinter } from '../controllers/minter.controller';

const Router = express.Router();

Router.get('/minter/:address', getMinterByAddress);
Router.post('/minter', addMinter);

export default():express.Router => {
    return Router;
}