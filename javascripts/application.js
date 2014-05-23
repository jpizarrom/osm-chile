/**
 *
 * Copyright (c) 2010 Digitales por Chile ( http://digitalesporchile.org )
 * Dual licensed under the MIT and GPL licenses.
 * Check LICENCE-MIT and LICENSE-GPL for details.
 *
 **/
var OSM = (function() {
   
  var map;
  var geocoder;
  var control_geocoder;
  var control_routing;
  
  function init() {
	load_map();
    setup_search();
  }

  var directions = null;
  var waypoints = [];
  var marker;
  
  function directions_menu_from (e) {
		add_waypoint(0, e.latlng,'directions-menu-from');
      }
  function directions_menu_to (e) {
		add_waypoint(1, e.latlng,"directions-menu-to");
      }
  function zoomIn (e) {
	      map.zoomIn();
      }

  function zoomOut (e) {
	      map.zoomOut();
      }
  function load_map() {
		map = L.map('map',{
			contextmenu: true,
			contextmenuWidth: 140,
			contextmenuItems: [{
		      text: 'directions-menu-from',
		      callback: directions_menu_from
	      	},{
		      text: 'directions-menu-to',
		      callback: directions_menu_to
	      	},'-', {
        text: 'Zoom in',
        icon: 'images/zoom-in.png',
        callback: zoomIn
		}, {
		    text: 'Zoom out',
		    icon: 'images/zoom-out.png',
		    callback: zoomOut
		}
		],
		}).setView([-39.63953756436669, -71.279296875], 5);
		geocoder = L.Control.Geocoder.nominatim();
//		control_geocoder = L.Control.geocoder({
//			geocoder: geocoder
//		}).addTo(map);

		var marker;

	L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
	}).addTo(map);

	control_routing = L.Routing.control({
		waypoints: waypoints,
//		geocoder: L.Control.Geocoder.nominatim(),
		plan: L.Routing.plan(null, {
		    waypointIcon: function(i) {
		        return new L.Icon.Label.Default({ labelText: String.fromCharCode(65 + i) });
		    }
		})

	}).addTo(map);

  }  
  
  function add_waypoint(index, latlng, name) {
	waypoints[index] = latlng;
	control_routing.setWaypoints(waypoints);
  }
  
  $(function() {
//    $('#travel-mode input').change(update_route);
  });
  
  function setup_search() {
    $('#search').submit(function() {
      var query = to_cloudmade_query($('#query').attr('value'));
	  reset_route();
	  geocoder.geocode(query, function(results) {
		if (!results) return;
		if (results.length==0) return;
		result=results[0];
		map.fitBounds(result.bbox);
		if (marker) {
			map.removeLayer(marker);
		}
		marker = new L.Marker(result.center)
			.bindPopup(result.name)
			.addTo(map)
			.openPopup();
	  });
      return false;
    });
  }
  
  function to_cloudmade_query(query) {
    // Put the first number at the front, and append "Chile"
    // e.g:
    // "Cirujano Guzman 25, Providencia" => "25, Cirujano Guzman, Providencia, Chile"
    return query.replace(/^(.[^0-9]*)\s([0-9]+)(.*)$/, "$2, $1$3") + ", Chile";
  }
  function reset_route() {
//	waypoints = [];
//	control_routing.setWaypoints(waypoints);
  }
  var styles = [];

  return {
    init: init
  };
})();

$(function() {
  OSM.init();

});
