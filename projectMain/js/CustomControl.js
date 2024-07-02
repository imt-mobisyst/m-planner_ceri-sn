import * as L from '/node_modules/leaflet/dist/leaflet-src.esm.js';
class CustomControl extends L.Control {
  constructor(obj) {
    super(obj);
  }

  onAdd(map) {
    console.log(L);
    // console.log(L_);
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

  _clicked(e) {
    L.DomEvent.stopPropagation(e);
    this.doAction();
  }

  doAction() {
    console.log('doing click action');
  }

  featureGroup() {
    return new L.FeatureGroup();
  }

  addLegend(text) {
    const checkIfDescriotnExist = document.querySelector('.description');

    if (checkIfDescriotnExist) {
      checkIfDescriotnExist.textContent = text;
      return;
    }

    const legend = L.control({ position: 'bottomleft' });

    legend.onAdd = function () {
      let div = L.DomUtil.create('div', 'description');
      L.DomEvent.disableClickPropagation(div);
      const textInfo = text;
      div.insertAdjacentHTML('beforeend', textInfo);
      return div;
    };
    legend.addTo(this._map);
  }

  addCircle({ accuracy, latitude, longitude }) {
    return L.circle([latitude, longitude], accuracy / 2, {
      className: 'circle-test',
      weight: 2,
      stroke: false,
      fillColor: '#136aec',
      fillOpacity: 0.15,
    });
  }

  addMarker({ latitude, longitude }) {
    return L.marker([latitude, longitude], {
      icon: L.divIcon({
        className: 'located-animation',
        iconSize: L.point(17, 17),
        popupAnchor: [0, -15],
      }),
    }).bindPopup('You are here');
  }

  removeLocate() {
    this._map.eachLayer(function (layer) {
      if (layer instanceof L.Marker) {
        const { icon } = layer.options;
        if (icon?.options.className === 'located-animation') {
          this._map.removeLayer(layer);
        }
      }
      if (layer instanceof L.Circle) {
        if (layer.options.className === 'circle-test') {
          this._map.removeLayer(layer);
        }
      }
    }, this);
  }
}

// Exporting the class to other modules
export default CustomControl;
