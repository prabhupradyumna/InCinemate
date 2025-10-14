-- Sample data for BooknWatch platform

-- Insert sample users
INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'admin@screenlease.com', '$2b$10$example_hash', 'super_admin', 'Super', 'Admin', '+1234567890'),
('550e8400-e29b-41d4-a716-446655440001', 'cinema@downtown.com', '$2b$10$example_hash', 'admin', 'Cinema', 'Manager', '+1234567891'),
('550e8400-e29b-41d4-a716-446655440002', 'john.doe@email.com', '$2b$10$example_hash', 'customer', 'John', 'Doe', '+1234567892');

-- Insert sample venues
INSERT INTO venues (id, name, address, city, state, zip_code, phone, email, admin_id) VALUES
('660e8400-e29b-41d4-a716-446655440000', 'Downtown Cinema', '123 Main Street', 'New York', 'NY', '10001', '+1234567893', 'info@downtowncinema.com', '550e8400-e29b-41d4-a716-446655440001'),
('660e8400-e29b-41d4-a716-446655440001', 'Westside Theater', '456 West Ave', 'Los Angeles', 'CA', '90210', '+1234567894', 'info@westsidetheater.com', '550e8400-e29b-41d4-a716-446655440001');

-- Insert sample screens with seat maps
INSERT INTO screens (id, venue_id, name, total_seats, seat_map) VALUES
('770e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440000', 'Screen 1', 120, '{
  "rows": [
    {"row": "A", "seats": [1,2,3,4,5,6,7,8,9,10], "type": "vip"},
    {"row": "B", "seats": [1,2,3,4,5,6,7,8,9,10], "type": "diamond"},
    {"row": "C", "seats": [1,2,3,4,5,6,7,8,9,10,11,12], "type": "platinum"},
    {"row": "D", "seats": [1,2,3,4,5,6,7,8,9,10,11,12], "type": "platinum"},
    {"row": "E", "seats": [1,2,3,4,5,6,7,8,9,10,11,12], "type": "gold"},
    {"row": "F", "seats": [1,2,3,4,5,6,7,8,9,10,11,12], "type": "gold"},
    {"row": "G", "seats": [1,2,3,4,5,6,7,8,9,10,11,12], "type": "silver"},
    {"row": "H", "seats": [1,2,3,4,5,6,7,8,9,10,11,12], "type": "silver"},
    {"row": "I", "seats": [1,2,3,4,5,6,7,8,9,10,11,12], "type": "silver"},
    {"row": "J", "seats": [1,2,3,4,5,6,7,8,9,10,11,12], "type": "silver"}
  ]
}'),
('770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440000', 'Screen 2', 80, '{
  "rows": [
    {"row": "A", "seats": [1,2,3,4,5,6,7,8], "type": "vip"},
    {"row": "B", "seats": [1,2,3,4,5,6,7,8], "type": "diamond"},
    {"row": "C", "seats": [1,2,3,4,5,6,7,8], "type": "platinum"},
    {"row": "D", "seats": [1,2,3,4,5,6,7,8], "type": "platinum"},
    {"row": "E", "seats": [1,2,3,4,5,6,7,8], "type": "gold"},
    {"row": "F", "seats": [1,2,3,4,5,6,7,8], "type": "gold"},
    {"row": "G", "seats": [1,2,3,4,5,6,7,8], "type": "silver"},
    {"row": "H", "seats": [1,2,3,4,5,6,7,8], "type": "silver"},
    {"row": "I", "seats": [1,2,3,4,5,6,7,8], "type": "silver"},
    {"row": "J", "seats": [1,2,3,4,5,6,7,8], "type": "silver"}
  ]
}');

-- Insert sample movies
INSERT INTO movies (id, title, description, genre, duration_minutes, rating, release_date, poster_url, director, cast, language) VALUES
('880e8400-e29b-41d4-a716-446655440000', 'The Dark Knight Returns', 'Batman faces his greatest challenge yet in this epic conclusion to the trilogy.', 'Action/Drama', 165, 'PG-13', '2024-12-15', '/placeholder.svg?height=600&width=400', 'Christopher Nolan', ARRAY['Christian Bale', 'Heath Ledger', 'Aaron Eckhart'], 'English'),
('880e8400-e29b-41d4-a716-446655440001', 'Cosmic Journey', 'A thrilling space adventure that takes audiences to the edge of the universe.', 'Sci-Fi/Adventure', 142, 'PG-13', '2024-12-20', '/placeholder.svg?height=600&width=400', 'Denis Villeneuve', ARRAY['Ryan Gosling', 'Emma Stone', 'Oscar Isaac'], 'English'),
('880e8400-e29b-41d4-a716-446655440002', 'Love in Paris', 'A romantic comedy set in the beautiful streets of Paris.', 'Romance/Comedy', 118, 'PG', '2024-12-25', '/placeholder.svg?height=600&width=400', 'Nancy Meyers', ARRAY['Anne Hathaway', 'Hugh Jackman', 'Meryl Streep'], 'English');

-- Insert sample shows
INSERT INTO shows (id, movie_id, screen_id, venue_id, show_date, show_time, base_price, pricing_tiers) VALUES
('990e8400-e29b-41d4-a716-446655440000', '880e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440000', '2024-12-15', '19:00:00', 12.00, '{"vip": 25.00, "diamond": 20.00, "platinum": 18.00, "gold": 15.00, "silver": 12.00}'),
('990e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440000', '2024-12-15', '22:00:00', 12.00, '{"vip": 25.00, "diamond": 20.00, "platinum": 18.00, "gold": 15.00, "silver": 12.00}'),
('990e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440000', '2024-12-20', '20:00:00', 14.00, '{"vip": 30.00, "diamond": 25.00, "platinum": 20.00, "gold": 18.00, "silver": 14.00}'),
('990e8400-e29b-41d4-a716-446655440003', '880e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440000', '2024-12-25', '18:30:00', 10.00, '{"vip": 20.00, "diamond": 18.00, "platinum": 15.00, "gold": 12.00, "silver": 10.00}');
