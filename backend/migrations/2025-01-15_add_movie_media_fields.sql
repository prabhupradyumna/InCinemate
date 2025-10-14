-- Migration: Add News/Reviews, Movie Songs, and Gallery Images fields to movies table
-- Date: 2025-01-15
-- Description: Adds new JSONB fields for storing YouTube links and gallery images

-- Add movie_songs field for storing song information with YouTube links
ALTER TABLE movies 
ADD COLUMN IF NOT EXISTS movie_songs JSONB DEFAULT '[]'::jsonb;

-- Add news_reviews field for storing news and review information with YouTube links  
ALTER TABLE movies 
ADD COLUMN IF NOT EXISTS news_reviews JSONB DEFAULT '[]'::jsonb;

-- Add gallery_images field for storing gallery and poster information
ALTER TABLE movies 
ADD COLUMN IF NOT EXISTS gallery_images JSONB DEFAULT '[]'::jsonb;

-- Add comments to document the new fields
COMMENT ON COLUMN movies.movie_songs IS 'Array of movie song objects with YouTube links: [{name: "Song Name", youtube_url: "https://youtube.com/watch?v=...", duration: "3:45"}]';
COMMENT ON COLUMN movies.news_reviews IS 'Array of news/review objects with YouTube links: [{title: "Review Title", youtube_url: "https://youtube.com/watch?v=...", source: "Channel Name", published_date: "2024-01-15"}]';
COMMENT ON COLUMN movies.gallery_images IS 'Array of gallery image objects: [{name: "Image Name", image_url: "/uploads/gallery/image.jpg", type: "poster|still|behind_scenes", display_order: 1}]';

-- Create indexes for better query performance on the new JSONB fields
CREATE INDEX IF NOT EXISTS idx_movies_movie_songs ON movies USING GIN (movie_songs);
CREATE INDEX IF NOT EXISTS idx_movies_news_reviews ON movies USING GIN (news_reviews);
CREATE INDEX IF NOT EXISTS idx_movies_gallery_images ON movies USING GIN (gallery_images);
