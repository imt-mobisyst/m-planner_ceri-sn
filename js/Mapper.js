import { Zone } from './Zone.js';


class Map {
    constructor(mapId, options = {}) {
        this.mapId = mapId;
        this.map = null;
        this.zones = []
        this.defaultOptions = {
            center: [51.505, -0.09], // Default center (latitude, longitude)
            start_zoom: 15, // Default zoom level
            tileLayerUrl: 'http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', // Default tile layer
            tileLayerOptions: {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            },
            zoomDelta : 0.52,
            config : {
                minZoom: 1,
                maxZoom: 40,
            }
        };
        this.options = { ...this.defaultOptions, ...options };

    }

    initializeMap() {

            let config = {
                minZoom: 1,
                maxZoom: 40,
            }
/*
            this.map = L.map('map', config).setView(this.options.center, this.options.start_zoom);
*/
            this.setView()
            let googleSat = L.tileLayer(this.options.tileLayerUrl, {
                maxZoom: 40,
                subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
            }).addTo(this.map);

            this.drawPannelControl()

    }

    addMarker(lat, lng, popupText = '') {
        const marker = L.marker([lat, lng]).addTo(this.map);
        if (popupText) {
            marker.bindPopup(popupText);
        }
    }

    addCircle(lat, lng, radius, options = {}) {
        L.circle([lat, lng], { radius, ...options }).addTo(this.map);
    }

    addPolygon(latlngs, options = {}) {
        L.polygon(latlngs, options).addTo(this.map);
    }

    setView(lat = this.options.center[0], lng = this.options.center[1], zoom = this.options.start_zoom) {
        this.map = L.map(this.mapId, this.options.config).setView([lat, lng], this.options.start_zoom);
    }

    getMap() {
        return this.map;
    }

    drawPannelControl(){

        const drawControl = new L.Control.Draw({
            draw: {
                polygon: true,
                circle: true,
                rectangle: true,
                polyline: false,
                marker: false,
                circlemarker: false
            },
            edit: {
                featureGroup: new L.FeatureGroup().addTo(this.map)
            }
        });

        this.map.addControl(drawControl);
        this.drawEventListener()

    }

    drawEventListener(){

        this.map.on(L.Draw.Event.CREATED, (event) => {
            const layer = event.layer;
            this.map.addLayer(layer);
        });

        const drawnZone = new Zone(layer)
    }
}