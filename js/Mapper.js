import { Zone , RestrictedZone , MissionZone } from './Zone.js';
import { layerGroupClickHandler} from "./utils.js";

export let  gridVisible = false;
export let landmarkLayer


export class Mapper {
    constructor(mapId, options = {}) {
        this.mapId = mapId;
        this.map = null;
        this.zones = []
        this.defaultOptions = {
            center: [-33.7220295, 150.0033845], // Default center (latitude, longitude) e.g. CERI SN lat = 51.505; lng = -0.09
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
        let coordIcon = L.divIcon({className: 'leaflet-div-icon'});
        let coordIconHover = L.divIcon({className: 'leaflet-div-icon'});

        let marker = L.marker([lat, lng], {icon: coordIcon});
        //marker.on('click', e => e.target.remove() );
        marker.on('mouseover', function () {
            marker.icon = coordIconHover;
            marker.bindPopup("Click to apply action on id : !" + marker._leaflet_id).openPopup();
        });
        marker.on('click', layerGroupClickHandler);
        marker.on('mouseout', function () {
            marker.closePopup();
        });
        return marker
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


        let drawnItems = new L.featureGroup();
        this.map.addLayer(drawnItems);
        let drawControl = new L.Control.Draw({
            draw: {
                polygon: true,
                circle: true,
                rectangle: true,
                polyline: false,
                marker: false,
                circlemarker: false
            },
            edit: {

                featureGroup: drawnItems, //new L.FeatureGroup().addTo(this.map)
                remove: true
            }
        });

        this.map.addControl(drawControl);
        this.drawEventListener(drawnItems)


        //2e logique
        /*let drawnItems = L.featureGroup().addTo(this.map);

        this.map.addControl(
            new L.Control.Draw({
                edit: {
                    featureGroup: drawnItems,
                    poly: {
                        allowIntersection: true,
                    },
                },
                draw: {
                    polygon: {
                        allowIntersection: true,
                        showArea: true,
                    },
                },
            })
        );


        this.drawEventListener()*/

    }

    drawEventListener(drawnItems){

        this.map.on(L.Draw.Event.CREATED, (event) => {


            let typeOfDraw = event.layerType;
            let layer = event.layer;
            drawnItems.addLayer(layer);
            this.map.addLayer(layer); //Should bve here to get the layer _leaflet_id

            if( confirm("Restricted Zone?")) {
                layer. setStyle({fillColor: '#FF0000', color : '0000FF'});
                const drawnZone = new RestrictedZone(layer)

                this.zones.push(drawnZone);
            }
            else{
                const drawnZone = new MissionZone(layer)
                this.zones.push(drawnZone);
            }

        });

        this.map.on('draw:deleted', (event) => {
            if (drawnItems.getLayers().length === 0) {
                this.zones = []
            }
            else {
                console.log('There are no drawn layers on the map')
            }
        });
    }


    removeLayerbyId(id){
        if (id){
            this.map.eachLayer((layer) => {
                if (layer._leaflet_id === id) {
                    console.log('layer found removing',layer._leaflet_id ,  id)
                    this.map.removeLayer(layer);

                }
            });
        }
        else{
            console.log('Layer doesn\'t exist')
        }
    }


}



export function setVisibleGrid(value){

    gridVisible = value
}

export function setLandmarkLayer(value){
    landmarkLayer = value
}

