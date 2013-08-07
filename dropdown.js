function getDropDown(incidentRequest) {

        var newButton = "";

        newButton += '<div id="split_button_div" style="width: 280px; display: none;"> ' +
        '<div> ' +
        '<button id="refresh" style="background-image:url(https://ahouston.net/js/css/smoothness/images/refresh.png?moo=1213); background-repeat:no-repeat;">&nbsp; &nbsp;</button> ' +
        '<button id="rerun" disabled style="opacity: 1;">Actions</button> ' +
        '<button id="select">Select an action</button> ' +
                '</div> ' +
                '<ul> ';


         newButton += '' +
		'  <li><a name="timecheck_jul_2013" id="timecheck_jul" href="#">Check: July 2013</a></li> ' +
		'  <li><a name="timecheck_aug_2013" id="timecheck_aug" href="#">Check: August 2013</a></li> ' +
		'  <li><a name="timecheck_sep_2013" id="timecheck_sep" href="#">Check: September 2013</a></li> ' +
                ' <li><hr style=" color:#000000; border: 1px #000000;  height:1px; width:350px;"></li> ';

    newButton +=   '</ul> ' + '</div>';
    return(newButton);
}


