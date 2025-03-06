-- MySQL dump 10.13  Distrib 8.0.26, for macos11 (x86_64)
--
-- Host: 127.0.0.1    Database: mall
-- ------------------------------------------------------
-- Server version	8.3.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Products`
--

DROP TABLE IF EXISTS `Products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  `price` decimal(10,2) NOT NULL,
  `stock` int NOT NULL DEFAULT '0',
  `image` varchar(255) DEFAULT NULL,
  `category` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Products`
--

LOCK TABLES `Products` WRITE;
/*!40000 ALTER TABLE `Products` DISABLE KEYS */;
INSERT INTO `Products` VALUES (1,'北欧简约真皮沙发','进口头层牛皮，三人位+贵妃榻，舒适耐用',4999.00,50,'/images/products/sofa1.jpg','客厅家具','2025-03-04 23:24:35','2025-03-04 23:24:35'),(2,'实木餐桌椅组合','美国进口白橡木，一桌六椅，环保无甲醛',3299.00,30,'/images/products/dining1.jpg','餐厅家具','2025-03-04 23:24:35','2025-03-04 23:24:35'),(3,'轻奢大理石茶几','意大利进口大理石面，钛金不锈钢支架',1999.00,100,'/images/products/table1.jpg','客厅家具','2025-03-04 23:24:35','2025-03-04 23:24:35'),(4,'现代简约床架','1.8米双人床，高箱储物，环保板材',2599.00,80,'/images/products/bed1.jpg','卧室家具','2025-03-04 23:24:35','2025-03-04 23:24:35'),(5,'北欧风格衣柜','对开门衣柜，德国进口五金，静音滑轨',3699.00,40,'/images/products/wardrobe1.jpg','卧室家具','2025-03-04 23:24:35','2025-03-04 23:24:35'),(6,'书房办公桌','环保实木，带书架组合，多功能设计',1499.00,60,'/images/products/desk1.jpg','书房家具','2025-03-04 23:24:35','2025-03-04 23:24:35'),(7,'儿童床','环保松木，带护栏，可升降床头',1299.00,45,'/images/products/kidbed1.jpg','儿童家具','2025-03-04 23:24:35','2025-03-04 23:24:35'),(8,'玄关柜','简约现代，超薄设计，大容量收纳',899.00,70,'/images/products/cabinet1.jpg','玄关家具','2025-03-04 23:24:35','2025-03-04 23:24:35');
/*!40000 ALTER TABLE `Products` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-03-05  1:05:13
