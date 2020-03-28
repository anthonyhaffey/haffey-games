// Dropbox functions below
//////////////////////////
dbx_obj = {
	queing:false,
	queue : [],
	new_upload : function(item,successFunction,failFunction,upload_type){
		if(dropbox_check()){
			dbx_obj.queue.push([item,successFunction,failFunction,upload_type]);
			if(dbx_obj.queing == false){
				$("#save_status").html("Synching...");
				$("#save_status").show(500);
				dbx_obj.queing = true;
				dbx_obj.upload();
			}
		}
	},
	upload:function(){
		if(dropbox_check()){
			[item,successFunction,failFunction,upload_type] = dbx_obj.queue.shift();
			dbx[upload_type](item)
				.then(function(result){
					successFunction(result);
					if(dbx_obj.queue.length > 0){
						dbx_obj.queing = true;
						dbx_obj.upload();
					}	else 	{
						dbx_obj.queing = false;
						$("#save_status").html("Up to date");
						setTimeout(function(){
							$("#save_status").hide(500);
						},500);
					}
				})
				.catch(function(error){
					failFunction(error);
				});
		}
	}
}
function dropbox_check(){
  return $("#dropbox_account_email").html() !== "No dropbox account linked yet";
}
function initiate_master_json(){
	dbx.sharingCreateSharedLink({path:"/master.json"})
		.then(function(link_created){
			load_master_json(link_created);
		})
    .catch(function(error){   //i.e. this is the first login
      legacy_initiate_uber(); //or they have a legacy account
		});
}
function legacy_initiate_uber(){
  dbx.sharingCreateSharedLink({path:"/uberMegaFile.json"})
		.then(function(link_created){

      $.get(link_created,function(master_json){
        dbx_obj.new_upload({path:"/master.json",
                            contents:master_json,
                            mode:'overwrite'},
                            function(result){
                              dropbox_dialog.modal('hide');
                              //location.reload();
                              initiate_master_json();
                            },
                            function(error){
                              console.dir("Initial file causing error");
                              report_error(error);
                            },"filesUpload");
      });
		})
    .catch(function(error){ //i.e. this is the first login
			dropbox_dialog = bootbox.dialog({
				title: "Your first login",
				message: '<p class="text-center mb-0"><i class="fa fa-spin fa-cog"></i> Welcome to Collector! We are just setting up your dropbox files, <br><div id="dropbox_prog_div"></div><br> Please wait while these are created ready for your use!</p>'
			});

			// do something in the background
			new_dropbox_account(dropbox_dialog);
		});
}
function load_master_json(link_created){
	$.get(link_created.url.replace("www.","dl."),function(returned_data){
    master_json = JSON.parse(returned_data);

    //probable would be good to have a list of things that follow, but for now:
    if(typeof(master_json.keys) == "undefined"){
      encrypt_obj.generate_keys();
    }
    if(typeof(master_json.data.save_script)== "undefined"){
      encrypt_obj.save_script_url();
    }

    
		$("#startup_btn").fadeIn(500);
		$("#startup_btn").on("click",function(){
			startup_dialog.modal("hide");
		});
		// add boosts if not already present
		//////////////////////////////////////
		if(typeof(master_json.boosts) == "undefined"){
			master_json.boosts = {};
		}
		renderItems();
		dbx.filesListFolder({path: '/experiments'})
			.then(function(response) {
			// hack to deal with uneven loading of files
			check_dbx_trialtypes = setInterval(function(){
				if(typeof(dbx_trialtypes_startup) !== "undefined"){
					dbx_trialtypes_startup();
					clearInterval(check_dbx_trialtypes)
				}
			},100);
			})
			.catch(function(error) {
				console.dir("hi 6");
				console.dir(error);
			});
	});
}
function new_dropbox_account(dropbox_dialog){
  $.get("Default/master.json",function(this_json){
    console.dir(this_json);
    master_json = this_json;
    //create more general dropbox update function that queues any dropbox request?
    var these_folders = ["boosts",
                         "experiments",
                         "stimuli",
                         "surveys",
                         "trialtypes"];

    these_folders.forEach(function(this_folder){
      dbx_obj.new_upload({path:"/" + this_folder},
                          function(result){
                            $("#dropbox_prog_div").html("<b>" + this_folder + "</b> created");
                            //do nothing, all is well
                          },
                          function(error){
                            console.dir(this_folder);
                            console.dir("Initial folder causing error");
                            //report_error(error);
                            bootbox.confirm("It looks like you need to confirm the link between your google account and dropbox." +
                                            "If this is the case, please confirm and you will be directed back to dropbox to select" +
                                            "your gmail account to do this with. If not, then this might be an issue that you want" +
                                            "to raise by clicking on the Discuss button in the top right, and then either discuss in" +
                                            "the group forum or on the github issues page",function(result){
                              if(result){
                                force_reauth_dbx(); //risk of infinite loop if this doesn't work :-/
                              }
                            });
                          },
                          "filesCreateFolder");
    dbx_obj.new_upload({path:"/master.json",
                        contents:JSON.stringify(master_json),
                        mode:'overwrite'},
                        function(result){
                          dropbox_dialog.modal('hide');
                          //location.reload();
                          initiate_master_json();
                        },
                        function(error){
                          console.dir("Initial file causing error");
                          report_error(error);
                        },"filesUpload");

    });
  });
}
