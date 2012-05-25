var markerArray = new Array();
var markerArrayCopy = new Array();

function geotaggingInitialize() {

	setInterval("updateMarkers()", 5000);

	var infowindow = new google.maps.InfoWindow({
	  content: 'holding...'
	});

  	$.getJSON('/api/entities.js?callback=?', function(data) {
	    for(var i=0; i<data.length; i++) {

	  		var latlng0 = new google.maps.LatLng(data[i].entity.lat,data[i].entity.lng);

	  		markerArray[i] = new google.maps.Marker({
	  				  position: latlng0,
	  				  map: map,
	  				  title: data[i].entity.title
	  		});

			markerArray[i].id = data[i].entity.id;
			markerArray[i].updated_at = data[i].entity.updated_at;
			markerArray[i].html = '<div style="font-size: 30px;line-height: 38px;" onClick="window.open(\'/entities/' + data[i].entity.id + "', '_blank', 'width=600,height=800,resizable=no'); return false;\"><a id=\"popup_link\" href=\"#\" ><b>" + data[i].entity.title + '</b><br/>' + data[i].entity.description + '<br/>' + "</a></div>";
	  		markerArray[i].set("icon", data[i].entity.icon_uri);


	   		google.maps.event.addListener(markerArray[i], 'click', function() {
	        	infowindow.setContent(this.html);
				infowindow.open(map, this);
	   		});

	   	}
	});

    google.maps.event.addListener(map,'dblclick',function(event){
        console.log("here");
        var lat = event.latLng.lat().toPrecision(8);
        var lng = event.latLng.lng().toPrecision(8);
        var newEntityUrl = "/entities/new?lat="+lat+"&lng="+lng;

        window.open(newEntityUrl,'_blank','width=400,height=600,resizable=no');
        //location.href = newEntityUrl;
    });

}

function addNewEntity(event){
    infowindow.setContent(this.html);
    infowindow.open(map, this);

}


//refresh the kml layer on certain time interval
function updateMarkers() {
     // console.log("updateMarkers called");

  	// reset markerArrayCopy
  	markerArrayCopy = new Array();

  	var infowindow = new google.maps.InfoWindow({
  		content: 'holding...'
  	});

    $.getJSON('/api/entities.js?callback=?', function(data) {
  	for(var i=0; i<data.length; i++)
  	{
  	 	//console.log("entity id on server: " + data[i].entity.id);
  		var markerExists = false;
  		var needsUpdating = false;
  		
  		for(var j= 0; j<markerArray.length; j++)
  		{
  			if(markerArray[j].id == data[i].entity.id)
  			{
  				//console.log("entity already exists with id: " + data[i].entity.id);
  				
  				// copy existing marker information to markerArrayCopy
  			    markerArrayCopy[i] = markerArray[j];
  				markerArrayCopy[i].id = markerArray[j].id;
  				markerArrayCopy[i].html = markerArray[j].html;
  				markerArrayCopy[i].set = markerArray[j].set;
  				markerArrayCopy[i].updated_at = markerArray[j].updated_at;
  				markerExists = true;
  				
  				//check to see if entity need to be updated by comparing timestamp
  				if(markerArray[j].updated_at == data[i].entity.updated_at)
  				{
  					console.log("entity with id: " + data[i].entity.id + " already up-to-date");
  				}
  				else
  				{
  					console.log("entity with id: " + data[i].entity.id + " needs to be updated");
  					needUpdating = true;	
  				}
  				
  			}
  		}

  		if(markerExists == false)
  		{
  			// add marker
  			//console.log("adding id: " + data[i].entity.id + " to client");
  			// TODO: call to add marker to COP client
  			var latlng0 = new google.maps.LatLng(data[i].entity.lat,data[i].entity.lng);
  			
  			markerArrayCopy[i] = new google.maps.Marker({
    				  position: latlng0,
    				  map: map,
    				  title: data[i].entity.title
  			});
  			
  			markerArrayCopy[i].id = data[i].entity.id;
  			markerArrayCopy[i].updated_at = data[i].entity.updated_at;
  			markerArrayCopy[i].html = '<div style="font-size: 32px;line-height: 36px;"><b>' + data[i].entity.title + '</b><br/>' + data[i].entity.description + '<br/>' + "<a href='#' onClick=\"window.open('/entities/" + data[i].entity.id + "', '_blank', 'width=600,height=800,resizable=no'); return false;\"></a></div>";
  			markerArrayCopy[i].set("icon",data[i].entity.icon_uri);


  			google.maps.event.addListener(markerArrayCopy[i], 'click', function() {
  				infowindow.setContent(this.html);
  				infowindow.open(map, this);
  			});
  								
  		}
  		
  	}
  	
  	// delete entities from COP client that have been removed from server
  	for(var i=0; i<markerArray.length; i++)
  	{
  	 	//console.log("deleteCheck: entity id on client: " + markerArray[i].id);
  		var markerExists = false;
  		
  		for(var j= 0; j<data.length; j++)
  		{
  			if(markerArray[i].id == data[j].entity.id)
  			{
  				//console.log("deleteCheck: entity already exists with id: " + data[j].entity.id);
  				markerExists = true;
  			}
  		}
  		
  		// this means marker has been removed from server, delete this marker from COP client
  		if(markerExists == false)
  		{
  			//console.log("removing entity id on client: " + markerArray[i].id);
  			markerArray[i].setMap(null);
  		}
  	}
  	
     //set markerArray to markerArrayCopy
     markerArray = markerArrayCopy;
     });
}
