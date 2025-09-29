import { DataTypes } from 'sequelize'

export function defineMovie(sequelize) {
  return sequelize.define(
    'Movie',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      poster_url: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      trailer_url: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      synopsis: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      cast: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: [],
        comment: 'Array of cast members: [{ name: "Actor Name", role: "Character" }]'
      },
      genre: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      duration_minutes: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Movie duration in minutes'
      },
      release_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      rating: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Movie rating (U, U/A, A, etc.)'
      },
      language: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'English'
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      tenant_id: {
        type: DataTypes.STRING,
        allowNull: false,
        index: true,
        comment: 'Admin tenant who owns this movie'
      },
    },
    { 
      tableName: 'movies',
      indexes: [
        {
          fields: ['tenant_id', 'is_active']
        },
        {
          fields: ['title']
        },
        {
          fields: ['genre']
        }
      ]
    },
  )
}
