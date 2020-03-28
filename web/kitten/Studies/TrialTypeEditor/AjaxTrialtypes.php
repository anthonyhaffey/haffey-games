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

$trialtypes_folder = "../../../../../trialtypes";
require_once '../../../Code/InitiateCollector.php';
require_once "../../../../../sqlConnect.php";

$user_email = $_SESSION['user_email'];
$action = $_POST['action'];

if($action == 'initiate'){

	$default_trialtypes = new stdClass();
	$default_trialtypes_list = file_get_contents("Default/DefaultTrialtypeList.txt");
	$default_trialtypes_list = explode(",",$default_trialtypes_list);

	foreach($default_trialtypes_list as $name){
		$default_trialtypes -> $name = file_get_contents("Default/$name.html");
	}
	echo json_encode($default_trialtypes);
}

if($action == 'rename'){
  /* do nothing */
}

if($action == 'save'){
	/* do nothing */
}

mysqli_close($conn);
?>