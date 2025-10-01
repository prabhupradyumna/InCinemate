import { DataTypes } from 'sequelize'

export function defineMovieReview(sequelize) {
  return sequelize.define(
    'MovieReview',
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
      review_type: {
        type: DataTypes.ENUM('critic', 'editorial', 'user_featured'),
        allowNull: false,
        comment: 'Type of review'
      },
      
      // Reviewer Information
      reviewer_name: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Name of the reviewer/critic'
      },
      reviewer_title: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Reviewer title (e.g., "Film Critic", "Entertainment Editor")'
      },
      publication: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Publication name (e.g., "Times of India", "Hindustan Times")'
      },
      publication_logo_url: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Publication logo image URL'
      },
      reviewer_image_url: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Reviewer profile image URL'
      },
      
      // Review Content
      rating: {
        type: DataTypes.DECIMAL(2, 1),
        allowNull: true,
        comment: 'Review rating (e.g., 4.5 out of 5)'
      },
      rating_scale: {
        type: DataTypes.STRING(10),
        defaultValue: '5',
        comment: 'Rating scale (5, 10, 100)'
      },
      review_title: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: 'Title/headline of the review'
      },
      review_quote: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'Short excerpt from review (displayed on movie page)'
      },
      full_review_text: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Full review content (optional)'
      },
      review_url: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Link to original review'
      },
      
      // Review Metadata
      review_date: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: 'Date when review was published'
      },
      language: {
        type: DataTypes.STRING(50),
        defaultValue: 'English',
        comment: 'Language of the review'
      },
      is_featured: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Whether to feature this review prominently'
      },
      is_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        comment: 'Whether review is verified/authentic'
      },
      display_order: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: 'Order for displaying reviews'
      },
      
      // Sentiment & Analytics
      sentiment: {
        type: DataTypes.ENUM('positive', 'mixed', 'negative'),
        allowNull: true,
        comment: 'Overall sentiment of the review'
      },
      likes_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: 'Number of likes on this review'
      },
      helpful_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: 'Number of "helpful" votes'
      },
      
      // Administrative
      status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected', 'archived'),
        defaultValue: 'pending',
        comment: 'Review moderation status'
      },
      created_by: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Admin who added this review'
      },
      approved_by: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Admin who approved this review'
      },
      approved_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'When the review was approved'
      },
      rejection_reason: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Reason for rejection (if applicable)'
      },
    },
    { 
      tableName: 'movie_reviews',
      indexes: [
        {
          fields: ['movie_id']
        },
        {
          fields: ['review_type']
        },
        {
          fields: ['status']
        },
        {
          fields: ['is_featured']
        },
        {
          fields: ['publication']
        },
        {
          fields: ['sentiment']
        },
        {
          fields: ['review_date']
        }
      ]
    },
  )
}