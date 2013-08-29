//  --------------------------------------
// | functions.js
// | Contains helper functions to keep
// | main script easier to read
//  --------------------------------------


//  --------------------------------------
// | Sets the number of rows in Glide
//  --------------------------------------

function setRows(rows) {

    var glist = unsafeWindow.GlideList2;
    var list =  glist.get('task_time_worked');

    console.warn("This is GlideList2:");
    console.warn(glist);

    console.warn("This is List:");
    console.warn(list); 
	
    try { var rowsPerPage = list.rowsPerPage; }   // Occasion undefined error - try/catch should work around for the moment
    catch(err) {
	console.warn("Error setting rowsPerPage to " + rows); 
	return; 
    }
	
    if (rowsPerPage != rows) { 
        	console.log('Found ' + rowsPerPage+ ' rows, setting to ' + rows);
        	list.setRowsPerPage(rows);
    }
    
}

//  --------------------------------------
// | Make a URL to jump into the workload 
//  --------------------------------------

function makeURL(sysID,date,text) { 
 	
    href = "<a href='" + workloadURL + sysID + "&timesheet_date="+date+"'>"+text+"</a>"; 
    return(href);
}

//  --------------------------------------
// | Add leading zero to numbers 
//  --------------------------------------

function zeroPad(num) { 

    num = (num<10) ? "0" + num : "" + num;
    return(num);
}


//  --------------------------------------
// | Return 2nd, 3rd, 4th etc
//  --------------------------------------

function toOrdinal(number) {
    
		var n = number % 100;
		var suff = ["th", "st", "nd", "rd", "th"]; // suff for suffix
		var ord= n<21?(n<4 ? suff[n]:suff[0]): (n%10>4 ? suff[0] : suff[n%10]);	
		return number + ord;
}


function ucfirst(string) { 
    return string.charAt(0).toUpperCase() + string.slice(1);
}


//  --------------------------------------
// | Pop a nice error screen
//  --------------------------------------

function error_screen(string) { 

	string.replace("\n","<br>");
	$("#error_message").html("<p id='error_message'>"+string+"</p>");
	$("#error-dialog").dialog({

                        resizable: false,
                        height:400,
                        width:300,
                        modal: true,
			dialogClass: "alert",
                        position: { my: "top+50", at: "top", of: "div#task_time_worked_expanded" },
                        buttons: {
                                OK: function() {
                                        $( this ).dialog( "close" );
					$("#error_message").html("<p id='error_message'></p>");
                                }
                        }
    });
}

