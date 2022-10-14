// node and npm modules
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// user created modules
const globalErrorHandler = require('./controllers/errorController');
const userRouter = require('./routes/userRoutes');

const app = express();

// Development Loggers
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Set security HTTP headers
app.use(helmet());

// Allow all origins to interact with the API
app.use(cors());
app.options('*', cors());

// Body parsing middlewares
app.use(express.json());

// -------------------------------------
// API Routes

app.use('/api/v1/user', userRouter);

app.all('*', (req, res, next) => {
  res.status(404).json({
    status: 'fail',
    message: `Can't ${req.method} ${req.originalUrl} on this server`,
  });
});

// Global Error Handling Middleware
app.use(globalErrorHandler);

module.exports = app;
