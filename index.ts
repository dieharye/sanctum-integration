import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import http from 'http';

// Load environment variables from .env file
dotenv.config();

// for swagger documentation
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

import { PORT, connectDb as connectMongoDB } from './config';
import User from './routes/UserRoute';
import WalletRouter from './routes/WalletRoute';
import AdminRouter from './routes/AdminRoute';
// import cronjob from './cron';

// Connect to the MongoDB database
connectMongoDB();

// Create an instance of the Express application
const app = express();

const swaggerDocument = YAML.load('./swagger.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Set up Cross-Origin Resource Sharing (CORS) options
app.use(cors());

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, './public')));

// Parse incoming JSON requests using body-parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

const server = http.createServer(app);

// Define routes for different API endpoints
app.use('/user', User);
app.use('/wallet', WalletRouter);
app.use('/admin', AdminRouter);

// // Cron job
// cronjob.start()
// console.log("Cron job is running")

// Define a route to check if the backend server is running
app.get('/', async (req: any, res: any) => {
  res.send('Server is Running now!');
});

// Start the Express server to listen on the specified port
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
