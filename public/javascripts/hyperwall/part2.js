var eLog = null;

            var domMap = document.getElementById('map');
            var map;
            var marker;
            var overlay;
            var geocoder;
            var lastRecordedTime = (new Date).getTime();
            var vx = 0;
            var vy = 0;
            var touchX0 = -1;
            var touchY0 = -1;
            var touchX1 = -1;
            var touchY1 = -1;
            var lng_span = -1;
            var lat_span = -1;
            var south_west_lat = -1;
            var south_west_lng = -1; 

            // mouse member variables
            var INTERVAL = 20;
            var MAXSPEED = 10;
            var MAXDURATION = 200;

            // The maximal screen positions allowed (0,0 implied as minimal):
            var xmin = 0;
            var xmax = 0;
            var ymin = 0;
            var ymax = 0;


            //sets the panning width per step
            var panning_step = 100;  // in px

            function log( aString ) {
                eLog.innerHTML +=
                    aString + "<br>";
                if( eLog.scrollHeight > eLog.clientHeight ) {
                    eLog.scrollTop = eLog.scrollHeight - eLog.clientHeight;
                }
            }

function clearLog() {
    eLog.innerHTML = "";
    eLog.scrollTop = 0;
}

var jWebSocketClient = null;
var gUsername = null;

function logon() {
    // URL is ws://[yourhostname|localhost]:8787
    //var lURL = jws.JWS_SERVER_URL;
    //var lURL = 'ws://10.0.12.65:8787'
    var lURL = 'ws://hyperwall02.sv.cmu.edu:8787'
    gUsername = eUsername.value;
    var lPassword = ePassword.value;
    ePassword.value = "";

    log( "Connecting to " + lURL + " and logging in as '" + gUsername + "'..." );
    var lRes = jWebSocketClient.logon( lURL, gUsername, lPassword, {
        // OnOpen callback
        OnOpen: function( aEvent ) {
            log( "<font style='color:#888'>jWebSocket connection established.</font>" );
        },
        // OnMessage callback
        OnMessage: function( aEvent, aToken ) {
            var lDate = "";
            if( aToken.date_val ) {
                lDate = jws.tools.ISO2Date( aToken.date_val );
            }
        //log( "<font style='color:#888'>jWebSocket '" + aToken.type + "' token received, full message: '" + aEvent.data + "' " + lDate + "</font>" );
        },
        // OnClose callback
        OnClose: function( aEvent ) {
            log( "<font style='color:#888'>jWebSocket connection closed.</font>" );
        }
    });

    log( jWebSocketClient.resultToString( lRes ) );
}

function logoff() {
    if( jWebSocketClient ) {
        log( "Logging off " + ( gUsername != null ? "'" + gUsername + "'" : "" ) + " and disconnecting..." );
        // the timeout below  is optional, if you use it you'll get a good-bye message.
        var lRes = jWebSocketClient.close({ timeout: 3000 });
        log( jWebSocketClient.resultToString( lRes ) );
    }
}

function broadcast() {
    var lMsg = eMessage.value;
    if( lMsg.length > 0 ) {
        log( "Broadcasting '" + lMsg + "'..." );
        var lRes = jWebSocketClient.broadcastText(
                "",		// broadcast to all clients (not limited to a certain pool)
                lMsg	// broadcast this message
                );
        // log error only, on success don't confuse the user
        if( lRes.code != 0 ) {
            log( jWebSocketClient.resultToString( lRes ) );
        }
        eMessage.value = "";
    }
}

// example how to exchange arbitrary complex objects between clients
// the processComplexObject method in the server side sample plug-in
function exchangeComplexObjects() {
    if( jWebSocketClient.isConnected() ) {
        var lToken = {
ns: jws.SamplesPlugIn.NS,
    type: "processComplexObject",
    int_val: 1234,
    float_val: 1234.5678,
    bool_val: true,
    date_val: jws.tools.date2ISO( new Date() ),
    object: {
field1: "value1",
        field2: "value2",
        array1: [ "array1Item1", "array1Item2" ],
        array2: [ "array2Item1", "array2Item2" ],
        object1: { obj1field1: "obj1value1", obj1field2: "obj1value2" },
        object2: { obj2field1: "obj2value1", obj2field2: "obj2value2" }
    }
        };
        jWebSocketClient.sendToken( lToken,	{
                });
    } else {
        log( "Not connected." );
    }
}

