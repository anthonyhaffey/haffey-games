<?php
$user_email  = $_SESSION['user_email'];
$initial_sql = "Select * FROM `users` WHERE `email`='$user_email'";
$result 	 = $conn->query($initial_sql);	
$experiment_sql = "SELECT * FROM `view_experiment_users` WHERE `email`='$user_email'";
$result 	 = $conn->query($experiment_sql);
$published_links  = [];
while($row = $result->fetch_assoc()) {
  array_push($published_links, $row['published_id']."|".$row['experiment_id']);		
}
echo json_encode($published_links);
?>