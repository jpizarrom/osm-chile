(function() {
    'use strict';

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
			a = L.DomUtil.create('span');
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
			a = L.DomUtil.create('span');
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

			return travelmode;
		},
		_toggle: function () {
			if (!this._toggled) {
				if (this._container.firstChild.nextSibling != null){
					L.DomUtil.addClass(this._container.firstChild.nextSibling, 'leaflet-routing-hide');
					if (this._container.firstChild.nextSibling.nextSibling != null){
						L.DomUtil.addClass(this._container.firstChild.nextSibling.nextSibling, 'leaflet-routing-hide');
						if (this._container.firstChild.nextSibling.nextSibling.nextSibling != null)
						L.DomUtil.addClass(this._container.firstChild.nextSibling.nextSibling.nextSibling, 'leaflet-routing-hide');
				}
			}
			}else{
				if (this._container.firstChild.nextSibling != null){
					L.DomUtil.removeClass(this._container.firstChild.nextSibling, 'leaflet-routing-hide');
					if (this._container.firstChild.nextSibling.nextSibling != null){
						L.DomUtil.removeClass(this._container.firstChild.nextSibling.nextSibling, 'leaflet-routing-hide');
						if (this._container.firstChild.nextSibling.nextSibling.nextSibling != null)
						L.DomUtil.removeClass(this._container.firstChild.nextSibling.nextSibling.nextSibling, 'leaflet-routing-hide');
					}
				}
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
				_this._map.panTo(coordinate);
				_this._map.panBy(new L.Point(0, 120));
				L.DomEvent.stopPropagation(e);
			});
		},
    });
	L.Routing.controlm = function(options) {
		return new L.Routing.ControlM(options);
	};

})();
