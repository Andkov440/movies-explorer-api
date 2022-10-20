const Movie = require('../models/movie');

const { REQUEST_OK, CREATE_OK } = require('../utils/constants');

const NotFoundError = require('../errors/notFoundError');
const ValidationError = require('../errors/validationError');
const ServerError = require('../errors/serverError');
const ForbiddenError = require('../errors/forbiddenError');

const getMovies = (req, res, next) => {
  Movie.find({})
    .populate('owner')
    .then((movies) => res.send(movies))
    .catch(next);
};

const createMovie = (req, res, next) => {
  const owner = req.user._id;
  Movie.create({ owner, ...req.body })
    .then((movie) => res.status(CREATE_OK).send(movie))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(
          new ValidationError('Переданы некорректные данные при создании фильма'),
        );
      }
      return next(new ServerError('Произошла ошибка'));
    });
};

const deleteMovie = (req, res, next) => {
  const { id } = req.params;
  return Movie.findById(id)
    .orFail(() => {
      throw new NotFoundError('Фильм с указанным _id не найден');
    })
    .then((card) => {
      if (card.owner.toString() === req.user._id) {
        Movie.findByIdAndRemove(id).then(() => res.status(REQUEST_OK).send(card)).catch(next);
      } else {
        next(new ForbiddenError('Отказано в доступе'));
      }
    })
    .catch(next);
};

module.exports = {
  getMovies,
  createMovie,
  deleteMovie,
};
