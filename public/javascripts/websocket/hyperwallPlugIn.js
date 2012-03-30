//	---------------------------------------------------------------------------
//	jWebSocket Sample Client PlugIn (uses jWebSocket Client and Server)
//	(C) 2010 jWebSocket.org, Alexander Schulze, Innotrade GmbH, Herzogenrath
//	---------------------------------------------------------------------------
//	This program is free software; you can redistribute it and/or modify it
//	under the terms of the GNU Lesser General Public License as published by the
//	Free Software Foundation; either version 3 of the License, or (at your
//	option) any later version.
//	This program is distributed in the hope that it will be useful, but WITHOUT
//	ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
//	FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for
//	more details.
//	You should have received a copy of the GNU Lesser General Public License along
//	with this program; if not, see <http://www.gnu.org/licenses/lgpl.html>.
//	---------------------------------------------------------------------------


//	---------------------------------------------------------------------------
//  jWebSocket Sample Client Plug-In
//	---------------------------------------------------------------------------

jws.SamplesPlugIn = {

	// namespace for shared objects plugin
	// if namespace is changed update server plug-in accordingly!
	NS: jws.NS_BASE + ".plugins.hyperwall",

	processToken: function( aToken ) {
		console.log("hyperwallPlugin.processToken with request type" + aToken.reqType + " " + aToken.type);
		// testCall();
		// check if namespace matches
		//if( aToken.ns == jws.SamplesPlugIn.NS ) {
			// here you can handle incomimng tokens from the server
			// directy in the plug-in if desired.
			if( "requestServerTime" == aToken.reqType ) {
				// this is just for demo purposes
				// don't use blocking calls here which block the communication!
				// like alert( "jWebSocket Server returned: " + aToken.time );
				if( this.OnSamplesServerTime ) {
					this.OnSamplesServerTime( aToken );
				}
			}
			else if( "a" == aToken.type ) {
				// this is just for demo purposes
				// don't use blocking calls here which block the communication!
				// like alert( "jWebSocket Server returned: " + aToken.time );
				//console.log("mouse event received");
				console.log(aToken.x + " " + aToken.y + " value received!" );
				updateMap(aToken.id, aToken.x, aToken.y);
				//testCall();
				//if( this.isConnected() ) {
				//	var lToken = {
				//		//ns: jws.SamplesPlugIn.NS,
				//		msg: "cr"
				//	};
				//	this.sendToken( lToken);
				//}	
			}
			else if("m" == aToken.type ) {
				mouseClick(aToken.id);
			}
			
			else if("i" == aToken.type ) {
				zoomIn();
			}
			
			else if("o" == aToken.type ) {
				zoomOut();
			}
			else if("k" == aToken.type ) {
				// this is a kinect move command
				//console.log(aToken.kx + " " + aToken.ky + " value received from kinect!" );
				//movemousekinect(aToken.id, aToken.kx, aToken.ky);
			}
		//}
	},

	requestServerTime: function( aOptions ) {
		var lRes = this.createDefaultResult();
		if( this.isConnected() ) {
			var lToken = {
				ns: jws.SamplesPlugIn.NS,
				type: "requestServerTime"
			};
			this.sendToken( lToken,	aOptions );
		} else {
			lRes.code = -1;
			lRes.localeKey = "jws.jsc.res.notConnected";
			lRes.msg = "Not connected.";
		}
		return lRes;
	},
	
	requestFaisal: function( aOptions ) {
		var lRes = this.createDefaultResult();
		if( this.isConnected() ) {
			var lToken = {
				ns: jws.SamplesPlugIn.NS,
				type: "requestFaisal"
			};
			this.sendToken( lToken,	aOptions );
		} else {
			lRes.code = -1;
			lRes.localeKey = "jws.jsc.res.notConnected";
			lRes.msg = "Not connected.";
		}
		return lRes;
	},

	setSamplesCallbacks: function( aListeners ) {
		if( !aListeners ) {
			aListeners = {};
		}
		if( aListeners.OnSamplesServerTime !== undefined ) {
			this.OnSamplesServerTime = aListeners.OnSamplesServerTime;
		}
	}

}

// add the JWebSocket Shared Objects PlugIn into the TokenClient class
jws.oop.addPlugIn( jws.jWebSocketTokenClient, jws.SamplesPlugIn );
