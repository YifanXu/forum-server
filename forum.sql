-- MySQL dump 10.13  Distrib 8.0.38, for Win64 (x86_64)
--
-- Host: localhost    Database: forum
-- ------------------------------------------------------
-- Server version	9.0.1

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
-- Table structure for table `forum`
--

DROP TABLE IF EXISTS `forum`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `forum` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(225) DEFAULT NULL,
  `description` varchar(225) NOT NULL,
  `threadCount` int NOT NULL DEFAULT '0',
  `lastUpdatedThread` int DEFAULT NULL,
  `icon` varchar(225) DEFAULT NULL,
  `category` varchar(45) DEFAULT 'Main Forums',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `forum`
--

LOCK TABLES `forum` WRITE;
/*!40000 ALTER TABLE `forum` DISABLE KEYS */;
INSERT INTO `forum` VALUES (1,'Lore Discussion','Explore the intricate lore behind your favorite roguelikes.',7,16,'','Main Forums'),(2,'Gameplay Strategies','Share tips, tricks, and strategies for conquering roguelikes.',2,5,'','Main Forums'),(3,'Modding and Custom Content','Discuss mods and create custom content.',1,6,'','Main Forums'),(4,'Community Challenges','Join challenges and share your results!',3,9,'','Main Forums'),(5,'Speedrunning','Discuss techniques and strategies for speedrunning roguelikes.',3,12,'','Main Forums'),(6,'Off topic','Feel free to post anything here!',1,17,NULL,'Miscellaneous');
/*!40000 ALTER TABLE `forum` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `post`
--

DROP TABLE IF EXISTS `post`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `post` (
  `id` int NOT NULL AUTO_INCREMENT,
  `author` int NOT NULL,
  `time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `content` text NOT NULL,
  `threadID` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `post_author_fk_idx` (`author`),
  CONSTRAINT `post_author_fk` FOREIGN KEY (`author`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `post`
--

LOCK TABLES `post` WRITE;
/*!40000 ALTER TABLE `post` DISABLE KEYS */;
INSERT INTO `post` VALUES (1,1,'2024-12-04 15:00:00','I believe the Gungeon was created as a paradoxical weapon.',1),(2,3,'2024-12-04 16:00:00','Interesting theory! Do you think it ties to the Lich\'s timeline?',1),(3,2,'2024-12-04 17:00:00','The Lich being an echo of failure makes sense!',1),(4,3,'2024-12-04 18:00:00','Does anyone know how Spelunky\'s golden idol works in the lore?',2),(5,3,'2024-12-04 19:00:00','Dead Cells lore is vague, but I think the island resets with the King\'s curse.',3),(6,2,'2024-12-04 20:00:00','For the Gungeon, a great synergy is the Ice Bomb + Cold Reality passive.',4),(7,3,'2024-12-04 21:00:00','Speedrunners often use the Bullet character for quicker clears.',4),(8,2,'2024-12-04 22:00:00','No-hit boss runs are easiest with dodge upgrades.',5),(9,1,'2024-12-04 23:00:00','I created a level where Zagreus fights the Hydra in chaos!',6),(10,2,'2024-12-05 00:00:00','This week\'s no-damage challenge is brutal but rewarding.',7),(11,3,'2024-12-05 01:00:00','Agreed! I barely made it past the first boss.',7),(12,1,'2024-12-05 02:00:00','Pro tip: Use the shield item to block projectiles!',7),(13,2,'2024-12-05 03:00:00','Good luck with the final boss—it\'s the toughest.',7),(14,3,'2024-12-05 04:00:00','Thanks! I finally completed it with no damage.',7),(15,1,'2024-12-05 05:00:00','Here\'s my idea: A Hydra that splits into mini-bosses!',8),(16,2,'2024-12-05 06:00:00','Love it! Would you add special patterns for each mini-boss?',8),(17,1,'2024-12-05 07:00:00','I beat the game with only fists! It was grueling.',9),(18,2,'2024-12-05 08:00:00','Best routes in Spelunky always involve the jungle.',10),(19,3,'2024-12-05 09:00:00','For me, the black market route is optimal.',10),(20,1,'2024-12-05 10:00:00','Using bombs strategically saves tons of time.',10),(21,3,'2024-12-05 11:00:00','Timerless runs are perfect for practicing combos.',11),(22,1,'2024-12-05 12:00:00','Dead Cells speed tech: Always use the grapple hook.',12),(23,2,'2024-12-05 13:00:00','Dash resets are critical for advanced runs.',12),(25,7,'2024-12-07 02:12:46','<p>You guys are definitely out of your mind.</p>',1),(26,7,'2024-12-07 03:23:15','<p>Hey guys, my relatives just gave me a bag full of potatoes and I have no idea what to do with it. Any one got some good recipes to share? ty</p><p><br></p><p>I don\'t have a deep frier tho so fries are out of the question for me.</p>',13),(27,8,'2024-12-07 04:23:03','<p>This is the wrong subforum for this buddy. There is a place literally called <strong>\"off-topic\"</strong> just for pitiful folks  like you who feel the need to ask for potato recipes online because you lack friends in real life to talk with, so you have to resort to beg on internet forums.</p><p><br></p><p>Go upstairs and ask your mom about the recipes, I\'m sure she has a ton of those since she probably looks like a potato herself.</p>',13),(28,7,'2024-12-07 04:55:52','<p>Wow, aren\'t you just a bundle of joy</p>',13),(29,7,'2024-12-07 04:57:34','<p>Why would you do that to yourself?</p>',9),(30,7,'2024-12-07 04:58:10','<p>test test</p>',9),(31,7,'2024-12-07 06:07:51','<p>It works with it own rules.</p>',2),(32,7,'2024-12-07 06:12:24','<p>Hey guys, I thought I\'d create a thread where we introduce ourselves. Feel free to chime in.</p><p><br></p><p>I\'m a diehard gacha gamer, who got interested in roguelikes through roguelike modes in gacha games. My favorite roguelike is definitely Slay the Spire. That game really makes time fly fast!</p>',14),(33,7,'2024-12-07 06:14:14','<p>test</p>',15),(34,7,'2024-12-07 06:19:02','<p>Hey guys, I thought I\'d create a thread where we introduce ourselves. Feel free to chime in.</p><p><br></p><p>I\'m a diehard gacha gamer, who got interested in roguelikes through roguelike modes in gacha games. My favorite roguelike is definitely Slay the Spire. That game really makes time fly fast!</p>',16),(35,7,'2024-12-07 06:19:23','<p>Hey guys, I thought I\'d create a thread where we introduce ourselves. Feel free to chime in.</p><p><br></p><p>I\'m a diehard gacha gamer, who got interested in roguelikes through roguelike modes in gacha games. My favorite roguelike is definitely Slay the Spire. That game really makes time fly fast!</p>',17);
/*!40000 ALTER TABLE `post` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `session_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_used_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `auth_count` int NOT NULL DEFAULT '0',
  `active` tinyint NOT NULL DEFAULT '1',
  PRIMARY KEY (`session_id`),
  KEY `session_user_id_fk_idx` (`user_id`),
  CONSTRAINT `session_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=138 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` VALUES (124,7,'2024-12-07 01:52:34','2024-12-07 01:52:34',0,1),(125,7,'2024-12-07 01:53:57','2024-12-07 01:53:57',0,1),(126,7,'2024-12-07 01:55:22','2024-12-07 01:55:22',0,1),(127,7,'2024-12-07 01:55:51','2024-12-07 01:55:51',0,1),(128,7,'2024-12-07 01:56:49','2024-12-07 01:56:49',0,1),(129,7,'2024-12-07 01:58:58','2024-12-07 01:58:58',0,1),(130,7,'2024-12-07 01:59:29','2024-12-07 02:12:46',7,1),(131,7,'2024-12-07 02:55:44','2024-12-07 02:55:44',0,1),(132,7,'2024-12-07 02:58:08','2024-12-07 02:58:08',0,1),(133,7,'2024-12-07 03:04:33','2024-12-07 03:04:33',0,1),(134,7,'2024-12-07 03:05:19','2024-12-07 03:23:15',2,1),(135,8,'2024-12-07 04:18:40','2024-12-07 04:25:01',3,1),(136,7,'2024-12-07 04:55:33','2024-12-07 05:07:16',33,1),(137,7,'2024-12-07 05:52:38','2024-12-07 06:21:10',112,1);
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `thread`
--

DROP TABLE IF EXISTS `thread`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `thread` (
  `id` int NOT NULL AUTO_INCREMENT,
  `parentForumId` int NOT NULL,
  `title` varchar(225) NOT NULL,
  `initialPost` int DEFAULT NULL,
  `lastPost` int DEFAULT NULL,
  `postCount` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `thread_parentForumId_idx` (`parentForumId`),
  CONSTRAINT `thread_parentForumId` FOREIGN KEY (`parentForumId`) REFERENCES `forum` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `thread`
--

LOCK TABLES `thread` WRITE;
/*!40000 ALTER TABLE `thread` DISABLE KEYS */;
INSERT INTO `thread` VALUES (1,1,'The Origin of the Gungeon',1,25,4),(2,1,'Hidden Secrets of Spelunky',4,31,2),(3,1,'The Mystery of Dead Cells',5,5,1),(4,2,'Best Builds for Enter the Gungeon',6,7,2),(5,2,'How to Perfect No-Hit Boss Runs',8,8,1),(6,3,'Custom Levels in Hades',9,9,1),(7,4,'Weekly Challenge: No-Damage Run',10,14,5),(8,4,'Creative Boss Fights',15,16,2),(9,4,'Only Fists Challenge!',17,30,3),(10,5,'Fastest Routes in Spelunky',18,20,3),(11,5,'Timerless Gungeon Runs',21,21,1),(12,5,'Advanced Techniques for Dead Cells',22,23,2),(13,1,'Anyone got a good recipe for potatoes?',26,28,3),(14,1,'Introductions',32,32,1),(15,1,'test',33,33,1),(16,1,'Introductions',34,34,1),(17,6,'Introductions 3',35,35,1);
/*!40000 ALTER TABLE `thread` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user-forum`
--

DROP TABLE IF EXISTS `user-forum`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user-forum` (
  `userID` int NOT NULL,
  `forumID` int NOT NULL,
  `time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`userID`,`forumID`),
  KEY `userid_idx` (`userID`),
  KEY `forumid` (`forumID`),
  CONSTRAINT `forumid` FOREIGN KEY (`forumID`) REFERENCES `forum` (`id`) ON DELETE CASCADE,
  CONSTRAINT `userid` FOREIGN KEY (`userID`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user-forum`
--

LOCK TABLES `user-forum` WRITE;
/*!40000 ALTER TABLE `user-forum` DISABLE KEYS */;
INSERT INTO `user-forum` VALUES (7,6,'2024-12-07 06:08:17');
/*!40000 ALTER TABLE `user-forum` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user-thread`
--

DROP TABLE IF EXISTS `user-thread`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user-thread` (
  `userID` int NOT NULL,
  `threadID` int NOT NULL,
  `time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`userID`,`threadID`),
  KEY `threadID_idx` (`threadID`),
  KEY `fk_threadID_idx` (`threadID`) /*!80000 INVISIBLE */,
  KEY `threadid_idx_fk` (`threadID`),
  CONSTRAINT `user-thread-threadid` FOREIGN KEY (`threadID`) REFERENCES `thread` (`id`),
  CONSTRAINT `user-thread-userid` FOREIGN KEY (`userID`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user-thread`
--

LOCK TABLES `user-thread` WRITE;
/*!40000 ALTER TABLE `user-thread` DISABLE KEYS */;
INSERT INTO `user-thread` VALUES (7,2,'2024-12-07 06:07:34'),(7,17,'2024-12-07 06:19:36');
/*!40000 ALTER TABLE `user-thread` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(225) NOT NULL,
  `flair` varchar(225) DEFAULT 'Hello world!',
  `pic` varchar(225) DEFAULT '',
  `hash` char(136) DEFAULT NULL,
  `salt` char(24) DEFAULT NULL,
  `registered` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `threadCount` int DEFAULT '0',
  `postCount` int DEFAULT '0',
  `lastActive` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `name_UNIQUE` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Alice','Just vibing','vqqle6zwlj5t1ykpxsl2','hash123','salt123','2024-12-06 22:21:24',5,7,'2024-12-06 22:21:24'),(2,'Bob','Hello, forum!','mjpstqd7hezpfbicmcdm','hash456','salt456','2024-12-06 22:21:24',4,8,'2024-12-06 22:21:24'),(3,'Charlie','Coder in disguise','oel91hffmndzipibybib','hash789','salt789','2024-12-06 22:21:24',3,8,'2024-12-06 22:21:24'),(4,'Diana','Modding Enthusiast','ig36rmh6zj7suknfvo3j','hash101','salt101','2024-12-06 22:21:24',0,0,'2024-12-06 22:21:24'),(5,'Eve','Strategy Queen','v5rr8uz9hamoli7zsv7','hash102','salt102','2024-12-06 22:21:24',0,0,'2024-12-06 22:21:24'),(6,'Frank','Lore Hunter','xqtuxnkrqlulak0efx3j','hash103','salt103','2024-12-06 22:21:24',0,0,'2024-12-06 22:21:24'),(7,'BonkBonk','Desperately need a Sparkle Fumo.','vaqwtjn5wytcresydksu','BMoelDE9akj/RUdyWdc4bLkeDCVpQHAauZAvuYxo3jyOLNhkG5jPgQcaeuqIpT5u/mkoQ+TkcF5dYhWTj6pVIIRHcMTkL83Q7X3tXGQE13ubzT7tasSCllsWTCfGSbjxLGREDA==','uoHkaifM8XB0uO1oRhqvqw==','2024-12-07 01:33:33',5,10,'2024-12-07 06:19:23'),(8,'UnapologeticAlly','Kindness is a weakness','gumgkpqplduxykpkt0uc','q2TPjRW8SMBaRpCkJhrmdM9aSZbR1hPIWMIxWaZsD5E6LZzpQVXLP02HxxOC327o+7+QQc9bH2OWSmfWW9qLEzuFCuxIhc/dXXK32aaapjSxrcx4OtdA4J1SKFFP7Bj7x+6I5g==','kUqeKLtq6UpybZL3iFOdHA==','2024-12-07 04:18:40',0,1,'2024-12-07 04:25:01');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-12-07  1:23:11
