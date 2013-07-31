
function doActions() { 
        
        //  ---------------------------------
        // | Close faults with various codes | 
        //  ---------------------------------
   
     $("a[name^='timecheck_']").click(function() {
 
	$this = $(this);
	var monthClicked =$this.id();
	alert(monthClicked); 

      });
    
}

