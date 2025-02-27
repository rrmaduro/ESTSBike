/*
  # Initial database schema for ESTSBike Club

  1. Tables
    - event_types: Stores different types of cycling events
    - events: Stores cycling events with references to their types
    - members: Stores club members
    - member_preferred_event_types: Junction table for member preferences
    - member_events: Junction table for event registrations

  2. Relationships
    - events -> event_types (many-to-one)
    - members <-> event_types (many-to-many through member_preferred_event_types)
    - members <-> events (many-to-many through member_events)

  3. Constraints
    - Foreign key constraints to maintain referential integrity
    - Unique constraints to prevent duplicates
    - NOT NULL constraints for required fields
*/

-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS estsbike;
USE estsbike;

-- Create a new user (if not already created) with strong password (change password)
CREATE USER IF NOT EXISTS 'estsbike_user'@'localhost' IDENTIFIED BY 'pw@20242025';

-- Grant full privileges on the estsbike database
GRANT ALL PRIVILEGES ON estsbike.* TO 'estsbike_user'@'localhost';

-- Apply changes
FLUSH PRIVILEGES;

-- Create event_types table if not already created
CREATE TABLE IF NOT EXISTS event_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Create members table if not already created
CREATE TABLE IF NOT EXISTS members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Create events table if not already created
CREATE TABLE IF NOT EXISTS events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type_id INT NOT NULL,
  name VARCHAR(200) NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_event_type FOREIGN KEY (type_id) REFERENCES event_types(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Create junction table for member preferred event types if not already created
CREATE TABLE IF NOT EXISTS member_preferred_event_types (
  member_id INT NOT NULL,
  event_type_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (member_id, event_type_id),
  CONSTRAINT fk_member_preferred FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
  CONSTRAINT fk_event_type_preferred FOREIGN KEY (event_type_id) REFERENCES event_types(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Create junction table for member event registrations if not already created
CREATE TABLE IF NOT EXISTS member_events (
  member_id INT NOT NULL,
  event_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (member_id, event_id),
  CONSTRAINT fk_member_event FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
  CONSTRAINT fk_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Insert event types if they don't already exist
INSERT INTO event_types (name) VALUES
  ('Passeio'),
  ('Competição'),
  ('Treino')
ON DUPLICATE KEY UPDATE name=name;

-- Insert some sample members if they don't already exist
INSERT INTO members (name) VALUES
  ('Alice Oliveira'),
  ('Bruno Silva'),
  ('Carlos Santos'),
  ('Daniela Costa')
ON DUPLICATE KEY UPDATE name=name;

-- Insert events if they don't already exist
INSERT INTO events (type_id, name, date) VALUES
  (1, 'Passeio pelo parque', '2025-03-10'),
  (2, 'Competição de estrada', '2025-03-15'),
  (3, 'Treino de resistência', '2025-03-20'),
  (1, 'Passeio pela praia', '2025-03-25'),
  (2, 'Competição de MTB', '2025-04-01')
ON DUPLICATE KEY UPDATE name=name, date=date;

-- Insert preferred event types for members if they don't already exist
INSERT INTO member_preferred_event_types (member_id, event_type_id) VALUES
  (1, 1),  -- Alice prefers Passeio
  (1, 2),  -- Alice prefers Competição
  (2, 1),  -- Bruno prefers Passeio
  (2, 3),  -- Bruno prefers Treino
  (3, 2),  -- Carlos prefers Competição
  (3, 3),  -- Carlos prefers Treino
  (4, 1),  -- Daniela prefers Passeio
  (4, 3)   -- Daniela prefers Treino
ON DUPLICATE KEY UPDATE member_id=member_id, event_type_id=event_type_id;

-- Insert member event registrations if they don't already exist
INSERT INTO member_events (member_id, event_id) VALUES
  (1, 1),  -- Alice participates in Passeio pelo parque
  (1, 2),  -- Alice participates in Competição de estrada
  (2, 1),  -- Bruno participates in Passeio pelo parque
  (2, 3),  -- Bruno participates in Treino de resistência
  (3, 2),  -- Carlos participates in Competição de estrada
  (3, 5),  -- Carlos participates in Competição de MTB
  (4, 1),  -- Daniela participates in Passeio pelo parque
  (4, 3)   -- Daniela participates in Treino de resistência
ON DUPLICATE KEY UPDATE member_id=member_id, event_id=event_id;

-- Query the views to confirm they work
SELECT * FROM view_event_types;
SELECT * FROM view_events;
SELECT * FROM view_members;
SELECT * FROM view_member_preferred_event_types;
SELECT * FROM view_member_events;
