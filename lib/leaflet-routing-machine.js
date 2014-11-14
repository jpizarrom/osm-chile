(function() {
    'use strict';

	L.Routing.PlanM = L.Routing.Plan.extend({
		_createGeocoder: function(i) {
			var _this = this;
			var geocoderElem = L.DomUtil.create('input', ''),
				wp = this._waypoints[i];
			geocoderElem.setAttribute('placeholder', this.options.geocoderPlaceholder(i, this._waypoints.length));
			geocoderElem.className = this.options.geocoderClass(i, this._waypoints.length);

			this._updateWaypointName(i, geocoderElem);
			// This has to be here, or geocoder's value will not be properly
			// initialized.
			// TODO: look into why and make _updateWaypointName fix this.
			geocoderElem.value = wp.name;

			L.DomEvent.addListener(geocoderElem, 'click', function() {
				this.select();
			}, geocoderElem);

			new L.Routing.Autocomplete(geocoderElem, function(r) {
					geocoderElem.value = r.name;
					wp.name = r.name;
					wp.latLng = r.center;
					this._updateMarkers();
					this._fireChanged();
					_this._map.panTo(wp.latLng);
				}, this, L.extend({
					resultFn: this.options.geocoder.geocode,
					resultContext: this.options.geocoder,
					autocompleteFn: this.options.geocoder.suggest,
					autocompleteContext: this.options.geocoder
				}, this.options.autocompleteOptions));

			return geocoderElem;
		},
	});
	L.Routing.planm = function(waypoints, options) {
		return new L.Routing.PlanM(waypoints, options);
	};

    L.Routing.OSRMM = L.Routing.OSRM.extend({
 		options: {
			carosrm: 'http://router.project-osrm.org/viaroute',
			car: 'http://osrm-chile-car.herokuapp.com/viaroute',
			bicycle: 'http://osrm-chile-bicycle.herokuapp.com/viaroute',
			foot: 'http://osrm-chile-foot.herokuapp.com/viaroute',
 		},
		_buildRouteUrl: function(waypoints) {
            console.log("L.Routing.OSRMM _buildRouteUrl");
			var locs = [],
			    locationKey,
			    hint,
			    transport;

			for (var i = 0; i < waypoints.length; i++) {
				locationKey = this._locationKey(waypoints[i].latLng);
				locs.push('loc=' + locationKey);

				hint = this._hints.locations[locationKey];
				if (hint) {
//					locs.push('hint=' + hint);
				}
			}
			transport = $('#travel-mode input:checked').attr('value');
			if (transport == undefined)
				transport = "car"
			console.log("transport", transport);
            return this.options[transport] + '?' +
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
			position: 'topleft',
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
            this._toggled = false;
            this._toggledNav = false;

            this.on('routingerror', function(err) {
					if (err) {
						console.log(err);
						alert(err.error.status_message);
						return;
					}
				});
        },
		onAdd: function(map) {
            console.log("L.Routing.ControlM onAdd");
			var container = L.Routing.Control.prototype.onAdd.call(this, map);

			var travelmode = this.createTravelModels();
			container.insertBefore(travelmode, container.firstChild);

			return container;
		},
		createTravelModels: function() {
			var travelmode, span, input, label, img, a;

			travelmode = L.DomUtil.create('div', 'seleccion');
			travelmode.id = "travel-mode";
		
			span = L.DomUtil.create('span', 'campo');
			input = L.DomUtil.create('input');
			input.name = "travel-mode";
			input.id = "travel-foot";
			input.type = "radio";
			input.value = "foot";
			label = L.DomUtil.create('label');
			label.for = "travel-foot";
			img = L.DomUtil.create('img');
			img.src = "images/apie.png";
			img.name = "rutas a pie";
			span.appendChild(input);
			span.appendChild(label);
			label.appendChild(img);
			travelmode.appendChild(span);

			span = L.DomUtil.create('span', 'campo');
			input = L.DomUtil.create('input');
			input.name = "travel-mode";
			input.id = "travel-car";
			input.type = "radio";
			input.value = "car";
			label = L.DomUtil.create('label');
			label.for = "travel-car";
			img = L.DomUtil.create('img');
			img.src = "images/auto.png";
			img.name = "rutas a pie";
			span.appendChild(input);
			span.appendChild(label);
			label.appendChild(img);
			travelmode.appendChild(span);

			span = L.DomUtil.create('span', 'campo');
			input = L.DomUtil.create('input');
			input.name = "travel-mode";
			input.id = "travel-bicycle";
			input.type = "radio";
			input.value = "bicycle";
			input.checked="checked";
			label = L.DomUtil.create('label');
			label.for = "travel-bicycle";
			img = L.DomUtil.create('img');
			img.src = "images/bici.png";
			img.name = "rutas a pie";
			span.appendChild(input);
			span.appendChild(label);
			label.appendChild(img);
			travelmode.appendChild(span);

			span = L.DomUtil.create('span', 'campo');
			input = L.DomUtil.create('input');
			input.name = "travel-mode";
			input.id = "travel-carosrm";
			input.type = "radio";
			input.value = "carosrm";
			label = L.DomUtil.create('label');
			label.for = "travel-carosrm";
			img = L.DomUtil.create('img');
			img.src = "images/auto.png";
			img.name = "rutas a pie";
			span.appendChild(input);
			span.appendChild(label);
			label.appendChild(img);
			travelmode.appendChild(span);

			span = L.DomUtil.create('span', 'campo');
			a = L.DomUtil.create('span','nav-mode');
			a.innerHTML = "nav";
			if (L.Browser.touch) {
				L.DomEvent
					.on(a, 'click', L.DomEvent.stop)
					.on(a, 'click', this._toggleNav, this);
			} else {
				L.DomEvent.on(a, 'focus', this._toggleNav, this);
			}
			span.appendChild(a);
			travelmode.appendChild(a);

			span = L.DomUtil.create('span', 'campo');
			a = L.DomUtil.create('span','nav-mode');
			a.innerHTML = "hide";
			if (L.Browser.touch) {
				L.DomEvent
					.on(a, 'click', L.DomEvent.stop)
					.on(a, 'click', this._toggle, this);
			} else {
				L.DomEvent.on(a, 'focus', this._toggle, this);
			}
			span.appendChild(a);
			travelmode.appendChild(a);

			return travelmode;
		},
		_toggle: function () {
			if (!this._toggled) {
					L.DomUtil.addClass(this._container, 'leaflet-routing-hide');
			}else{
					L.DomUtil.removeClass(this._container, 'leaflet-routing-hide');
			}
			this._toggled = !this._toggled;
		},
		_toggleNav: function () {
			if (!this._toggledNav) {
				L.DomUtil.addClass(this._container, 'leaflet-routing-navmode');
				L.DomUtil.addClass(this._container.firstChild.nextSibling, 'leaflet-routing-navmode');
			}else{
				L.DomUtil.removeClass(this._container, 'leaflet-routing-navmode');
				L.DomUtil.removeClass(this._container.firstChild.nextSibling, 'leaflet-routing-navmode');
			}
			this._toggledNav = !this._toggledNav;
		},
		_addRowListeners: function(row, coordinate) {
			var _this = this,
			    marker;
			L.DomEvent.addListener(row, 'mouseover', function() {
				marker = L.circleMarker(coordinate,
					_this.options.pointMarkerStyle).addTo(_this._map);
			});
			L.DomEvent.addListener(row, 'mouseout', function() {
				if (marker) {
					_this._map.removeLayer(marker);
					marker = null;
				}
			});
			L.DomEvent.addListener(row, 'click', function(e) {
				var altElem;
				console.log(e);
				altElem = e.target || window.event.srcElement;
				altElem = altElem.parentElement;
				altElem = altElem.parentElement;
				altElem = altElem.parentElement;
				altElem = altElem.parentElement;
				if (L.DomUtil.hasClass(altElem, 'leaflet-routing-alt-minimized')) {
					altElem.click();

				}else {
					_this._map.panTo(coordinate);
				}

				L.DomEvent.stopPropagation(e);
			});
		},
    });
	L.Routing.controlm = function(options) {
		return new L.Routing.ControlM(options);
	};

})();
