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

	L.Routing.ControlM = L.Routing.Control.extend({
		options: {
			position: 'bottomright',
			units: 'metric',
			pointMarkerStyle: {
				radius: 5,
				color: '#03f',
				fillColor: 'white',
				opacity: 1,
				fillOpacity: 0.7
			}
		},
		initialize: function(options) {
            console.log("L.Routing.ControlM initialize");
            L.Routing.Control.prototype.initialize.call(this, options);
        },
		onAdd: function(map) {
            console.log("L.Routing.ControlM onAdd");
//			var container = L.Routing.Itinerary.prototype.onAdd.call(this, map);
   			var container = this.__onAdd(map);

			this._map = map;
			this._map.addLayer(this._plan);

			if (this.options.geocoder) {
                this._plan.createGeocoders();
//				container.insertBefore(this._plan.createGeocoders(), container.firstChild);
			}

			return container;
		},

		___onAdd: function() {
            console.log("L.Routing.ControlM onAdd");
			this._container = L.DomUtil.create('div', 'leaflet-routing-container leaflet-bar');
			L.DomEvent.disableClickPropagation(this._container);
			L.DomEvent.addListener(this._container, 'mousewheel', function(e) {
				L.DomEvent.stopPropagation(e);
			});

			return this._container;
		},
		__onAdd: function() {
            console.log("L.Routing.ControlM onAdd old");
			var className = 'leaflet-routing-container',
				container = this._container = L.DomUtil.create('div', className);
			this._toggled = false;
//			this._container = L.DomUtil.create('div', 'leaflet-routing-container');
			L.DomEvent.disableClickPropagation(this._container);
			L.DomEvent.addListener(this._container, 'mousewheel', function(e) {
				L.DomEvent.stopPropagation(e);
			});
			var list = this._containerlist = L.DomUtil.create('div', className + '-list');

			var link = this._layersLink = L.DomUtil.create('a', className + '-toggle', container);
            L.DomUtil.addClass(this._layersLink, 'leaflet-routing-container-toggle-hidden');
			link.href = '#';
			link.title = 'Layers';
//			link.innerHTML = 'Layers';

			if (L.Browser.touch) {
				L.DomEvent
					.on(link, 'click', L.DomEvent.stop)
					.on(link, 'click', this._toggle, this);
				} else {
				L.DomEvent.on(link, 'focus', this._toggle, this);
			}

            var clearLink = L.DomUtil.create('a', className + '-toggle', container);
			clearLink.href = '#';
			clearLink.title = 'Layers';
//			link.innerHTML = 'Layers';

			if (L.Browser.touch) {
				L.DomEvent
					.on(clearLink, 'click', L.DomEvent.stop)
					.on(clearLink, 'click', this._clearLine, this)
                    .on(clearLink, 'click', this._clearAlts, this);
				} else {
				L.DomEvent.on(clearLink, 'focus', this._clearLine, this);
                L.DomEvent.on(clearLink, 'focus', this._clearAlts, this);
			}

			container.appendChild(list);

			return this._container;
		},
		
		_toggle: function () {
			if (!this._toggled) {
				L.DomUtil.addClass(this._container, 'leaflet-routing-container-expanded');
			}else{
				L.DomUtil.removeClass(this._container, 'leaflet-routing-container-expanded');
			}

			this._toggled = !this._toggled;
		},

		setAlternatives__: function(routes) {
            console.log("L.Routing.ControlM _setAlternatives");
            L.DomUtil.removeClass(this._layersLink, 'leaflet-routing-container-toggle-hidden');
            L.Routing.Control.prototype.setAlternatives.call(this, routes);
        },

		setAlternatives: function(routes) {
			var i,
			    alt,
			    altDiv;

            L.DomUtil.removeClass(this._layersLink, 'leaflet-routing-container-toggle-hidden');
//			this._clearAlts();

			this._routes = routes;

			for (i = 0; i < this._routes.length; i++) {
				alt = this._routes[i];
				altDiv = L.DomUtil.create('div', 'leaflet-routing-alt' +
					(i > 0 ? ' leaflet-routing-alt-minimized' : ''),
					this._containerlist);
				altDiv.innerHTML = '<h2>' + alt.name + '</h2>' +
					'<h3>' + this._formatDistance(alt.summary.totalDistance) +
					', ' + this._formatTime(alt.summary.totalTime) + '</h3>';
				L.DomEvent.addListener(altDiv, 'click', this._onAltClicked, this);

				altDiv.appendChild(this._createItineraryTable(alt));
				this._altElements.push(altDiv);
			}



			this.fire('routeselected', {route: this._routes[0]});
		},

		_clearAlts: function() {
			var i,
				alt;
			// TODO: this is really inelegant
			for (i = 0; this._containerlist && i < this._containerlist.children.length; i++) {
				alt = this._containerlist.children[i];
				if (L.DomUtil.hasClass(alt, 'leaflet-routing-alt')) {
					this._containerlist.removeChild(alt);
					i--;
				}
			}

			this._altElements = [];
		},


    });
	L.Routing.controlm = function(options) {
		return new L.Routing.ControlM(options);
	};

})();
