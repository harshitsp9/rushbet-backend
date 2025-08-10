// Import packages onto app
import express, { Request } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';
// import rateLimit from 'express-rate-limit';
import routes from './routes/index';
import path from 'path';
import mongooseInit from './config/db';
import config from './config/envConfig';
// import bodyParser from 'body-parser';
import http from 'http'; // Import HTTP for WebSocket integration

// Setup .env variables for app usage

// Setup constant variables
const {
  PORT = 3008,
  // RATE_REQUEST_LIMIT = 100, RATE_TIME_LIMIT = 15
} = config;
// Init express app
const app = express();

// Create HTTP Server for WebSocket support
const server = http.createServer(app);

// Body parser for JSON
app.use(
  express.json({
    verify: (req: Request, res, buf) => {
      req.rawBody = buf; // Store raw body in req.rawBody for signature verification
    },
  })
);

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Detailed server logging
app.use(morgan('dev'));

app.use(cors());
// app.options('*', cors());

// Security Headers
app.use(helmet());

// Secure against param pollutions

app.use(hpp() as unknown as express.RequestHandler);

//for third party trust proxy
// Enable trust proxy
app.set('trust proxy', 1); // Adjust based on your setup, for most cases behind a single proxy

//DB connection establish
mongooseInit()
  .then(() => console.log('DB connection established'))
  .catch((error) => console.log('DB connection error', error));

// Setup routing
app.use('/api/v1', routes);
app.use('/', (_, res) => res.write('Test connection successfully established'));

// Listen to specified port in .env or default 5000
server.listen(PORT, () => {
  console.log(`Server is listening on: ${PORT}`);
});
