<?php

require("../sqlConnect.php");

$sql = "SELECT * FROM `participant_countries`";
$result = $conn->query($sql);
$countries = [];
while($row = $result->fetch_assoc()) {
	array_push($countries,$row);
}

echo json_encode($countries);


/*

<?php

require("../sqlConnect.php");

//print_r($_POST);
$country_id   = $_POST['country_id'];
$country_name = $_POST['country_name'];

$sql = "SELECT * FROM `participant_countries` WHERE `code`='$country_id'";
$result = $conn->query($sql);

//print_r($result);
if($result -> num_rows > 0){
  echo "howdy";
} else {
  $sql = "INSERT INTO `participant_countries` (`country`,`code`,`frequency`) VALUES ('$country_name','$country_id',1)";
  if ($conn->query($sql) === TRUE) {
    echo "success";				
  } else {
    echo  $conn->error;;
  }
}



/*
$sql = "SELECT * FROM `participant_countries`";
$row = $result->fetch_assoc()


while() {
	array_push($institutions,$row);
}

echo json_encode($institutions);
*/

?>