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

// start session
////////////////
if (session_status() == PHP_SESSION_NONE) {
	session_start();
}

$cwd = explode("/",getcwd ());
if(count($cwd) == 1){ //then developing on local host
  $cwd = explode("\\",getcwd ());
  $_SESSION['version'] = $cwd[5];
  $_SESSION['local_website'] = "http://localhost/open-collector-server/open-collector";
} else {
  $_SESSION['version'] = $cwd[4];
  $_SESSION['local_website'] = "https://www.ocollector.org";
}


// timeout session
//////////////////
// solution by Gumbo at https://stackoverflow.com/questions/520237/how-do-i-expire-a-php-session-after-30-minutes
if (isset($_SESSION['LAST_ACTIVITY']) && (time() - $_SESSION['LAST_ACTIVITY'] > 1800)) {
  // last request was more than 30 minutes ago
  session_unset();     // unset $_SESSION variable for the run-time 
  session_destroy();   // destroy session data in storage
}
$_SESSION['LAST_ACTIVITY'] = time(); // update last activity time stamp

//store the hashed password locally if it is available in the session



if(isset($_SESSION['local_key'])){
  echo $_SESSION['local_key'];

  ?>
  <script>
    window.localStorage.setItem("local_key", "<?= $_SESSION['local_key'] ?>");
  </script>
  <?php 
  unset($_SESSION['local_key']);
  ?>
  <script>
  //document.location.href = "index.php";
  </script>  
  <?php
} else {
  echo "no-key";
}
?>