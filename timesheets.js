// ==UserScript==
// @name       MetroConnect Timesheets
// @description MetroConnect ServiceNow Actions
// @namespace  https://github.com/metroconnect/mc_time_sheets
// @version    2.0.0
// @require    https://raw.github.com/metroconnect/mc_service_now/master/jquery.min.js
// @include    https://didataservices.service-now.com/task_time_worked_list.do*
// @updateURL  https://raw.github.com/metroconnect/mc_service_now/master/metadata.js
// @downloadURL https://raw.github.com/metroconnect/mc_service_now/master/timesheets.js
// @copyright  2013, Allan Houston
// ==/UserScript==


	var checkMonth = "Jul"; 	// Need to get this from the dropdown

	var setRowsPerPage = 200;	// Lets get a nice big list so we can see the data in one page
	setRows(setRowsPerPage);

	parseRows();

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
        console.log(hours + " -> " + hours_num);
        
        
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
        var month = date_arr[1];
        var year = String(date_arr[2]);
 
        //console.log("data now:"); console.log(data);
        if (!(data[month])) { data[month] = []; }										// Create the month key if not there already
        if (!(data[month]["hours"])) { data[month]["hours"] = parseFloat(0.0); }		// Create the month.hours key if not there already
        
        if (!(data[month][day])) { data[month][day] = [] }; 								// Create the day key if not there already
        if (!(data[month][day]["hours"])) { data[month][day]["hours"] = parseFloat(0.0); } 	// Create the day.hours key if not there already
        
        
        data[month][day].push({ "hours" : hours_num, "comments" : comments, "start_date" : start_date});    
        data[month]["hours"] += hours_num;
        data[month][day]["hours"] += hours_num;
                            
        
        // if (row == 1) { console.log("Row:" + row +" Start Date: "+ start_date + " Hours: " + hours + " Comments: " + comments);}
	});
    
	console.log(data); 

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