// example how to exchange data with a server side listener
function sampleListener() {
    if( jWebSocketClient.isConnected() ) {
        var lToken = {
ns: "my.namespace",
    type: "getInfo"
        };
        jWebSocketClient.sendToken( lToken,	{
OnResponse: function( aToken ) {
log("Server responded: "
    + "vendor: " + aToken.vendor
    + ", version: " + aToken.version
   );
}
});
} else {
    log( "Not connected." );
}
}

// example how to request a result from a server side plugin
function sampleGetTime() {
    log( "Requesting server time via WebSockets..." );
    // call the getTime method of the client side plug-in
    var lRes = jWebSocketClient.requestServerTime();
    // log error only, on success don't confuse the user
    if( lRes.code != 0 ) {
        log( jWebSocketClient.resultToString( lRes ) );
    }
}

function requestFaisal() {
    log( "Requesting Faisal via WebSockets..." );
    // call the requestFaisal method of the Hyperwall client side plug-in
    var lRes = jWebSocketClient.requestFaisal();
    // log error only, on success don't confuse the user
    if( lRes.code != 0 ) {
        log( jWebSocketClient.resultToString( lRes ) );
    }
}

function getServerTimeCallback( aToken ) {
    log( "Server time: " + aToken.time );
}

// example how to request a result from a server side plugin
function sampleSelect() {
    log( "Requesting JDBC data via WebSockets..." );
    // call the getTime method of the client side plug-in
    var lRes = jWebSocketClient.jdbcSelect({
table	: "locales",
fields	: "*",
order	: "code",
where	: "",
group	: "",
having	: ""
});
// log error only, on success don't confuse the user
if( lRes.code != 0 ) {
    log( jWebSocketClient.resultToString( lRes ) );
}
}

function loadFile() {
    log( "Loading a file from the server via WebSockets..." );
    // call the getTime method of the client side plug-in
    var lRes = jWebSocketClient.fileLoad( "test.txt", {
            });
    // log error only, on success don't confuse the user
    if( lRes.code != 0 ) {
        log( jWebSocketClient.resultToString( lRes ) );
    }
}

function saveFile() {
    log( "Saving a file from the server via WebSockets..." );
    // call the getTime method of the client side plug-in
    var lRes = jWebSocketClient.fileSave( "test.txt", eMessage.value, {
            });
    // log error only, on success don't confuse the user
    if( lRes.code != 0 ) {
        log( jWebSocketClient.resultToString( lRes ) );
    }
}

function cgiTest() {
    jWebSocketClient.sendToken({
ns: "org.jWebSocket.plugins.system",
type: "send",
subType: "exec",
unid: "ssal",
cmd: "test()"
});
}

function onFileLoadedObs( aToken ) {
    log( "Loaded file: " + aToken.data );
}

function onFileErrorObs( aToken ) {
    log( "Error loading file: " + aToken.msg );
}

function onFileSavedObs( aToken ) {
    var lHTML = "<img src=\"" + aToken.url + "\"/>";
    log( lHTML );
}

function initPage() {
    eLog = jws.$( "sdivChat" );
    eMessage = jws.$( "stxfMessage" );
    eUsername = jws.$( "stxfUsername" );
    ePassword = jws.$( "spwfPassword" );

    // jws.browserSupportsWebSockets checks web if sockets are available
    // either natively, by the Flash Bridge or by the Chrome Frame.
    if( jws.browserSupportsWebSockets() ) {
        jWebSocketClient = new jws.jWebSocketJSONClient();
        jWebSocketClient.setSamplesCallbacks({
OnSamplesServerTime: getServerTimeCallback
});
jWebSocketClient.setFileSystemCallbacks({
OnFileLoaded: onFileLoadedObs,
OnFileSaved: onFileSavedObs,
OnFileError: onFileErrorObs
});
eUsername.focus();
} else {
    jws.$( "sbtnLogon" ).setAttribute( "disabled", "disabled" );
    jws.$( "sbtnLogoff" ).setAttribute( "disabled", "disabled" );
    jws.$( "sbtnClear" ).setAttribute( "disabled", "disabled" );
    jws.$( "sbtnBroadcast" ).setAttribute( "disabled", "disabled" );
    jws.$( "stxfMessage" ).setAttribute( "disabled", "disabled" );
    jws.$( "stxfUsername" ).setAttribute( "disabled", "disabled" );
    jws.$( "spwfPassword" ).setAttribute( "disabled", "disabled" );

    var lMsg = jws.MSG_WS_NOT_SUPPORTED;
    alert( lMsg );
    log( lMsg );
}
}

