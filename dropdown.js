function getDropDown(incidentRequest) {

        var newButton = "";
	
	var date = new Date();
	var monthNum = date.getMonth();
	var thisMonth = (monthNum in month_num) ? month_num[monthNum] : '';
	var thisYear = date.getFullYear();

        newButton += '<div id="split_button_div" style="width: 280px; display: none;"> ' +
        '<div> ' +
        '<button id="refresh" style="background-image:url(https://ahouston.net/js/css/smoothness/images/refresh.png?moo=1213); background-repeat:no-repeat;">&nbsp; &nbsp;</button> ' +
        '<button id="rerun" disabled style="opacity: 1;">Actions</button> ' +
        '<button id="select">Select an action</button> ' +
                '</div> ' +
                '<ul> ';


	monthRange = 2;
	for (c = monthNum-monthRange; c <= monthNum+monthRange; c++) { 

		var loopYear = (c<0) ? thisYear-1 : (c>11) ? thisYear+1 : thisYear;	// When we cross year boundry
		var loopMonthNum = (c<0) ? 12 + c : (c>11) ?  c-12 : c;		// Months across year boundry
		var loopMonth = month_num[loopMonthNum];
		var loopMonthLong = months[loopMonth];	
 
		// console.log('C: ' + c + ' , loopYear: ' + loopYear + ' , loopMonthNum: ' + loopMonthNum  + ' , loopMonth: ' + loopMonth + ' , loopMonthLong: ' + loopMonthLong);

         	newButton += '' +
			'  <li><a name="timecheck_'+loopMonth+'_'+loopYear+'" id="timecheck_'+loopMonth+'_'+loopYear+'" href="#">Check: '+loopMonthLong+' '+loopYear+'</a></li> ';

	}

    newButton +=   '</ul> ' + '</div>';
    return(newButton);
}


