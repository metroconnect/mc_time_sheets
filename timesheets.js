// ==UserScript==
// @name       MetroConnect Timesheets
// @namespace  https://github.com/metroconnect/mc_glist
// @version    2.1.4
// @require    https://raw.github.com/metroconnect/mc_time_sheets/master/jquery.min.js
// @require    https://raw.github.com/metroconnect/mc_time_sheets/master/calendar.js
// @require    https://raw.github.com/metroconnect/mc_time_sheets/master/jquery-ui.js
// @require    https://raw.github.com/metroconnect/mc_time_sheets/master/actions.js
// @require    https://raw.github.com/metroconnect/mc_time_sheets/master/functions.js
// @require    https://raw.github.com/metroconnect/mc_time_sheets/master/dropdown.js
// @resource   customCSS https://raw.github.com/metroconnect/mc_time_sheets/master/jquery-ui-1.10.3.custom.css?1
// @description MetroConnect ServiceNow Actions
// @include    https://didataservices.service-now.com/task_time_worked_list.do*
// @include    https://didataservices.service-now.com/task_time_worked.do?&mc_time_sheets=1*
// @updateURL  https://raw.github.com/metroconnect/mc_time_sheets/master/metadata.js
// @downloadURL https://raw.github.com/metroconnect/mc_time_sheets/master/timesheets.js
// @copyright  2013, Allan Houston
// ==/UserScript==


  var thisURL  = document.location.href;

  if (thisURL.match(/task_time_worked.do/)) { 

        	doAddHours();
  }

  else { 


	var workloadURL = "https://didataservices.service-now.com/task_time_worked.do?&mc_time_sheets=1&sys_id=-1&sysparm_collection=incident&sysparm_collectionID=";			// Workload URL

	// Register some Toggles

	GM_registerMenuCommand ("Toggle auto-check hours", toggleAutoCheck);
	var autoCheck = GM_getValue("autoCheck",true);



	var debug = {
        	findTimesheets : true,
    	};

	//  -----------------------------------
	// | Load the jquery-ui css resource in
	//  -----------------------------------

		var newCSS = GM_getResourceText ("customCSS");
		GM_addStyle (newCSS);

		var target = $("td.list_nav_top_middle");
		var existingInner = target.html();
		existingInner=existingInner.replace(/<script>.+<\/script>/g,'');
		existingInner += "<div id='dialog-confirm' style='display: none;' title='Checking workload'>\n";
		existingInner += "<p id='workload_message'>\n";
		existingInner += "</p></div>\n";
      	existingInner += "<div id='error-dialog' style='display: none;' title='Error'>\n";
		existingInner += "<p id='error_message'></p>\n";
		existingInner += "</p></div>\n";      	

		var alert_icon = "<span class='ui-icon ui-icon-alert' style='float: left; margin: 0 7px 0px 0;'></span>";
		var check_icon = "<span class='ui-icon ui-icon-check' style='float: left; margin: 0 7px 0px 0;'></span>";

	//  ---------------------------------------------
	// | getDropDown is defined in dropdown.js so that 
	// | we can fork for each department
	//  ---------------------------------------------
    
      	var data;							// Lets make this global
      
		var newButton = getDropDown();
   		target.html(newButton + existingInner);
    		
		doActions(); 	// Setup the handlers for the menu
   		setTimeout(function() { 
            		$("#ui-id-1").css('position','absolute');
        		$("#ui-id-1").css('text-align','left');
			$("#split_button_div").css('display', 'inline-block');
            		console.log("CSS set for dropdown");
   		}, 250);
	

		// Fire off the autoCheck if it's set

		if (autoCheck) {
		
        	console.warn("Firing autoCheck...");
			var todayDate = new Date();
			var todayMonthNum = todayDate.getMonth();
			var todayMonth = month_num[todayMonthNum];
			var todayYear = todayDate.getFullYear();

			var clickID = "#timecheck_" + todayMonth + "_" + todayYear;
        	console.warn(clickID);
        	//console.warn($(''+clickID.click()));
			$(''+clickID).click();
     	}
		
 }




//  --------------------------------------
// | Add Hours 
//  --------------------------------------


function doAddHours(hours) {
    
    if (!(hours)) { hours = 1; }
    
    var timesheetDate = getQueryVariable("timesheet_date");
    
    console.log("Found date: " + timesheetDate);
    
    $("#task_time_worked\\.u_start_time").val(timesheetDate+ " 09:00:00");
    $("#task_time_worked\\.u_start_time").trigger('onblur');
    
    setTimeout(function () {
        $("#ni\\.task_time_worked\\.time_workeddur_hour").val(hours).trigger("onblur");
    },250);
    
}

