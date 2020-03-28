// get dropbox token for user
var CLIENT_ID = '6xumb4iloq9sz1u';

(function(window){
	window.utils = {
		parseQueryString: function(str) {
			var ret = Object.create(null);
			if (typeof str !== 'string') {
				return ret;
			}
			str = str.trim().replace(/^(\?|#|&)/, '');
			if (!str) {
				return ret;
			}
			str.split('&').forEach(function (param) {
			var parts = param.replace(/\+/g, ' ').split('=');
			// Firefox (pre 40) decodes `%3D` to `=`
			// https://github.com/sindresorhus/query-string/pull/37
			var key = parts.shift();
			var val = parts.length > 0 ? parts.join('=') : undefined;

			key = decodeURIComponent(key);

			// missing `=` should be `null`:
			// http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
			val = val === undefined ? null : decodeURIComponent(val);

			if (ret[key] === undefined) {
			  ret[key] = val;
			} else if (Array.isArray(ret[key])) {
			  ret[key].push(val);
			} else {
			  ret[key] = [ret[key], val];
			}
			});

			return ret;
		}
	};
})(window);

function dropbox_login(message){
  if(typeof(message) == "undefined"){
    var message = "You need to be logged in to dropbox to access your experiments";
  }
  var dbx = new Dropbox({ clientId: CLIENT_ID });
  if(dev_obj.context == "server" |
     dev_obj.context == "github"){
    // var local_website = document.URL can delete?

    var authUrl = dbx.getAuthenticationUrl(document.URL);
    document.getElementById('authlink').href = authUrl;
    bootbox.confirm(message,function(response){
      if(response){
        $("#authlink")[0].click();
      }
    });
  } else {
    //alert("it's all goood");
  }
}
function force_reauth_dbx(){
  dbx.setClientId(CLIENT_ID); // i think is necessary

  var return_url = document.URL.split("#access_token")[0];

  authUrl = dbx.getAuthenticationUrl(return_url);
  authUrl += "&force_reauthentication=true";
  document.getElementById('authlink').href = authUrl;
  $("#authlink")[0].click();

  /* probably deletable:
  dbx.setClientId(CLIENT_ID); // i think is necessary
  if(local_website.indexOf("localhost") !== -1){
    local_website += "/www";
  }
  authUrl = dbx.getAuthenticationUrl(document.URL);
  authUrl += "&force_reauthentication=true";
  document.getElementById('authlink').href = authUrl;
  $("#authlink")[0].click();
  */
}
function getAccessTokenFromUrl() { // Parses the url and gets the access token if it is in the urls hash
 return utils.parseQueryString(window.location.hash).access_token;
}
function isAuthenticated() { // If the user was just redirected from authenticating, the urls hash will contain the access token.
  return !!getAccessTokenFromUrl() | dev_obj.context == "gitpod";
}


function check_authenticated(){
  if(isAuthenticated()){
    help_div_content = $(".help_general").html();
    startup_dialog = bootbox.dialog({
      title: 'Welcome!',
      message: '<p id="startup_prog"><i class="fa fa-spin fa-spinner"></i> Loading your master file <br><br> Refresh page if this message is here for more than a minute</p>' +
      help_div_content +
      '<button class="btn btn-primary change_tip">Previous</button>' +
      '<button class="btn btn-primary change_tip">Next</button>' +
      "<button class='btn btn-primary' id='startup_btn' style='display:none'>Start!</button>"
    });
    $(".change_tip").on("click",function(){
      if(this.innerHTML == "Next"){
        help_obj.tip_no++;
      } else {
        help_obj.tip_no--;
      }
      help_obj.tip_no = help_obj.tip_no < 0 ? help_obj.main.length - 1
                      : help_obj.tip_no == help_obj.main.length ? 0
                      : help_obj.tip_no;

      $(".general_tip").hide();
      $(".tip"+help_obj.tip_no).show();
    });
  // Create an instance of Dropbox with the access token and use it to
    // fetch and render the files in the users root directory.
    if(dev_obj.context == "gitpod"){
      if(typeof(dbx) == "undefined"){
        dbx = new Dropbox({ accessToken: "zX0EGDhNy2AAAAAAAAAAIW8Ew9QBdD0LofB7depK5AB5fUK9_18t5qQWVeV2VGZs" }); //this may require frequent updating :-(
      }

    } else {
      dbx = new Dropbox({ accessToken: getAccessTokenFromUrl() });
    }
    console.dir("dropbox on");

    dbx.usersGetCurrentAccount()
    .then(function(account_info){
      $("#dropbox_account_email").html(account_info.email);
      $("#startup_prog").html("Dropbox account: <a href='https://www.dropbox.com/home/Apps/Open-Collector' target='_blank'>" + account_info.email + "</a> <button class='btn btn-info' id='intro_switch_dbx'>Switch account</button>");
      $("#intro_switch_dbx").on("click",function(){
        force_reauth_dbx();
      });
      initiate_master_json();
    })
    .catch(function(error){
      console.dir("Dropbox not logged in yet");
      console.dir(error);
    });

    $_GET = window.location.href.substr(1).split("&").reduce((o,i)=>(u=decodeURIComponent,[k,v]=i.split("="),o[u(k)]=v&&u(v),o),{});



  }	else {
    // Set the login anchors href using dbx.getAuthenticationUrl()
    dropbox_login();
  }
}