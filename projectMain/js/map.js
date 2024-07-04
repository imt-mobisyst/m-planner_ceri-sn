import * as L from '/node_modules/leaflet/dist/leaflet-src.esm.js';

import MyLocationControl from './MyLocationControl.js';
import SearchLocationControl from './SearchLocationControl.js';
import LoadSaveControl from './LoadSaveControl.js';
import DrawShapeControl from './DrawShapeControl.js';

class MapInitializer {
  constructor() {
    this.latGridValues = [];
    this.lngGridValues = [];
    this.latGridValues_ = [];
    this.lngGridValues_ = [];
    this.gridCoordinates_ = [];
    this.startPoint = L.marker();
    this.clickedLocations = [];
    this.polygon = null;
    this.missionZones = [];
    this.restrictedZones = [];
    this.gridCoordinates = []; // Grid points
    this.missionPoints = L.layerGroup();
    this.pathCoordinates_ = [];
    this.linepathCoordinates_ = L.layerGroup();
    this.gridLayer = L.layerGroup();
    this.llOffset = 0.0000141003948; //0.0000666666666667; // generate a grid with 4.728m between nodes using haversine formula
    this.llOffset_ = null;
    this.selectedStep_ = 1.0;
    this.drawGridBox = false;
    this.bounds = L.latLngBounds();
    this.lines = [];

    this.config = {
      drawControl: true,
      minZoom: 1,
      maxZoom: 40,
    };
    this.zoom = 15;
    this.lat = 50.36667;
    this.lng = 3.06667;

    this.initMap();
  }

  initMap() {
    this.map = L.map('map', this.config);
    console.log(this.map);
    this.map.setView([this.lat, this.lng], this.zoom);
    this.map.options.zoomDelta = 0.52;
    L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
      maxZoom: 40,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    }).addTo(this.map);

    const mylocationControl = new MyLocationControl();
    mylocationControl.addTo(this.map);

    const loadSaveControl = new LoadSaveControl();
    loadSaveControl.map = this.map;
    loadSaveControl.addTo(this.map);

    let drawShapeControl = new DrawShapeControl(this.map);
    //drawShapeControl.map = this.map;
    drawShapeControl.addTo(this.map);

    /*const searchLocationControl = new SearchLocationControl();
    searchLocationControl.map = this.map;
    searchLocationControl.addTo(this.map);*/
  }
}

// Exporting the class to other modules
export default MapInitializer;
