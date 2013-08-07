//  --------------------------------------
// | functions.js
// | Contains helper functions to keep
// | main script easier to read
//  --------------------------------------


//  --------------------------------------
// | Sets the number of rows in Glide
//  --------------------------------------

function setRows(rows) {

	var list = unsafeWindow.GlideList2.get('task_time_worked');
	
    try { var rowsPerPage = list.rowsPerPage; }   // Occasion undefined error - try/catch should work around for the moment
    catch(err) { return; }
	
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
 
    num = (num<10) ? "0" : "" + num;
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
