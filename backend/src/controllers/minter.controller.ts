import { Request, Response } from 'express';
import { Minters,FindMinterbyAddress } from '../db/minters';

// Controller function to get minter data by address
export const getMinterByAddress = async (req: Request, res: Response): Promise<void> => {
    try {
        const { address } = req.params;
        const minter = await FindMinterbyAddress(address);
        if (minter) {
            res.status(200).json(minter);
        } else {
            res.status(404).json({ message: 'Minter not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Controller function to add minter data
export const addMinter = async (req: Request, res: Response): Promise<void> => {
    try {
        const { address, txHash } = req.body;
        const minterValues = { address, txHash };
        const newMinter = new Minters(minterValues);
        res.status(201).json(newMinter);
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


