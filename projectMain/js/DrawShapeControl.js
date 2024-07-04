// import * as L_ from '/node_modules/leaflet-draw/dist/leaflet.draw-src.js';
import CustomControl from './CustomControl.js';

class DrawShapeControl extends CustomControl {
  constructor(mapInstance) {
    super({
      position: 'topleft',
    });
    this.map = mapInstance;
    this.drawnItems = this.onAdd(mapInstance);
    this.map.addControl(
      new L.Control.Draw({
        edit: {
          featureGroup: this.drawnItems,
          poly: {
            allowIntersection: false,
          },
        },
        draw: {
          polygon: {
            allowIntersection: false,
            showArea: true,
          },
        },
      })
    );
  }

 

  onAdd(map) {
    this._map = map;
    const button = L.DomUtil.create('div');
    L.DomEvent.disableClickPropagation(button);

    button.title = 'locate';
    button.innerHTML = this.options.html;
    button.className = this.options.className;
    button.setAttribute('style', this.options.style);

    L.DomEvent.on(button, 'click', this._clicked, this);

    return button;
  }
}

// Exporting the class for use in other modules
export default DrawShapeControl;
/*

//import * as L from '/node_modules/leaflet-draw/dist/leaflet.draw-src.js';
import * as L from '/node_modules/leaflet/dist/leaflet-src.esm.js';
// --------------------------------------------------------------
class DrawShapeControl extends L.Control {
  constructor() {
    super({
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
    });
  }

  /* constructor(map, drawnItems) {
    super(); // Call the constructor of the base class
    this.map = map;
    this.drawnItems = drawnItems;
    this.initializeDrawControl();
    this.initializeEventListeners();
    console.log('DrawShapeControl initialized');*/

/*initializeDrawControl() {
    this.map.addControl(
      new L.Control.Draw({
        edit: {
          featureGroup: this.drawnItems,
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
  }

  initializeEventListeners() {
    this.map.on(L.Draw.Event.CREATED, this.onDrawCreated.bind(this));
  }

  onDrawCreated(event) {
    let layer = event.layer;
    let feature = (layer.feature = layer.feature || {});
    let type = event.layerType;

    feature.type = feature.type || 'Feature';
    let props = (feature.properties = feature.properties || {});

    props.type = type;

    if (type === 'circle') {
      props.radius = layer.getRadius();
    }

    layer.on('click', this.onLayerClick.bind(this, layer));
    this.drawnItems.addLayer(layer);
  }

  onLayerClick(layer, event) {
    if (confirm('Restricted Zone?')) {
      layer.setStyle({ fillColor: '#0000FF', color: '0000FF' });
      this.restrictedZones.push(layer);
    } else {
      this.missionZones.push(layer);
    }
  }

  //--------draw polygon, circle, rectangle, polyline--------

  /*let drawnItems = L.featureGroup().addTo(map);

map.addControl(
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

map.on(L.Draw.Event.CREATED, function (event) {
  let layer = event.layer;
  let feature = (layer.feature = layer.feature || {});
  let type = event.layerType;

  feature.type = feature.type || 'Feature';
  let props = (feature.properties = feature.properties || {});

  props.type = type;

  if (type === 'circle') {
    props.radius = layer.getRadius();
  }

  layer.on('click', function (event) {
    if (confirm('Restricted Zone?')) {
      layer.setStyle({ fillColor: '#0000FF', color: '0000FF' });
      restrictedZones.push(layer);
    } else {
      missionZones.push(layer);
    }
  });

  drawnItems.addLayer(layer);
});

doAction() {
  window.alert('Search is yet to be implemented');
}
}

// Exporting the class for use in other modules
export default DrawShapeControl;


*/
