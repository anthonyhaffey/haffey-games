<?php
$error_message = '';
if(isset($_SESSION['login_error'])){
  $error_message = ($_SESSION['login_error']);
  unset($_SESSION['login_error']);
}
echo $error_message;
?>