CREATE TABLE IF NOT EXISTS Settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  siteName VARCHAR(255) NOT NULL DEFAULT '简单商城',
  siteDescription TEXT,
  logo VARCHAR(255),
  contactPhone VARCHAR(255),
  contactEmail VARCHAR(255),
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL
);