function exitPage() {
    logoff();
}

function load() {
    var latlng = new google.maps.LatLng(37.41046, -122.060616);

    var myOptions = {
zoom: 8,
      center: latlng,
      mapTypeId: google.maps.MapTypeId.TERRAIN,
      mapTypeControl: false,
      navigationControl: false
    };

    map = new google.maps.Map(document.getElementById("map"), myOptions);
    geocoder = new google.maps.Geocoder();

    google.maps.event.addListener(map, 'click', function(event) {
            mapClickHandler(event.latLng);
            });

    google.maps.event.addListener(map, 'idle', function(event) {
            var bounds = map.getBounds();
            var southWest = bounds.getSouthWest();
            var northEast = bounds.getNorthEast();
            var lngSpan = northEast.lng() - southWest.lng();
            var latSpan = northEast.lat() - southWest.lat();

            lng_span = lngSpan;
            lat_span = latSpan;
            south_west_lat = southWest.lat();
            south_west_lng = southWest.lng();

            var    lxmax = document.documentElement.clientWidth;
            var    lymax = document.documentElement.clientHeight;

            console.log("lng_span coordinate:" + lng_span);
            console.log("lat_span coordinate:" + lat_span);
            console.log("northEast lat:" + northEast.lat());
            console.log("northEast lng:" + northEast.lng());
            console.log("southWest lat:" + south_west_lat);
            console.log("southWest lng:" + south_west_lng);
            console.log("lxmax:" + lxmax);
            console.log("lymax:" + lymax);
    });

    overlay = new google.maps.OverlayView();
    overlay.draw = function() {};
    overlay.setMap(map);

    // set overlay for users connected to hyperwall
    var myControl = document.getElementById('myTextDiv');
    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(myControl);

    // set overlay for status window of active users to hyperwall
    var activeUsers = document.getElementById('activeStatusInfo');
    map.controls[google.maps.ControlPosition.TOP].push(activeUsers);
}

// if the page is resized, reset the limits
function setLimits( )
{
    //xmax = document.documentElement.clientWidth - 48;
    //ymax = document.documentElement.clientHeight - 48;
   //xmax = document.documentElement.clientWidth;
   //ymax = 550;
   //console.log("xmax:" + xmax);
   //console.log("ymax:" + ymax);
    //resizeNames();

    i = $("#map_canvas")[0];
    ymin = i.offsetTop;
    ymax = i.offsetTop+i.offsetHeight;
    xmin = i.offsetLeft;
    xmax = i.offsetLeft+i.offsetWidth;
    console.log("xmax:" + xmax);
    console.log("xmin:" + xmin);
    console.log("ymax:" + ymax);
    console.log("ymin:" + ymin);
}

//debounced resize-event
//window.addEventListener('resize', setLimits, false);

function zoomIn()
{
    var currentZoom = map.getZoom();
    console.log("zoomIn() called with current zoom level: " + currentZoom);
    map.setZoom(currentZoom + 1);
}

function zoomOut()
{
    var currentZoom = map.getZoom();
    console.log("zoomIn() called with current zoom level: " + currentZoom);
    map.setZoom(currentZoom - 1);
}

function testCall( )
{
    console.log("works!!");
}

function movemousekinect(id, kinectX, kinectY)
{
	var bug = mouse[id];
	
	// find new position
	var x = xmax * kinectX;
	var y = ymax * kinectY;

	// dont allow position to be out of bounds
	/*
	if ( x < 0 ) x = 0;
	else if ( x > xmax ) x = xmax;
	if ( y < 0 ) y = 0;
	else if ( y > ymax ) y = ymax;
*/

	// finally, store the position back in array...
	bug.xpos = x; bug.ypos = y;
	// and move the object
	bug.object.style.left = x + "px";
	bug.object.style.top  = y + "px";
	bug = null; // memory leak debug, set null 
}

// constructor for one "Mouse" object:
function Mouse( obj, x,y,dx,dy,t )
{
	this.object   = obj;
	this.xpos     = x;
	this.ypos     = y;
}


