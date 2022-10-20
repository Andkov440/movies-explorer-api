require('dotenv').config();

const express = require('express');
const helmet = require('helmet');

const mongoose = require('mongoose');
const { errors } = require('celebrate');

const {
  validationCreateUser,
  validationLogin,
} = require('./middlewares/validations');

const errorHandler = require('./middlewares/errorHandler');
const { createUser, login } = require('./controllers/users');
const routes = require('./routes');

const { requestLogger, errorLogger } = require('./middlewares/logger');
const cors = require('./middlewares/cors');
const limiter = require('./middlewares/limiter');

const { PORT = 3000 } = process.env;
const app = express();
app.use(helmet());

app.use(express.json());

app.use(cors);

app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер может упасть');
  }, 0);
});

app.use(requestLogger);
app.use(limiter);
app.post('/signin', validationLogin, login);
app.post('/signup', validationCreateUser, createUser);
app.use(limiter);
app.use(routes);
app.use(errorLogger);
app.use(errors());
app.use(errorHandler);

mongoose.connect('mongodb://localhost:27017/moviesdb', {
  useNewUrlParser: true,
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
