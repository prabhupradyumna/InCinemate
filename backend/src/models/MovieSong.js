import { DataTypes } from 'sequelize'

export function defineMovieSong(sequelize) {
  return sequelize.define(
    'MovieSong',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      movie_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'movies',
          key: 'id'
        },
        onDelete: 'CASCADE',
        comment: 'Reference to the movie'
      },
      
      // Song Details
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Song title'
      },
      duration_seconds: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Song duration in seconds'
      },
      display_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Order in soundtrack listing'
      },
      
      // Music Credits
      singers: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: [],
        comment: 'Array of singer names'
      },
      lyricist: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Lyricist name'
      },
      composer: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Music composer (can be different from movie music director)'
      },
      
      // Media URLs
      audio_url: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Audio stream URL (Spotify/YouTube/Apple Music)'
      },
      video_url: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Music video URL (if available)'
      },
      lyrics_url: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Link to full lyrics'
      },
      
      // Song Metadata
      language: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Hindi',
        comment: 'Song language'
      },
      song_type: {
        type: DataTypes.ENUM('title_track', 'romantic', 'dance', 'sad', 'devotional', 'item_number', 'background', 'other'),
        allowNull: true
      },
      is_featured: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Whether this is a featured/popular song'
      },
      
      // Analytics
      play_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: 'Number of plays/streams'
      },
      likes_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: 'Number of likes'
      },
      
      // Administrative
      created_by: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Admin who added this song'
      },
    },
    { 
      tableName: 'movie_songs',
      indexes: [
        {
          fields: ['movie_id']
        },
        {
          fields: ['display_order']
        },
        {
          fields: ['song_type']
        },
        {
          fields: ['is_featured']
        },
        {
          fields: ['language']
        }
      ]
    },
  )
}