// constructor for one "Mouse" object:
function Mouse( obj, x,y,dx,dy,t )
{
    this.object   = obj;
    this.xpos     = x;
    this.ypos     = y;
}

// the master array controlling everything:
var mouse = [];

// called when the page is loaded...sets up all the bugs
function startMouse( )
{
    setLimits(); // on startup, same as a resize
    // handles any number of bugs, up to 10
    for ( var mouseNum = 1; mouseNum < 5; ++mouseNum )
    {
        // find one
        var mouseImage = document.getElementById("mouse"+mouseNum);
        if ( mouseImage == null ) break; // but stop when no more to be found

        // put this bug, with its initial info, into the array:
        mouse[mouseNum] =
            new Mouse( mouseImage,
                    200,
                    200
                    );
    }
}

function updateMap(id, accelX, accelY)
{
    if (!map) return;

    var presentTime = (new Date).getTime();
    var t = (presentTime - lastRecordedTime) / 1000; // seconds
    lastRecordedTime = presentTime;

    var factor = 2;
    var airmouse_1_x = accelX * factor;
    var airmouse_1_y = accelY * factor;

    movemouse(id, airmouse_1_x, airmouse_1_y);

}


function movemouse(id, accelX, accelY)
{
    var bug = mouse[id];
    var factor = 2;

    accelX = accelX * factor;
    accelY = accelY * factor;

    // find new position
    var x = bug.xpos + accelX;
    var y = bug.ypos + accelY;

    // dont allow position to be out of bounds
    if ( x < xmin ) x = xmin;
    else if ( x > xmax ) x = xmax;
    if ( y < ymin ) y = ymin;
    else if ( y > ymax ) y = ymax;

    // finally, store the position back in array...
    bug.xpos = x; bug.ypos = y;
    // and move the object
    bug.object.style.left = x + "px";
    bug.object.style.top  = y + "px";
    bug = null; // memory leak debug, set null 
}

function mouseClick(id)
{
    console.log("mouse clicked with id: " + id);
    //setLimits();

    var bug = mouse[id];

    // find current position
    var x = bug.xpos;
    var y = bug.ypos;

    /*
    if(x > 1050)
    {
        if(y < 160)
        {
            // call martin
            if( jWebSocketClient.isConnected() )
            {
                jWebSocketClient.sendToken({
                    type: "call",
                    num: "6507777777"
                });
            }
        }
        else if(y > 160 && y < 290)
        {
            // call ted
            if( jWebSocketClient.isConnected() )
            {
                jWebSocketClient.sendToken({
                    type: "call",
                    num: "6508888888"
                });
            }
        }
        else if(y > 290 && y < 430)
        {
            // call faisal
            if( jWebSocketClient.isConnected() )
            {
                jWebSocketClient.sendToken({
                    type: "call",
                    num: "6509999999"
                });
            }
        }
    }
    */

    if(xmax - x < 200){
        console.log("Call anyone!");

        if(y < 160)
        {
            // call martin

            if( jWebSocketClient.isConnected() )
            {
                var lToken = {
                    ns: jws.SamplesPlugIn.NS,
                    type: "call",
                    num: "6507777777",
                    subType: "exec"
                };
                jWebSocketClient.sendToken( lToken,  {});
            console.log("Call Martin");
            }
        }
        else if(y > 160 && y < 290)
        {
            // call ted
            if( jWebSocketClient.isConnected() )
            {
                var lToken = {
                    ns: jws.SamplesPlugIn.NS,
                    type: "call",
                    num: "6508888888",
                    subType: "exec"
                };
                jWebSocketClient.sendToken( lToken,    {});
            }
            console.log("Call Ted");
        }
        else if(y > 290 && y < 430)
        {
            // call faisal
            if( jWebSocketClient.isConnected() )
            {
                var lToken = {
                    ns: jws.SamplesPlugIn.NS,
                    type: "call",
                    num: "6509999999",
                    subType: "exec"
                };
                jWebSocketClient.sendToken( lToken,    {});
            }
            console.log("Call Faisal");
        }
    }


    var bounds = map.getBounds();
    var southWest = bounds.getSouthWest();
    var northEast = bounds.getNorthEast();
    lng_span = northEast.lng() - southWest.lng();
    lat_span = northEast.lat() - southWest.lat();

    south_west_lat = southWest.lat();
    south_west_lng = southWest.lng();


console.log("xmax: " + xmax + " ymax: " + ymax + "current positions x:" + x + " y:" + y);				
var diff = ymax - y;
var diffRatio = diff/ymax;
var latDiff = diffRatio * lat_span;
var clat =  south_west_lat + latDiff;
console.log("diff:" + diff);
console.log("diffRatio:" + diffRatio);
console.log("latDiff:" + latDiff);
console.log("clat:" + clat);


var x_real = x - 130;
var xmax_real = xmax - 130;

diff = x_real;
diffRatio = diff/xmax_real;
var lngDiff = diffRatio * lng_span;
var clng =  south_west_lng + lngDiff;
console.log("diff:" + diff);
console.log("diffRatio:" + diffRatio);
console.log("lngDiff:" + lngDiff);
console.log("clng:" + clng);

//open_popup_window();

    var click_position = new google.maps.LatLng(clat,clng);

    for(var i=0;i<markerArray.length;i++){
        var distance = google.maps.geometry.spherical.computeDistanceBetween(markerArray[i].position, click_position);
        console.log("distance: "+distance);
        if(distance < 80){

            window.open('/entities/' + markerArray[i].id, '_blank', 'width=600,height=800,resizable=no,left=' + x);
            /*
            var infowindow = new google.maps.InfoWindow({
	            content: 'holding...'
	        });
            infowindow.setContent(markerArray[i].html);
            infowindow.open(map,markerArray[i]);
            */
            break;
        }
    }


setMarkers(clat, clng);
}

