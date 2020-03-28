<?php
$email = $_SESSION['user_email'];
$sql = "SELECT * FROM `view_user_pps` WHERE `email` = '$email'";
$result = $conn->query($sql);
$data_array = [];
while($row = $result->fetch_assoc()) {
  $this_obj = new stdClass();
  $this_obj->completion_code 	= $row['completion_code'];
	$this_obj->experiment_id    = $row['experiment_id'];
	$this_obj->participant_code = $row['participant_code'];
	$this_obj->name    					= $row['name'];
	array_push($data_array,$this_obj);
}
$researcher_sql_data = mysqli_fetch_assoc($result);

if($researcher_sql_data == ''){
	$researcher_sql_data = json_encode(['blank']);
}
echo json_encode($data_array);
?>