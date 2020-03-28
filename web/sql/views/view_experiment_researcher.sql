CREATE VIEW `view_experiment_researchers` AS (
SELECT  `exp`.`name` AS `name`,  
	`exp`.`experiment_id` AS `experiment_id`,  
	`exp`.`published_id` AS `published_id`,  
	`exp`.`location` AS `location`,  
	`ub`.`email` AS `email`,  
	`rb`.`researcher_id` AS `researcher_id` 
	FROM (((`experiments` `exp`  
		JOIN `contributors` `cb`  ON ((`exp`.`experiment_id` = `cb`.`experiment_id`)))  
		JOIN `researchers` `rb`  ON ((`cb`.`researcher_id` = `rb`.`researcher_id`)))  
		JOIN `users_beta` `ub`  ON ((`rb`.`user_id` = `ub`.`user_id`))))