//  --------------------------------------
// | Parse a URL
//  --------------------------------------

function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) == variable) {
            return decodeURIComponent(pair[1]);
        }
    }
    console.log('Query variable %s not found', variable);
}


//  --------------------------------------
// | Iterate through days and check hours
//  --------------------------------------

function checkDays(month,year) { 
	
    var monthWorkdays = workdays[year][month];
    var wdays = [];
    var buff = '';
    var sysID = '';
   
    if (typeof monthWorkdays=='undefined') { console.warn("Variable monthWorkdays is null for year="+year+", month="+month); return; } 
    
    var monthLong = (month in months) ? months[month] : '';		// Basically want no match if we don't find a month xlate
    
    $("#dialog-confirm").attr("title","Checking workload for " + monthLong);
    
    // First lets loop throught the sorted the keys of the monthWorkdays (key in seems to sort)
    
    for (var key in monthWorkdays) {

    	if (key === 'length' || !monthWorkdays.hasOwnProperty(key)) continue;
        
   	var day = monthWorkdays[key];
        console.log("This is data[month]");
        console.log(data[month]);
    
        var hours = 0;
        if (month in data) { 
            
            console.log("This is month in data");
            console.log(month);
            
            if ("sysID" in data[month]) {
                
                sysID = data[month]["sysID"];
                console.log("Found sysID: "+sysID);
            }
            
            if (key in data[month]) {
                
           		hours = data[month][key]["hours"];
            }
        }
        
        if (sysID.length==0) { 
            	
                error_screen("Error - couldn't find the ICM reference for call in " + monthLong + ".\nPlease create a workload entry with a description of either:\n'" + month + " Timesheet' or '" + monthLong + " Timesheet'");
                return false;
        }
        
        
        var snDate = zeroPad(key) + "-" + month + "-" + year;
        
        //var isHoliday = checkObjHasKeys(holidays,[year,month,key]);
        var isHoliday = checkNested(holidays,year,month,key);			// Check if the day is a holiday
        console.log("Checking holiday for " + year + "," + month + "," + key + " : " + isHoliday);
        var required_hours = isHoliday ? 0 : parseInt(8 - hours);
        var required_icon = required_hours <= 0 ? check_icon : alert_icon;
        var required_txt = isHoliday ? "Public Holiday: " + holidays[year][month][key] : 8 - hours < 0 ? " over by " + parseInt((8-hours)*-1) + " hours" : 8 - hours == 0 ? " Perfect!" : makeURL(sysID,snDate,"Need " + parseInt(8-hours) + " hours");
        
        var dayNum = parseInt(key);
        var date_str = day + " " + toOrdinal(dayNum) + " " + month;
        
        buff += required_icon + "<p style='margin: 0px'><span style='width:150px; font-weight:bold;'>" + date_str + ":</span><span> " + required_txt + "</span></p><br>";
        
	}
    
    $("#workload_message").append(buff);
      
    $("#dialog-confirm" ).dialog({

                        resizable: false,
                        height:450,
                        width:500,
                        modal: true,
                        position: { my: "top+50", at: "top", of: "div#task_time_worked_expanded" },
                        buttons: {
                                Done: function() {
                                        $( this ).dialog( "close" );
                                }
                        }
    });
   
   
}


//  --------------------------------------
// | Iterate through the rows and parse 
//  --------------------------------------

