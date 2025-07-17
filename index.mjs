import express from 'express';
import getRouter from './routes/routes.js';
import cors from 'cors'
const app = express();

app.use(express.json());

app.use(cors());

app.use('/api' , getRouter);





app.get('/', (req, res) => {
    res.send('Hi there, Your server has successfully started');
});




app.listen(8000, () => {
    console.log('Your server started at port 8000');
});
