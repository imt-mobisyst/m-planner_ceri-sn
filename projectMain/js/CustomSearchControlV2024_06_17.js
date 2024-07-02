import * as L from '/node_modules/leaflet/dist/leaflet-src.esm.js'; // Import Leaflet if you are using it as a module

import * as Autocomplete from './autocomplete/dist/js/autocomplete.esm.js';

// --------------------------------------------------------------
class CustomSearchControl extends L.Control {
  constructor() {
    super({
      position: 'topleft',
      className: 'leaflet-autocomplete',
    });

    this.buttonTemplate = `<div class="leaflet-search"><svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M31.008 27.231l-7.58-6.447c-0.784-0.705-1.622-1.029-2.299-0.998 1.789-2.096 2.87-4.815 2.87-7.787 0-6.627-5.373-12-12-12s-12 5.373-12 12 5.373 12 12 12c2.972 0 5.691-1.081 7.787-2.87-0.031 0.677 0.293 1.515 0.998 2.299l6.447 7.58c1.104 1.226 2.907 1.33 4.007 0.23s0.997-2.903-0.23-4.007zM12 20c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8z"></path></svg></div><div class="auto-search-wrapper max-height"><input type="text" id="marker" autocomplete="off"  aria-describedby="instruction" aria-label="Search ..." /><div id="instruction" class="hidden">When autocomplete results are available use up and down arrows to review and enter to select. Touch device users, explore by touch or with swipe gestures.</div></div>`;
  }

  onAdd() {
    return this._initialLayout();
  }

  _initialLayout() {
    const container = L.DomUtil.create(
      'div',
      'leaflet-bar ' + this.options.className
    );
    L.DomEvent.disableClickPropagation(container);
    container.innerHTML = this.buttonTemplate;
    this._bindSearchEvent(container);
    return container;
  }

  _bindSearchEvent(container) {
    const searchBtn = container.querySelector('.leaflet-search');
    const inputElement = container.querySelector('#marker');
    searchBtn.addEventListener('click', (e) =>
      this._onSearchButtonClick(e, container, inputElement)
    );
    console.log('this.map', this.map);
    this.map.on('click', this._onMapClick.bind(this, container));
    this._initializeAutocomplete(inputElement);
  }

  _onSearchButtonClick(e, container, inputElement) {
    container.classList.toggle('active-autocomplete');
    inputElement.placeholder = 'Search ...';
    inputElement.focus();
    autocomplete.destroy();
  }

  _onMapClick(container) {
    container.classList.remove('active-autocomplete');
    this._clickOnClearButton();
  }

  _initializeAutocomplete(inputElement) {
    new Autocomplete(inputElement, {
      delay: 1000,
      selectFirst: true,
      howManyCharacters: 2,
      onSearch: this._onSearch,
      onResults: this._onResults,
      onSubmit: this._onSubmit,
      noResults: this._noResults,
    });
  }

  _onSearch({ currentValue }) {
    const api = `https://nominatim.openstreetmap.org/search?format=geojson&limit=5&q=${encodeURI(
      currentValue
    )}`;
    return fetch(api)
      .then((response) => response.json())
      .then((data) => data.features)
      .catch((error) => console.error(error));
  }

  _onResults({ currentValue, matches, template }) {
    const regex = new RegExp(currentValue, 'i');
    return matches === 0
      ? template
      : matches
          .map(
            (element) => `
        <li role="option">
          <p>${element.properties.display_name.replace(
            regex,
            (str) => `<b>${str}</b>`
          )}</p>
        </li>`
          )
          .join('');
  }

  _onSubmit({ object }) {
    const { display_name } = object.properties;
    const [lng, lat] = object.geometry.coordinates;
    this._clearExistingMarkers();
    const marker = L.marker([lat, lng], { title: display_name });
    marker.addTo(map).bindPopup(display_name);
    map.setView([lat, lng], 8);
    L.DomUtil.addClass(marker._icon, 'leaflet-marker-locate');
  }

  _clearExistingMarkers() {
    map.eachLayer((layer) => {
      if (layer.options && layer.options.pane === 'markerPane') {
        if (layer._icon.classList.contains('leaflet-marker-locate')) {
          map.removeLayer(layer);
        }
      }
    });
  }

  _clickOnClearButton() {
    // Clear button logic here
  }

  _noResults({ currentValue, template }) {
    return template(`<li>No results found: "${currentValue}"</li>`);
  }
}

// Exporting the class to other modules
export default CustomSearchControl;
