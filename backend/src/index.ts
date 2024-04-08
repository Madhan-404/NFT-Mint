import express from 'express';
import http from 'http';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import router from './router';


const app = express();

app.use(cors());
app.use(cookieParser());
// app.use(bodyparser.json());
app.use(express.json());

const server = http.createServer(app);

server.listen(8080, () => {
    console.log('Server is running on port 8080');
});

mongoose.Promise = Promise;
mongoose.connect(process.env.MONGO_URL || "")

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log('Connected to MongoDB');
}
);
    // .then(() => {
    //     console.log('Connected to MongoDB');
    //     app.use('/', router()); 
    // })
    // .catch(err => {
    //     console.error('Error connecting to MongoDB:', err);
    // });

    app.use('/', router());
