<?php
/*  Collector (Garcia, Kornell, Kerr, Blake & Haffey)
    A program for running experiments on the web
    Copyright 2012-2016 Mikey Garcia & Nate Kornell


    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License version 3 as published by
    the Free Software Foundation.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>
 
		Kitten release (2019) author: Dr. Anthony Haffey (a.haffey@reading.ac.uk)
*/


require 'Code/InitiateCollector.php';
require_once "../../sqlConnect.php";
require_once "cleanRequests.php";

$location   = $_POST['location'];
$experiment = $_POST['experiment'];
$user_email = $_SESSION['user_email'];


$check_exists_sql = "SELECT COUNT(*) experiment_count FROM `view_experiment_users` WHERE `name`='$experiment' AND `email` = '$user_email'";
$result = $conn->query($check_exists_sql);

$row = mysqli_fetch_assoc($result);
//$row = $result[0]->fetch_row());

$exp_exists = $row['experiment_count'];
if ($exp_exists == 0){
      
  $location = $_POST['location'];
      
  // create experiment in beta
  $sql = "INSERT INTO `experiments`(`name`, `location`) VALUES ('$experiment','$location');";
  
  if ($conn->query($sql) === TRUE) {
    
    $sql = "INSERT INTO `contributors` (`experiment_id`,`user_id`) VALUES(
      (SELECT `experiment_id` FROM `experiments` WHERE `location` = '$location'), 
      (SELECT `user_id` FROM `users` WHERE `email`='$user_email'));";
    
    if ($conn->query($sql) === TRUE) {
      echo "success";				
    } else {
      echo  $conn->error;;
    }			
    
  } else {
    echo  $conn->error;;
  }					
} else {
  $sql = "UPDATE `view_experiment_users` SET `location`='$location' WHERE `name`='$experiment' AND `email` = '$user_email'";
  if ($conn->query($sql) === TRUE) {
    echo "success";				
  } else {
    echo  $conn->error;;
  }
}

?>