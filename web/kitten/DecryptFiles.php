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
require 'Libraries.html';

////////////////////////////////////////////////////////////////////
// Do not implement below at the moment, it breaks the decryption //
// require_once ("cleanRequests.php");                            //
////////////////////////////////////////////////////////////////////



function encrypt_decrypt($action, $string,$local_key,$this_iv) {
	$output = false;
	$encrypt_method = "AES-256-CBC";
	$secret_key = $local_key;
	$secret_iv = $this_iv;
	// hash
	$key = hash('sha256', $secret_key);
	
	// iv - encrypt method AES-256-CBC expects 16 bytes - else you will get a warning
	$iv = substr(hash('sha256', $secret_iv), 0, 16);
	if ( $action == 'encrypt' ) {
		$output = openssl_encrypt($string, $encrypt_method, $key, 0, $iv);
		$output = base64_encode($output);
	} else if( $action == 'decrypt' ) {
		$output = openssl_decrypt(base64_decode($string), $encrypt_method, $key, 0, $iv);
	}
	return $output;
}

$user_email 				= $_SESSION['user_email'];

// variables regardless of number of participants
/////////////////////////////////////////////////
$local_key 					= $_POST['local_key'];
$completion_codes   = $_POST['completion_codes_input'];
$saltpepper 				= file_get_contents("../../simplekeys/saltpepper_$user_email.txt");
$salt 							= substr($saltpepper,0,20);
$pepper 						= substr($saltpepper,21,40);
$encrypted_privKey 	= file_get_contents("../../simplekeys/priv_$user_email.txt");
$cipher	 						= "aes-256-cbc";
$researcher_iv 			= file_get_contents("../../simplekeys/iv-$user_email.txt");

$decrypted_array = [];

for($i = 0; $i < count($_FILES['filesToUpload']['tmp_name']); $i++){
	$encrypted_content	= file_get_contents($_FILES['filesToUpload']['tmp_name'][$i]);
	$participant_exp		= str_replace("encrypted_","",$_FILES["filesToUpload"]["name"][$i]);
	$participant_exp		= str_replace(".txt","",$participant_exp);
	$participant_exp  	= explode("-",$participant_exp);
	$experiment_id 			= $participant_exp[0];
	$participant 				= $participant_exp[1];
	$participant_iv     = file_get_contents("../../simplekeys/iv-$user_email-$experiment_id-$participant.txt");	
	$decrypted_privKey 	= encrypt_decrypt("decrypt",$encrypted_privKey,$local_key,$researcher_iv); 
	$decrypted_privKey 	= "-----BEGIN PRIVA".substr($decrypted_privKey,16); 																									//what is this about...?
	$encrypted_symmetric_key = file_get_contents("../../simplekeys/symmetric-$user_email-$experiment_id-$participant.txt");
  openssl_private_decrypt ($encrypted_symmetric_key, $decrypted_symmetric_key, $decrypted_privKey); 
	$decrypted_data = encrypt_decrypt("decrypt",$encrypted_content,$decrypted_symmetric_key,$participant_iv);
	$decrypted_data = json_decode($decrypted_data);
	unset($decrypted_data->trialtypes); //otherwise the page tries to draw the trialtypes :-/	
	$decrypted_data->experiment_id  = $experiment_id;
	$decrypted_data->username 			= $participant;
	array_push($decrypted_array,$decrypted_data);
}
?>
<head>
	<link rel="shortcut icon" type="image/x-icon" href="../logos/collector.ico.png" />
	<meta charset="utf-8">
</head>


<nav class="navbar fixed-top navbar-light bg-light">
  <span class="navbar-brand mb-0 h1">Data</span>
	<span class="text-primary" id="boost_progress">Boost loading...</span>
	<button id="download_btn" class="btn btn-primary">Download</button>
