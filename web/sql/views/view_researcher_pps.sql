CREATE VIEW `view_researcher_pps` AS (
	SELECT  `d`.`experiment_id` AS `experiment_id`,  
		`ub`.`email` AS `email`,  
		`cb`.`user_id` AS `user_id`,  
		`d`.`completion_code` AS `completion_code`,  
		`d`.`participant_code` AS `participant_code`,  
		`eb`.`published_id` AS `published_id`,  
		`eb`.`name` AS `name` 
	FROM (((`data` `d`  JOIN `experiments` `eb`  
		ON ((`d`.`experiment_id` = `eb`.`experiment_id`)))  JOIN `contributors` `cb`  
		ON ((`eb`.`experiment_id` = `cb`.`experiment_id`)))  JOIN `users` `ub`  
		ON ((`cb`.`user_id` = `ub`.`user_id`))))