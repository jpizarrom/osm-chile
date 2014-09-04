(function() {
    'use strict';

    L.Control.GeocoderM = L.Control.Geocoder.extend({
    	options: {
			position: 'topleft',
			units: 'metric',
			pointMarkerStyle: {
				radius: 5,
				color: '#03f',
				fillColor: 'white',
				opacity: 1,
				fillOpacity: 0.7
			},
			waypoint_position:0
		},
    	onAdd: function (map) {
    		console.log("L.Control.GeocoderM onAdd");
    		//var container = L.DomUtil.get("search_geo");
    		var _container = L.Control.Geocoder.prototype.onAdd.call(this, map);
    		//container.appendChild(_container);
    		return _container;
    	},
    	_geocodeResultSelected: function(result) {
    		console.log("_geocodeResultSelected ", result.center);
    		OSM.add_waypoint(this.options["waypoint_position"], result.center,'directions-menu-from');
    		L.Control.Geocoder.prototype._geocodeResultSelected.call(this, result);

    	}
    });

    L.Control.geocoderm = function(id, options) {
		return new L.Control.GeocoderM(id, options);
	};

})();