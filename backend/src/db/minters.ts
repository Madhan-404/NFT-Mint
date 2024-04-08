import mongoose, { Schema } from "mongoose";

const MinterSchema = new mongoose.Schema({
    address:{type: String, required: true},
    txHash:{type: String, required: true}
});

export const Minters = mongoose.model('Minters', MinterSchema);

export const FindMinterbyAddress = (address: string) =>  Minters.findOne({address});
// export const AddMinter = (values:Record<string,any>) => new Minters({values}).save().then((minter) => minter.toObject());

export const AddMinter = ({ address, txHash }: { address: string, txHash: string }) => 
    new Minters({ address, txHash }).save().then((minter) => minter.toObject());
