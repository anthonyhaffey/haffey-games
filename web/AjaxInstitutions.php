<?php

require("../sqlConnect.php");

$sql = "SELECT * FROM `institutions`";
$result = $conn->query($sql);
$institutions = [];
while($row = $result->fetch_assoc()) {
	array_push($institutions,$row);
}

echo json_encode($institutions);

?>