</nav>
<br><br><br>
<div id="script_div"></div>
<div id="table_preview"></div>
<script>
completion_codes = <?= $completion_codes ?>;
decrypted_array = <?= json_encode($decrypted_array) ?>;
response_headers 		 = [];
condition_headers 	 = [];	
for(var i = 0; i < decrypted_array.length ; i++) {
	decrypted_data = decrypted_array[i];
	responses_csv = decrypted_data.responses;
	responses_csv.forEach(function(row){
		Object.keys(row).forEach(function(item){
			if(response_headers.indexOf(item) == -1){
				response_headers.push(item);
			};
		});
	});
	Object.keys(decrypted_data.this_condition).forEach(function(condition_header){
		if(condition_headers.indexOf("condition_" + condition_header) == -1){
			condition_headers.push("condition_" + condition_header);
		}
	});
}

table_headers 	 = ["experiment_name"].concat(["username"]).concat(["completion_code"]).concat(condition_headers).concat(response_headers);
table_html 			 = "<table class='table'>";
downloadable_csv = [table_headers];
table_headers.forEach(function(table_header){
	table_html += "<th>" + table_header + "</th>";
});	
row_no = -1;	
for(var i = 0; i < decrypted_array.length ; i++) {
	var username   	 = decrypted_array[i].username;
	var experiment_id = decrypted_array[i].experiment_id;
	var exp_username = "encrypted_" + experiment_id + "-" + username + ".txt";
	var completion_code = completion_codes[exp_username].completion_code;
	var experiment_name = completion_codes[exp_username].name;
	
	decrypted_data   = decrypted_array[i];
	responses_csv    = decrypted_data.responses;
	this_condition   = decrypted_data.this_condition;
	responses_csv.forEach(function(row){
		row_no ++;
		downloadable_csv.push([]);
		table_html += "<tr>";	
		table_headers.forEach(function(item,item_no){
			if(item == "username"){
				table_html += "<td>" + username + "</td>";
				downloadable_csv[row_no+1][item_no] = username;				
			} else if(item == "completion_code"){	
				table_html += "<td>" + completion_code + "</td>";
				downloadable_csv[row_no+1][item_no] = completion_code;				
				
			} else if(item == "experiment_name"){	
				table_html += "<td>" + experiment_name + "</td>";
				downloadable_csv[row_no+1][item_no] = experiment_name;				
				
			} else if(typeof(row[item]) !== "undefined"){
				table_html += "<td>" + row[item] + "</td>";
				downloadable_csv[row_no+1][item_no] = row[item];				
			} else if (condition_headers.indexOf(item) !== -1){
				console.dir(item);
				console.dir(this_condition);
				downloadable_csv[row_no+1][item_no] = this_condition[item.replace("condition_","")];	
				table_html += "<td>"+ this_condition[item.replace("condition_","")] +"</td>";						
			} else {
				downloadable_csv[row_no+1][item_no] = "";				
				table_html += "<td></td>";
			}
		});
	});	
}
table_html += "</table>";
$("#table_preview").html(table_html);

$("#download_btn").on("click",function(){
  var default_filename = downloadable_csv[1][0] + "_" + downloadable_csv[1][1] + ".csv";
	bootbox.prompt({
		title: "What do you want to save this file as?",
		value: default_filename, //"data.csv",
		callback:function(result){
			if(result){
				save_csv(result,Papa.unparse(downloadable_csv));
			}
		}
	});
});
function save_csv (filename, data) {
	var blob = new Blob([data], {type: 'text/csv'});
	if(window.navigator.msSaveOrOpenBlob) {
		window.navigator.msSaveBlob(blob, filename);
	}	else{
		var elem = window.document.createElement('a');
		elem.href = window.URL.createObjectURL(blob);
		elem.download = filename;        
		document.body.appendChild(elem);
		elem.click();        
		document.body.removeChild(elem);
	}
}
</script>

<?php 
if(isset($_POST['posted_script'])){
	$script_location = $_POST['posted_script'];
} else {
	$script_location = "";
}
?>
<script>
var script_url = "<?php echo $script_location ?>";
if(script_url == "None"){
	$("#boost_progress").html("");
}
if(script_url !== "None"){
	$.get(script_url, function(script_content){
		$("#script_div").html(script_content);
		$("#boost_progress").html("Boost loaded");
		setTimeout(function(){
			$("#boost_progress").fadeOut();
		}, 1000);
	});
};
</script>