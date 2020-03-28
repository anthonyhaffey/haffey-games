<?php 
$postData = $statusMsg = ''; 
$status = 'error'; 
 
echo "Hi";

// If the form is submitted 
if(isset($_POST['submit'])){ 
    $postData = $_POST; 
     
    // Validate form fields 
    
         
    // Validate reCAPTCHA box 
    if(isset($_POST['g-recaptcha-response']) && !empty($_POST['g-recaptcha-response'])){ 
        // Google reCAPTCHA API secret key 
        $secretKey = ''; 
         
        // Verify the reCAPTCHA response 
        $verifyResponse = file_get_contents('https://www.google.com/recaptcha/api/siteverify?secret='.$secretKey.'&response='.$_POST['g-recaptcha-response']); 
         
        // Decode json data 
        $responseData = json_decode($verifyResponse); 
         
        // If reCAPTCHA response is valid 
        if($responseData->success){ 
            echo "beep";
        }else{ 
            $statusMsg = 'Robot verification failed, please try again.'; 
        } 
    }else{ 
        $statusMsg = 'Please check on the reCAPTCHA box.'; 
    } 
} 
?>