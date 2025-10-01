import { defineMovie } from './Movie.js'
import { defineActor } from './Actor.js'
import { defineCrewPerson } from './CrewPerson.js'
import { defineMovieCast } from './MovieCast.js'
import { defineMovieCrew } from './MovieCrew.js'
import { defineMovieReview } from './MovieReview.js'
import { defineMovieSong } from './MovieSong.js'

export function setupMovieRelationships(sequelize) {
  // Define all models
  const Movie = defineMovie(sequelize)
  const Actor = defineActor(sequelize)
  const CrewPerson = defineCrewPerson(sequelize)
  const MovieCast = defineMovieCast(sequelize)
  const MovieCrew = defineMovieCrew(sequelize)
  const MovieReview = defineMovieReview(sequelize)
  const MovieSong = defineMovieSong(sequelize)

  // ===========================
  // MOVIE RELATIONSHIPS
  // ===========================

  // Movie -> MovieCast (One-to-Many)
  Movie.hasMany(MovieCast, {
    foreignKey: 'movie_id',
    as: 'castMembers',
    onDelete: 'CASCADE'
  })
  MovieCast.belongsTo(Movie, {
    foreignKey: 'movie_id',
    as: 'movie'
  })

  // Movie -> MovieCrew (One-to-Many)
  Movie.hasMany(MovieCrew, {
    foreignKey: 'movie_id',
    as: 'crewMembers',
    onDelete: 'CASCADE'
  })
  MovieCrew.belongsTo(Movie, {
    foreignKey: 'movie_id',
    as: 'movie'
  })

  // Movie -> MovieReview (One-to-Many)
  Movie.hasMany(MovieReview, {
    foreignKey: 'movie_id',
    as: 'reviews',
    onDelete: 'CASCADE'
  })
  MovieReview.belongsTo(Movie, {
    foreignKey: 'movie_id',
    as: 'movie'
  })

  // Movie -> MovieSong (One-to-Many)
  Movie.hasMany(MovieSong, {
    foreignKey: 'movie_id',
    as: 'songs',
    onDelete: 'CASCADE'
  })
  MovieSong.belongsTo(Movie, {
    foreignKey: 'movie_id',
    as: 'movie'
  })

  // ===========================
  // ACTOR RELATIONSHIPS
  // ===========================

  // Actor -> MovieCast (One-to-Many)
  Actor.hasMany(MovieCast, {
    foreignKey: 'actor_id',
    as: 'movieRoles',
    onDelete: 'RESTRICT'
  })
  MovieCast.belongsTo(Actor, {
    foreignKey: 'actor_id',
    as: 'actor'
  })

  // ===========================
  // CREW RELATIONSHIPS
  // ===========================

  // CrewPerson -> MovieCrew (One-to-Many)
  CrewPerson.hasMany(MovieCrew, {
    foreignKey: 'person_id',
    as: 'movieCredits',
    onDelete: 'RESTRICT'
  })
  MovieCrew.belongsTo(CrewPerson, {
    foreignKey: 'person_id',
    as: 'person'
  })

  // ===========================
  // MANY-TO-MANY RELATIONSHIPS
  // ===========================

  // Movie <-> Actor (Through MovieCast)
  Movie.belongsToMany(Actor, {
    through: MovieCast,
    foreignKey: 'movie_id',
    otherKey: 'actor_id',
    as: 'actors'
  })
  Actor.belongsToMany(Movie, {
    through: MovieCast,
    foreignKey: 'actor_id',
    otherKey: 'movie_id',
    as: 'movies'
  })

  // Movie <-> CrewPerson (Through MovieCrew)
  Movie.belongsToMany(CrewPerson, {
    through: MovieCrew,
    foreignKey: 'movie_id',
    otherKey: 'person_id',
    as: 'crewPersons'
  })
  CrewPerson.belongsToMany(Movie, {
    through: MovieCrew,
    foreignKey: 'person_id',
    otherKey: 'movie_id',
    as: 'movies'
  })

  // Return all models for use
  return {
    Movie,
    Actor,
    CrewPerson,
    MovieCast,
    MovieCrew,
    MovieReview,
    MovieSong
  }
}

// ===========================
// HELPER FUNCTIONS
// ===========================

export async function syncAllMovieTables(sequelize) {
  const models = setupMovieRelationships(sequelize)
  
  // Sync in correct order (independent tables first, then dependent)
  await models.Movie.sync()
  await models.Actor.sync()
  await models.CrewPerson.sync()
  await models.MovieCast.sync()
  await models.MovieCrew.sync()
  await models.MovieReview.sync()
  await models.MovieSong.sync()
  
  return models
}

// Get movie with all related data
export async function getMovieWithAllRelations(sequelize, movieId) {
  const models = setupMovieRelationships(sequelize)
  
  return await models.Movie.findByPk(movieId, {
    include: [
      {
        model: models.MovieCast,
        as: 'castMembers',
        include: [{
          model: models.Actor,
          as: 'actor'
        }],
        order: [['display_order', 'ASC']]
      },
      {
        model: models.MovieCrew,
        as: 'crewMembers',
        include: [{
          model: models.CrewPerson,
          as: 'person'
        }],
        order: [['display_order', 'ASC']]
      },
      {
        model: models.MovieReview,
        as: 'reviews',
        where: { status: 'approved' },
        required: false,
        order: [['display_order', 'ASC'], ['created_at', 'DESC']]
      },
      {
        model: models.MovieSong,
        as: 'songs',
        order: [['display_order', 'ASC']]
      }
    ]
  })
}

// Search movies with cast/crew
export async function searchMoviesWithCastCrew(sequelize, searchParams) {
  const models = setupMovieRelationships(sequelize)
  const { title, actor, director, genre, limit = 10, offset = 0 } = searchParams
  
  const whereClause = {}
  const include = []
  
  if (title) {
    whereClause.title = {
      [sequelize.Sequelize.Op.iLike]: `%${title}%`
    }
  }
  
  if (genre) {
    whereClause.genres = {
      [sequelize.Sequelize.Op.contains]: [genre]
    }
  }
  
  // Include cast if searching by actor
  if (actor) {
    include.push({
      model: models.MovieCast,
      as: 'castMembers',
      include: [{
        model: models.Actor,
        as: 'actor',
        where: {
          name: {
            [sequelize.Sequelize.Op.iLike]: `%${actor}%`
          }
        }
      }],
      required: true
    })
  }
  
  // Include crew if searching by director
  if (director) {
    include.push({
      model: models.MovieCrew,
      as: 'crewMembers',
      include: [{
        model: models.CrewPerson,
        as: 'person',
        where: {
          name: {
            [sequelize.Sequelize.Op.iLike]: `%${director}%`
          }
        }
      }],
      where: {
        role_title: {
          [sequelize.Sequelize.Op.iLike]: '%director%'
        }
      },
      required: true
    })
  }
  
  return await models.Movie.findAndCountAll({
    where: whereClause,
    include,
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['created_at', 'DESC']],
    distinct: true
  })
}