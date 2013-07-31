
function doActions() { 
        
        //  ---------------------------------
        // | Close faults with various codes | 
        //  ---------------------------------
   
     $("a[name^='timecheck_']").each(function() { 
	
	var thisbutton = $(this);
	console.log("Adding handler:");
	console.log(thisbutton);

	thisbutton.click(function() {
 
		var thisthis = $(this);
		var monthClicked =thisthis.id();
		alert(monthClicked); 
	});

      });
    
}

