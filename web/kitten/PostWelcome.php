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

require_once ("cleanRequests.php");

$cipher = "aes-256-cbc";
define('AES_256_CBC', 'aes-256-cbc');

require_once "Code/InitiateCollector.php";
require_once "../../sqlConnect.php";

function generateRandomString($length = 10) {
	return substr(str_shuffle(str_repeat($x='0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', ceil($length/strlen($x)) )),1,$length);
}

$participant_code     = $_POST['participant_code'];
$_SESSION['location'] = $_POST['location'];
$location             = $_SESSION['location'];
//identify the data by location and participant_code

$_SESSION['participant_code'] = $participant_code;

//find the experiment_id of the $location
$sql = "SELECT * FROM `view_experiment_users` WHERE  `location` = '$location'";
$result = $conn -> query($sql);
$researchers = array();
while($row = $result->fetch_assoc()){
	if(!isset($experiment_id)){
		$experiment_id = $row['experiment_id'];
	}
	array_push($researchers,$row['email']);
}
$_SESSION['researchers'] = $researchers;
	
	
$sql 		= "SELECT * FROM `data` WHERE `experiment_id` = '$experiment_id' AND `participant_code` = '$participant_code'";
$result = $conn -> query($sql);

$_SESSION['experiment_id'] = $experiment_id;


if($result -> num_rows == 0){
	
	//////////////////////////////////////////////////////////////
	// First time the participant is completing this experiment //
	//////////////////////////////////////////////////////////////
	
	// generate completion code as none available
	///////////////////////////////////////////////
	$completion_code 						 = generateRandomString($length = 16);
	$_SESSION['completion_code'] = $completion_code;
		
	//add it to the table		
	$sql = "INSERT INTO `data`(`experiment_id`, `participant_code`,`completion_code`) VALUES ('$experiment_id' ,'$participant_code','$completion_code')";
		
	if ($conn->query($sql) === TRUE) {
		// great - do/say nothing
		echo "great success";
	} else {
		echo $conn->error." ";
	}
		
} else {
	echo "error: A user with this ID has already started this task - please contact ".$_SESSION['researchers'][0]." about how to proceed. <br><br> Alternately, to start from the beginning, click 'OK'. experiment_id:$experiment_id";
}
?>