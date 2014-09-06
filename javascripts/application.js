/**
 *
 * Copyright (c) 2010 Digitales por Chile ( http://digitalesporchile.org )
 * Dual licensed under the MIT and GPL licenses.
 * Check LICENCE-MIT and LICENSE-GPL for details.
 *
 **/

L.Control.Header = L.Control.extend({
  options: {
    position: 'topleft'
  },
  initialize: function (options) {
	console.log("L.Control.Button initialize");
    L.setOptions(this, options);
  },

  onAdd: function (map) {
	console.log("L.Control.Button onAdd");
    this._map = map;
    var container = L.DomUtil.create('div','menu');

    var bar = (function () {/*
	<h1><img src="images/logotransparencia.gif" alt="OpenStreetMap Chile"></h1>
	<div class="botones">
	<a href="http://blog.openstreetmap.cl/">Blog</a>
	<a href="http://lists.openstreetmap.org/listinfo/talk-cl">Lista</a>
	<a href="http://wiki.openstreetmap.org/wiki/ES:Main_Page">Wiki</a>
	<a href="http://www.openstreetmap.org/">OpenStreetMap<span class="org">.org</span></a>
	<a href="http://www.openstreetmap.cl/comparacion/">Comparación</a>
	<a href="#" id="permalink_edit">Editar</a>
*/}).toString().match(/[^]*\/\*([^]*)\*\/\}$/)[1];

    container.innerHTML = bar;
	
    this._container = container;
    
    return this._container;
  },
});

var OSM = (function() {
   
  var map;
  var geocoder;
  var control_geocoder;
  var control_routing;
  
  function init() {
	load_map();
	new L.Control.Header().addTo(map);
	new L.Control.Locate({ position: 'topright' }).addTo(map);
    setup_search();
    setup_styles();
    setup_routing();
    new L.Control.Zoom({ position: 'topright' }).addTo(map);
//    new L.Control.Locate({ position: 'topright' }).addTo(map);

  }

  var directions = null;
  var waypoints = [];
  var marker;
  
  function directions_menu_from (e) {
        console.log("directions_menu_from");
		add_waypoint(0, e.latlng,'directions-menu-from');
      }
  function directions_menu_to (e) {
        console.log("directions_menu_to");
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
			layers: [styles["OSM Foundation"]],
			contextmenu: true,
			contextmenuWidth: 140,
			contextmenuItems: [{
		      text: 'Desde',
		      callback: directions_menu_from
	      	},{
		      text: 'Hasta',
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
		zoomControl: false,
		}).setView([-33.444047234512354, -70.64775466918945], 15);

//		geocoder = L.Control.Geocoder.nominatim();
/*		
		control_geocoder = L.Control.geocoderm({
			geocoder: geocoder,
			waypoint_position: 0,
		}).addTo(map);
		control_geocoder = L.Control.geocoderm({
			geocoder: geocoder,
			waypoint_position: 1,
		}).addTo(map);
*/

		var marker;

/*	L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
	}).addTo(map);
*/

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
  function setup_routing() {
/*	control_routing = new L.Control.Button()
		.addTo(map);
*/

	control_routing = L.Routing.controlm({
		waypoints: waypoints,
		geocoder: L.Control.Geocoder.nominatim(),
		plan: L.Routing.plan(null, {
		    waypointIcon: function(i) {
		        return new L.Icon.Label.Default({ labelText: String.fromCharCode(65 + i) });
		    }
		}),
		router: L.Routing.osrmm()

	}).addTo(map);

$( "input:radio" ).click( function() {
//    control_routing.setWaypoints(waypoints);
    control_routing.spliceWaypoints(waypoints);
});

  }
  function reset_route() {
//	waypoints = [];
//	control_routing.setWaypoints(waypoints);
  }
  var styles = {
	"OSM Foundation": L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
	    maxZoom: 18
	}),

	"OpenCycleMap": L.tileLayer('http://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="http://www.opencyclemap.org">OpenCycleMap</a>, &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
	}),

	"MapQuestOpen.OSM": L.tileLayer('http://otile{s}.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.jpeg', {
		attribution: 'Tiles Courtesy of <a href="http://www.mapquest.com/">MapQuest</a> &mdash; Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
	subdomains: '1234'
	}),

	"Thunderforest.Transport": L.tileLayer('http://{s}.tile.thunderforest.com/transport/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="http://www.opencyclemap.org">OpenCycleMap</a>, &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
	}),

	"OpenMapSurfer.Roads": L.tileLayer('http://openmapsurfer.uni-hd.de/tiles/roads/x={x}&y={y}&z={z}', {
		attribution: 'Imagery from <a href="http://giscience.uni-hd.de/">GIScience Research Group @ University of Heidelberg</a> &mdash; Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
	}),

	"http://santiago.pedaleable.org": L.tileLayer('http://b.tiles.mapbox.com/v3/ignacioabe.map-u0vknw7q/{z}/{x}/{y}.png', {
	    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
	    maxZoom: 18
	}),

  };
function setup_styles() {
	L.control.layers(styles).addTo(map);
  }
  return {
    init: init,
    add_waypoint: add_waypoint
  };
})();

$(function() {
  OSM.init();

});
