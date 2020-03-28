<?php

/*

$sql="SELECT * FROM releases"; //WHERE users LIKE '%$user_email%' 
$result = $conn->query($sql); 

$releases_array	= [];
$era_array		= [];
while($row = $result->fetch_assoc()) {
    array_push($releases_array, $row['name']);
    array_push($era_array, 		$row['era']);
//    echo "id: " . $row["id"]. " - Name: " . $row["firstname"]. " " . $row["lastname"]. "<br>";
}
*/
?>

<div id="Releases_div"	class = "interface_div"></div>
<script>
/*
var releases_array 	= < ? = json_encode($releases_array) ?>;
var era_array		= < ? = json_encode($era_array)	?>;
var releases_html = "<h1>Development</h1>"+
				"<table id='Development_table' class='release_table'>"+
					"<tr>"+
						"<td>"+
							"<img class='logo' id='"+releases_array[0]+"_logo' src='../logos/"+releases_array[0]+".png'>"+
						"</td>"+
					"</tr>"+
					"<tr>"+
						"<td id='"+releases_array[0]+"_logo_text'>"+releases_array[0]+"</td>"+
					"</tr>"+
				"</table>";
for(var i=1; i<releases_array.length; i++){
	if(era_array[i] !== era_array [i-1]){
		releases_html += "<h1>"+era_array[i]+"</h1>"+
		"<table id='"+era_array[i]+"_table' class='release_table'><tr><td></td></tr><tr><td></td></tr></table>";
	}	
}
				
$("#Releases_div").html(releases_html);

for(var i=1; i<releases_array.length; i++){

	$('#'+era_array[i]+'_table tr:first').append('<td>'+"<img class='logo' src='../logos/"+releases_array[i]+".png' id='"+releases_array[i]+"_logo'>"+'</td>');
	$('#'+era_array[i]+'_table tr:last').append("<td id='"+releases_array[i]+"_logo_text'>"+releases_array[i]+"</td>'");	
};

$(".logo").mouseover(function(){
	var text_id = this.id + "_text";
	$("#"+text_id).css("color","blue");
	$(this).animate({
		height:"60px",
		width:"60px"
	})
});	
$(".logo").mouseout(function(){	
	var text_id = this.id + "_text";
	$("#"+text_id).css("color","black");
	$(this).animate({
		height:"40px",
		width:"40px"
	})
});

$(".logo").on("click",function(){
	// go to the associated version page
	console.dir(this);
	var version = this.src.substr(this.src.lastIndexOf("/")+1);
	var version = version.split(".")[0];
	window.location.replace("https://www.open-collector.org/"+version+"/index.php");
});
*/	
</script>