var beaches = [
['Bondi Beach', 37.41046, -122.060616, 4],
    ['Coogee Beach', 37.41046, -122.060616, 5],
    ['Cronulla Beach', 37.41046, -122.060616, 3],
    ['Manly Beach', 37.41046, -122.060616, 2],
    ['Maroubra Beach', 37.41046, -122.060616, 1]
    ];


function open_popup_window(){
    window.open('/entities/53', '_blank', 'width=600,height=800,resizable=no');
}


function setMarkers(clat, clng) 
{
    console.log("setMarkers called!");
    // Add markers to the map

    // Marker sizes are expressed as a Size of X,Y
    // where the origin of the image (0,0) is located
    // in the top left of the image.

    // Origins, anchor positions and coordinates of the marker
    // increase in the X direction to the right and in
    // the Y direction down.
    var image = new google.maps.MarkerImage('beachflag.png',
            // This marker is 20 pixels wide by 32 pixels tall.
            new google.maps.Size(20, 32),
            // The origin for this image is 0,0.
            new google.maps.Point(0,0),
            // The anchor for this image is the base of the flagpole at 0,32.
            new google.maps.Point(0, 32));
    var shadow = new google.maps.MarkerImage('beachflag_shadow.png',
            // The shadow image is larger in the horizontal dimension
            // while the position and offset are the same as for the main image.
            new google.maps.Size(37, 32),
            new google.maps.Point(0,0),
            new google.maps.Point(0, 32));
    // Shapes define the clickable region of the icon.
    // The type defines an HTML &lt;area&gt; element 'poly' which
    // traces out a polygon as a series of X,Y points. The final
    // coordinate closes the poly by connecting to the first
    // coordinate.
    var shape = {
coord: [1, 1, 1, 20, 18, 20, 18 , 1],
       type: 'poly'
    };
    //for (var i = 0; i < locations.length; i++) {
    var beach = beaches[0];
    //var myLatLng = new google.maps.LatLng(beach[1], beach[2]);
    var myLatLng = new google.maps.LatLng(clat, clng);
    var marker = new google.maps.Marker({
position: myLatLng,
map: map,
shadow: shadow,
icon: image,
shape: shape,
title: beach[0],
zIndex: beach[3]
});
}


// Wrappers that allow the server to issue panning commands directly
//BEWARE:  If fired too frequenty, no reloading may occurr, see
// http://stackoverflow.com/questions/7493079/google-maps-javascript-api-v3-continuous-panning
// AND SOLUTION
function pan_right() {
    map.panBy(panning_step, 0);
}
function pan_left() {
    map.panBy(-panning_step, 0);
}
function pan_up() {
    map.panBy(0, -panning_step);
}
function pan_down() {
    map.panBy(0, panning_step);
}