function parseRows(checkMonth,checkYear) {

    
    var checkMonthLong = (checkMonth in months) ? months[checkMonth] : '';		// Basically want no match if we don't find a month xlate
    
    // Use jQuery to iterate over the selectors
    
    var headings = new Array();
    var i = 0;
    $("th.list_hdr").each(function() {

        $this = $(this);
        i++;
    	var heading = $this.find("a.list_hdrcell").html();
        headings[heading] = i;    
    });

    // console.log(headings);
    
    var row = 0;
    var data = {};
    
    
    
    $("tr.list_row").each(function() {
  		$this = $(this);
        row++;
        
        var start_date = $this.children().eq(headings['Start time']).html();
        var hours = $this.children().eq(headings['Time worked']).html();
        var comments = $this.children().eq(headings['Comments']).html();
        var task = $this.children().eq(headings['Task']).html();
        
        var taskID;
        var taskComment;
        var sysID;
        
        
        // Try to match timesheet ICM here
        
        regexStr = '('+checkMonth + '|' + checkMonthLong + ') Timesheet';
       	monthRegex = new RegExp(regexStr,'i');
        
        if (debug.findTimesheets) { console.log("Checking " + monthRegex + " against " + comments); }
         
        if (comments.match(monthRegex)) { 
        	
            if (debug.findTimesheets) { console.warn("Matched regex: " + monthRegex + ":");}
            console.warn(task);
            var matches = task.match(/sys_id="(.+)" href/);
            var sysID = ((matches) && (matches.length==2)) ? matches[1] : '';
            
            taskID=task.replace(/<\/a>/,'');
            taskID=taskID.replace(/<.+>/,'');
            if (debug.findTimesheets) { console.warn(taskID); }
            
            taskComment = comments;
        }
        
        // Clean up hours
        
        var hours_arr = hours.match(/(\d+) Hour/);
        var minutes_arr = hours.match(/(\d+) Minute/);
                
        hours_num = (hours_arr) ? parseInt(hours_arr[1]) : 0;
        minutes_num = (minutes_arr) ? parseInt(minutes_arr[1]) : 0;
        //     

        if (hours_num == "NaN") { console.warn("Error got NaN from:" + hours_arr);}
        if (minutes_num == "NaN") { console.warn("Error got NaN from:" + minutes_arr);}
        
        var min_hours = parseFloat(minutes_num / 60);
        hours_num += min_hours;
        hours_num = parseFloat(hours_num); 	// Check we're still a number 
        
        if (hours_num == "NaN") { console.warn("Hours_num is Nan - just added " + min_hours); }   
        //console.log(start_date + ": " + hours + " -> " + hours_num + " (" +comments+")");
        
        
        // console.log(start_date);
        var date_time_arr = start_date.split(" ");
        var date = date_time_arr[0];
        var time = date_time_arr[1];
        
	    /*console.log("Here ->");
        console.log(date_time_arr);
        console.log(date);
        console.log(time);*/
        
        var date_arr = date.split("-");
        var day = String(date_arr[0]);
        day = day.replace(/^0/,'');			// Drop leading zero!
        var month = date_arr[1];
        var year = String(date_arr[2]);
 
        //console.log("data now:"); console.log(data);
        if (!(data[month])) { data[month] = []; }										// Create the month key if not there already
        if (!(data[month]["hours"])) { data[month]["hours"] = parseFloat(0.0); }		// Create the month.hours key if not there already
        
        
        if (!(data[month][day])) { data[month][day] = [] }; 								// Create the day key if not there already
        if (!(data[month][day]["hours"])) { data[month][day]["hours"] = parseFloat(0.0); } 	// Create the day.hours key if not there already
        
        
        data[month][day].push({ "hours" : hours_num, "comments" : comments, "start_date" : start_date});    
        data[month]["hours"] += hours_num;
       	
        if (taskID) { 
            data[month]["taskID"] = taskID;
            data[month]["taskComment"] = taskComment;
            data[month]["sysID"] = sysID;
        }
        
        data[month][day]["hours"] += hours_num;
                            
        
        // if (row == 1) { console.log("Row:" + row +" Start Date: "+ start_date + " Hours: " + hours + " Comments: " + comments);}
	});
    

    return data;

}


// ----------------------------------
// Checks an object for a nested key
// which is passed as the arguments
// var test = {level1:{level2:{level3:'level3'}} };
// checkNested(test, 'level1', 'level2', 'level3'); // true
// ----------------------------------

function checkNested(obj /*, level1, level2, ... levelN*/) {
    
    var args = Array.prototype.slice.call(arguments),
    obj = args.shift();
    var success = true;
    
    for (var i = 0; i < args.length; i++) {
       
        if (obj == null || !obj.hasOwnProperty(args[i]) ) {
            success=false;
            return success;
        }
       
        obj = obj[args[i]];
    }
    return success;
}

function currentDate() {
    
    
}

$(function() {
    
    
	var setRowsPerPage = 200;	// Lets get a nice big list so we can see the data in one page
	setRows(setRowsPerPage);

    setTimeout(function() {
                        $("#ui-id-1").css('position','absolute');
                        $("#ui-id-1").css('text-align','left');
                        $("#split_button_div").css('display', 'inline-block');
                        console.log("CSS set for dropdown");
                }, 250);  

 
    
    $( "#rerun" )
      .button()
      .click(function() {
        // alert( "Running the last action" );
      })
      .next()
        .button({
          text: false,
          icons: {
            primary: "ui-icon-triangle-1-s"
          }
        })
        .click(function() {
          var menu = $( this ).parent().next().show().position({
            my: "left top",
            at: "left bottom",
            of: this
          });
          $( document ).one( "click", function() {
            menu.hide();
          });
          return false;
        })
        .parent()
          .buttonset()
          .next()
            .hide()
            .menu();

        
    
        $( "#refresh").button().click(function() { 

                // Do the refresh here
                console.warn("Refreshing frame gsft_main");
                parent.frames['gsft_main'].location.reload();

        });
    
     
    
    
    
});



