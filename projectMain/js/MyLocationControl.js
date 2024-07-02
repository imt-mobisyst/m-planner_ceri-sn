import CustomControl from './CustomControl.js';

class MyLocationControl extends CustomControl {
  constructor() {
    super({
      position: 'topleft',
      className: 'locate-button leaflet-bar',
      html: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0 0 13 3.06V1h-2v2.06A8.994 8.994 0 0 0 3.06 11H1v2h2.06A8.994 8.994 0 0 0 11 20.94V23h2v-2.06A8.994 8.994 0 0 0 20.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg>',
      style:
        'margin-top: 0; left: 0; display: flex; cursor: pointer; justify-content: center; font-size: 2rem;',
    });
  }

  doAction() {
    const locateActive = document.querySelector('.locate-button');
    const locate = locateActive.classList.contains('locate-active');
    locateActive.classList[locate ? 'remove' : 'add']('locate-active');

    if (locate) {
      this.removeLocate();
      this._map.stopLocate();
      return;
    }

    this._map.on('locationfound', this.onLocationFound, this);
    this._map.on('locationerror', this.onLocationError, this);
    this._map.locate({ setView: true, enableHighAccuracy: true });
  }

  onLocationFound(e) {
    this.addCircle(e).addTo(this.featureGroup()).addTo(this._map);
    this.addMarker(e).addTo(this.featureGroup()).addTo(this._map);
  }

  onLocationError(e) {
    this.addLegend('Location access denied.');
  }
}

export default MyLocationControl;
