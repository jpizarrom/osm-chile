(function() {
    'use strict';

    L.Routing.OSRMM = L.Routing.OSRM.extend({
 		options: {
			carosrm: 'http://router.project-osrm.org/viaroute',
			car: 'http://osrm-chile-car.herokuapp.com/viaroute',
			bicycle: 'http://osrm-chile-bicycle.herokuapp.com/viaroute',
			foot: 'http://osrm-chile-foot.herokuapp.com/viaroute'
 		},
		_buildRouteUrl: function(waypoints) {
            console.log("L.Routing.OSRMM _buildRouteUrl");
			var locs = [],
			    locationKey,
			    hint;

			for (var i = 0; i < waypoints.length; i++) {
				locationKey = this._locationKey(waypoints[i].latLng);
				locs.push('loc=' + locationKey);

				hint = this._hints.locations[locationKey];
				if (hint) {
//					locs.push('hint=' + hint);
				}
			}

            return this.options[$('#travel-mode input:checked').attr('value')] + '?' +
				'instructions=true&' +
				locs.join('&') +
				(this._hints.checksum !== undefined ? '&checksum=' + this._hints.checksum : '');
		},
    });
	L.Routing.osrmm = function(options) {
		return new L.Routing.OSRMM(options);
	};

})();
