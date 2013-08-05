// ==UserScript==
// @name       MetroConnect Timesheets
// @namespace  https://github.com/metroconnect/mc_glist
// @version    2.0.0
// @require    https://raw.github.com/metroconnect/mc_time_sheets/master/jquery.min.js
// @require    https://raw.github.com/metroconnect/mc_time_sheets/master/calendar.js?moo4
// @require    https://raw.github.com/metroconnect/mc_time_sheets/master/jquery-ui.js
// @require    https://raw.github.com/metroconnect/mc_time_sheets/master/actions.js?mo1235
// @require    https://raw.github.com/metroconnect/mc_time_sheets/master/dropdown.js?mo123
// @resource   customCSS https://raw.github.com/metroconnect/mc_time_sheets/master/jquery-ui-1.10.3.custom.css?moo12
// @description MetroConnect ServiceNow Actions
// @include    https://didataservices.service-now.com/task_time_worked_list.do*
// @copyright  2013, Allan Houston
// ==/UserScript==




	var checkMonth = "Jul"; 	// Need to get this from the dropdown
	var checkMonthLong = (checkMonth in months) ? months[checkMonth] : '';		// Basically want no match if we don't find a month xlate

	var workloadURL = "https://didataservices.service-now.com/task_time_worked.do?&mc_time_sheets=1&sys_id=-1&sysparm_collection=incident&sysparm_collectionID=";			// Workload URL

	var setRowsPerPage = 200;	// Lets get a nice big list so we can see the data in one page
	// setRows(setRowsPerPage);

	//fetchMyTasks();
	console.log("Confirmed we have 200 Rows per Page");

	var debug = {
        
        findTimesheets : false,
        
    };

	//  -----------------------------------
	// | Load the jquery-ui css resource in
	//  -----------------------------------

		var newCSS = GM_getResourceText ("customCSS");
		GM_addStyle (newCSS);

		var target = $("td.list_nav_top_middle");
		var existingInner = target.html();
		existingInner=existingInner.replace(/<script>.+<\/script>/g,'');
		existingInner += "<div id='dialog-confirm' style='display: none;' title='Checking workload for " + checkMonthLong +"'>\n";
		existingInner += "<p id='workload_message'>\n";
		existingInner += "</p></div>\n";

		var alert_icon = "<span class='ui-icon ui-icon-alert' style='float: left; margin: 0 7px 0px 0;'></span>";
		var check_icon = "<span class='ui-icon ui-icon-check' style='float: left; margin: 0 7px 0px 0;'></span>";

	//  ---------------------------------------------
	// | getDropDown is defined in dropdown.js so that 
	// | we can fork for each department
	//  ---------------------------------------------
    
		var newButton = getDropDown();
   		target.html(newButton + existingInner);
		//target.html(newButton);

   		setTimeout(function() { 
            		$("#ui-id-1").css('position','absolute');
        			$("#ui-id-1").css('text-align','left');
					$("#split_button_div").css('display', 'inline-block');
            		
            		doActions(); 	// Setup the handlers for the menu
   		}, 250);
	
		console.log(holidays);
     
		var data = parseRows();
		console.log(data);
	
		var taskID = "";
		var taskComment = "";

		if ((checkMonth in data) && ("taskID"  in data[checkMonth])) {
            
			taskID = data[checkMonth]["taskID"];
            taskComment = data[checkMonth]["taskComment"];
            
            // Append the ICM reference to the task bar heading
            var currTitle = $("#dialog-confirm").attr("title");
            $("#dialog-confirm").attr("title",currTitle + " (Using " + taskID + " - " + taskComment + ")");
		}

		checkDays();

		



//  --------------------------------------
// | Iterate through days and check hours
//  --------------------------------------

function checkDays() { 
	
    var year='2013';
    var month='Jul';
    var monthWorkdays = workdays[year][month];
    var wdays = [];
    var buff = '';
    
    // First lets loop throught the sorted the keys of the monthWorkdays (key in seems to sort)
    
    
    for (var key in monthWorkdays) {
    	if (key === 'length' || !monthWorkdays.hasOwnProperty(key)) continue;
        
   		var day = monthWorkdays[key];
        //console.log(key);
    
        var hours = 0;
        if (month in data) { 
            if (key in data[month]) {    
           		hours = data[month][key]["hours"];
            }
        }
        
        var required_hours = parseInt(8 - hours);
        var required_icon = required_hours <= 0 ? check_icon : alert_icon;
        var required_txt = 8 - hours < 0 ? " over by " + parseInt((8-hours)*-1) + " hours" : 8 - hours == 0 ? " Perfect!" : " need " + parseInt(8-hours) + " hours";
        
        var dayNum = parseInt(key);
        var date_str = day + " " + toOrdinal(dayNum) + " " + month;
        
        buff += required_icon + "<p style='margin: 0px'><span style='width:150px; font-weight:bold;'>" + date_str + ":</span><span>" + required_txt + "</span></p><br>";
        
	}
    
    $("#workload_message").append(buff);
      
    
   
   
}
    
//  --------------------------------------
// | Iterate through the rows and parse 
//  --------------------------------------

function parseRows() {

    
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

function setRows(rows) {

	var list = unsafeWindow.GlideList2.get('task_time_worked');
	
    try { var rowsPerPage = list.rowsPerPage; }   // Occasion undefined error - try/catch should work around for the moment
    catch(err) { return; }
	
	if (rowsPerPage != rows) { 
        	console.log('Found ' + rowsPerPage+ ' rows, setting to ' + rows);
        	list.setRowsPerPage(rows);
    }
    
}

function toOrdinal(number) {
    
		var n = number % 100;
		var suff = ["th", "st", "nd", "rd", "th"]; // suff for suffix
		var ord= n<21?(n<4 ? suff[n]:suff[0]): (n%10>4 ? suff[0] : suff[n%10]);	
		return number + ord;
}


function fetchMyTasks() {
 
    console.log("Fetching user's task list...");
    var url = 'https://didataservices.service-now.com/task_list.do?&sysparm_query=active=true^assigned_to=javascript:getMyAssignments()^EQ';
    
    $.get(url, function(data) {
  		//$('#my_task_list').html(data);
  		//console.log(data);
	});
       
}


$(function() {
    
    
    
    
    $("#dialog-confirm" ).dialog({
      resizable: false,
      height:450,
      width:500, 
      modal: true,
      position: { my: "top+50", at: "top", of: "div#task_time_worked_expanded" },
      buttons: {
        "Add missing hours": function() {
          alert("Adding hours!");
        },
        Cancel: function() {
          $( this ).dialog( "close" );
        }
      }
    });

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
