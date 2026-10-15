CREATE DATABASE IF NOT EXISTS visitlocals CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE visitlocals;

CREATE TABLE IF NOT EXISTS inquiries (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  inquiry_type VARCHAR(80) NOT NULL,
  source_page VARCHAR(120) NULL,
  content_type VARCHAR(80) NULL,
  content_id VARCHAR(120) NULL,
  content_title VARCHAR(255) NULL,
  service_id VARCHAR(120) NULL,
  service_title VARCHAR(255) NULL,
  destination VARCHAR(160) NULL,
  full_name VARCHAR(160) NULL,
  email VARCHAR(254) NULL,
  phone VARCHAR(80) NULL,
  company VARCHAR(255) NULL,
  message TEXT NULL,
  payload_json LONGTEXT NULL,
  status ENUM('new','in_review','contacted','qualified','converted','closed','spam') NOT NULL DEFAULT 'new',
  ip_hash CHAR(64) NULL,
  user_agent VARCHAR(500) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_inquiry_type (inquiry_type),
  KEY idx_status_created (status,created_at),
  KEY idx_content (content_type,content_id),
  KEY idx_service (service_id),
  KEY idx_email (email),
  KEY idx_ip_created (ip_hash,created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS subscribers (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  email VARCHAR(254) NOT NULL,
  source_page VARCHAR(120) NULL,
  status ENUM('active','unsubscribed') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id), UNIQUE KEY uq_subscriber_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS experiences (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug VARCHAR(160) NOT NULL,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(120) NULL,
  destination VARCHAR(160) NULL,
  duration VARCHAR(80) NULL,
  price_from DECIMAL(12,2) NULL,
  currency CHAR(3) DEFAULT 'USD',
  short_description TEXT NULL,
  description LONGTEXT NULL,
  status ENUM('draft','published','archived') DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY(id), UNIQUE KEY uq_experience_slug(slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS destinations (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug VARCHAR(160) NOT NULL,
  name VARCHAR(160) NOT NULL,
  region VARCHAR(160) NULL,
  short_description TEXT NULL,
  description LONGTEXT NULL,
  status ENUM('draft','published','archived') DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY(id), UNIQUE KEY uq_destination_slug(slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS business_services (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug VARCHAR(160) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description LONGTEXT NULL,
  status ENUM('draft','published','archived') DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY(id), UNIQUE KEY uq_business_service_slug(slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS insights (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug VARCHAR(180) NOT NULL,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(120) NULL,
  excerpt TEXT NULL,
  body LONGTEXT NULL,
  status ENUM('draft','published','archived') DEFAULT 'draft',
  published_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY(id), UNIQUE KEY uq_insight_slug(slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS partners (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  full_name VARCHAR(160) NULL,
  business_name VARCHAR(255) NULL,
  email VARCHAR(254) NULL,
  phone VARCHAR(80) NULL,
  location VARCHAR(160) NULL,
  category VARCHAR(120) NULL,
  interests_json TEXT NULL,
  message LONGTEXT NULL,
  status ENUM('new','in_review','approved','rejected','archived') DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY(id), KEY idx_partner_status(status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
