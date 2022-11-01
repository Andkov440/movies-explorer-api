require('dotenv').config();

const express = require('express');
const helmet = require('helmet');

const mongoose = require('mongoose');
const { errors } = require('celebrate');

const errorHandler = require('./middlewares/errorHandler');
const routes = require('./routes');

const { requestLogger, errorLogger } = require('./middlewares/logger');
const cors = require('./middlewares/cors');
const limiter = require('./middlewares/limiter');

const {
  NODE_ENV,
  PORT = 3000,
  DB_ADDRESS,
} = process.env;

const app = express();
app.use(helmet());

app.use(express.json());

app.use(cors);

app.use(requestLogger);
app.use(limiter);
app.use(routes);
app.use(errorLogger);
app.use(errors());
app.use(errorHandler);

mongoose.connect(`${NODE_ENV === 'production' ? DB_ADDRESS : 'mongodb://localhost:27017/moviesdb'}`, {
  useNewUrlParser: true,
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
