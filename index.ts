import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import http from 'http';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import { hlpHook, solHook } from './utils/solana';
import { PORT, connectDb as connectMongoDB } from './config';
import { getQuote, swapToLst} from './utils/sanctum'
import User from './routes/UserRoute';
import WalletRouter from './routes/WalletRoute';
import AdminRouter from './routes/AdminRoute';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
// import cronjob from './cron';

// Load environment variables from .env file
dotenv.config();

// Connect to the MongoDB database
connectMongoDB();

// Create an instance of the Express application
const app = express();

// Load Swagger documentation
const swaggerDocument = YAML.load('./swagger.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Set up Cross-Origin Resource Sharing (CORS) options
app.use(cors());

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, './public')));

// Parse incoming JSON requests
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Define routes for different API endpoints
app.use('/user', User);
app.use('/wallet', WalletRouter);
app.use('/admin', AdminRouter);

// // Start cron job if needed
// cronjob.start();
// console.log("Cron job is running");

// Define a route to check if the backend server is running
app.get('/', (req, res) => {
  res.send('Server is Running now!');
});

// let amount:number
// const main = async () => {
//   amount = Number(await getAdminBalance())
//   burnToken("4Y2QYrRGYonzy8R3fJ4cmLXies6q6tLFJF7ThNFbWfwx", amount)
// }
// main()


// solHook()
//  hlpHook();
// getAdminHLPToken()
// Start the Express server to listen on the specified port
const server = http.createServer(app);
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
