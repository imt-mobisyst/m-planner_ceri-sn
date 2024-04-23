//--------initailizingMapobject------------
let config = {
  minZoom: 1,
  maxZoom: 18,
};
// magnification with which the map will start
const zoom = 15;
// CERI-SN IMT co-ordinates
const lat = 50.36667;
const lng = 3.06667;

// calling map
const map = L.map('map', config).setView([lat, lng], zoom);
map.options.zoomDelta = 0.52;

googleSat = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
  subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
}).addTo(map);

// create custom button
const customControl = L.Control.extend({
  // button position
  options: {
    position: 'topleft',
    className: 'locate-button leaflet-bar',
    html: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0 0 13 3.06V1h-2v2.06A8.994 8.994 0 0 0 3.06 11H1v2h2.06A8.994 8.994 0 0 0 11 20.94V23h2v-2.06A8.994 8.994 0 0 0 20.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg>',
    style:
      'margin-top: 0; left: 0; display: flex; cursor: pointer; justify-content: center; font-size: 2rem;',
  },

  // method
  onAdd: function (map) {
    this._map = map;
    const button = L.DomUtil.create('div');
    L.DomEvent.disableClickPropagation(button);

    button.title = 'locate';
    button.innerHTML = this.options.html;
    button.className = this.options.className;
    button.setAttribute('style', this.options.style);

    L.DomEvent.on(button, 'click', this._clicked, this);

    return button;
  },
  _clicked: function (e) {
    L.DomEvent.stopPropagation(e);

    // this.removeLocate();

    this._checkLocate();

    return;
  },
  _checkLocate: function () {
    return this._locateMap();
  },

  _locateMap: function () {
    const locateActive = document.querySelector('.locate-button');
    const locate = locateActive.classList.contains('locate-active');
    // add/remove class from locate button
    locateActive.classList[locate ? 'remove' : 'add']('locate-active');

    // remove class from button
    // and stop watching location
    if (locate) {
      this.removeLocate();
      this._map.stopLocate();
      return;
    }

    // location on found
    this._map.on('locationfound', this.onLocationFound, this);
    // locataion on error
    this._map.on('locationerror', this.onLocationError, this);

    // start locate
    this._map.locate({ setView: true, enableHighAccuracy: true });
  },
  onLocationFound: function (e) {
    // add circle
    this.addCircle(e).addTo(this.featureGroup()).addTo(map);

    // add marker
    this.addMarker(e).addTo(this.featureGroup()).addTo(map);

    // add legend
  },
  // on location error
  onLocationError: function (e) {
    this.addLegend('Location access denied.');
  },
  // feature group
  featureGroup: function () {
    return new L.FeatureGroup();
  },
  // add legend
  addLegend: function (text) {
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
  },
  addCircle: function ({ accuracy, latitude, longitude }) {
    return L.circle([latitude, longitude], accuracy / 2, {
      className: 'circle-test',
      weight: 2,
      stroke: false,
      fillColor: '#136aec',
      fillOpacity: 0.15,
    });
  },
  addMarker: function ({ latitude, longitude }) {
    return L.marker([latitude, longitude], {
      icon: L.divIcon({
        className: 'located-animation',
        iconSize: L.point(17, 17),
        popupAnchor: [0, -15],
      }),
    }).bindPopup('Your are here');
  },
  removeLocate: function () {
    this._map.eachLayer(function (layer) {
      if (layer instanceof L.Marker) {
        const { icon } = layer.options;
        if (icon?.options.className === 'located-animation') {
          map.removeLayer(layer);
        }
      }
      if (layer instanceof L.Circle) {
        if (layer.options.className === 'circle-test') {
          map.removeLayer(layer);
        }
      }
    });
  },
});

// adding new button to map controll
map.addControl(new customControl());

// --------------------------------------------------
// Nofiflix options

Notiflix.Notify.init({
  width: '300px',
  position: 'right-bottom',
  distance: '0px',
});

// --------------------------------------------------
// add buttons to map

const customControl1 = L.Control.extend({
  // button position
  options: {
    position: 'topright',
  },

  // method
  onAdd: function () {
    const array = [
      {
        title: 'export features geojson',
        html: `<img src='./images/iconExport.svg' class='icon-geojson'/>`,
        className: 'export link-button leaflet-bar',
      },
      {
        title: 'save geojson',
        html: `<img src='./images/iconAdd.svg' class='icon-geojson'/>`,
        className: 'save link-button leaflet-bar',
      },
      {
        title: 'remove geojson',
        html: `<img src='./images/iconRemove.svg' class='icon-geojson'/>`,
        className: 'remove link-button leaflet-bar',
      },
      {
        title: 'load geojson from file',
        html: "<input type='file' id='geojson' class='geojson' accept='text/plain, text/json, .geojson' onchange='openFile(event)' /><label for='geojson'><img src='./images/iconLoad.svg' class='icon-geojson'/></label>",
        className: 'load link-button leaflet-bar',
      },
    ];

    const container = L.DomUtil.create(
      'div',
      'leaflet-control leaflet-action-button'
    );

    array.forEach((item) => {
      const button = L.DomUtil.create('a');
      button.href = '#';
      button.setAttribute('role', 'button');

      button.title = item.title;
      button.innerHTML = item.html;
      button.className += item.className;

      // add buttons to container;
      container.appendChild(button);
    });

    return container;
  },
});
map.addControl(new customControl1());

// Draw polygon, circle, rectangle, polyline
// --------------------------------------------------

let drawnItems = L.featureGroup().addTo(map);

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

  drawnItems.addLayer(layer);
});

// --------------------------------------------------
// save geojson to file

const exportJSON = document.querySelector('.export');

exportJSON.addEventListener('click', () => {
  // Extract GeoJson from featureGroup
  const data = drawnItems.toGeoJSON();

  if (data.features.length === 0) {
    Notiflix.Notify.failure('You must have some data to save a geojson file');
    return;
  } else {
    Notiflix.Notify.info('You can save the data to a geojson');
  }

  // Stringify the GeoJson
  const convertedData =
    'text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data));

  exportJSON.setAttribute('href', 'data:' + convertedData);
  exportJSON.setAttribute('download', 'data.geojson');
});

// --------------------------------------------------
// save geojson to localstorage
const saveJSON = document.querySelector('.save');

saveJSON.addEventListener('click', (e) => {
  e.preventDefault();

  const data = drawnItems.toGeoJSON();

  if (data.features.length === 0) {
    Notiflix.Notify.failure('You must have some data to save it');
    return;
  } else {
    Notiflix.Notify.success('The data has been saved to localstorage');
  }

  localStorage.setItem('geojson', JSON.stringify(data));
});

// --------------------------------------------------
// remove gojson from localstorage

const removeJSON = document.querySelector('.remove');

removeJSON.addEventListener('click', (e) => {
  e.preventDefault();
  localStorage.removeItem('geojson');

  Notiflix.Notify.info('All layers have been deleted');

  drawnItems.eachLayer(function (layer) {
    drawnItems.removeLayer(layer);
  });
});

// --------------------------------------------------
// load geojson from localstorage

const geojsonFromLocalStorage = JSON.parse(localStorage.getItem('geojson'));

function setGeojsonToMap(geojson) {
  const feature = L.geoJSON(geojson, {
    style: function (feature) {
      return {
        color: 'red',
        weight: 2,
      };
    },
    pointToLayer: (feature, latlng) => {
      if (feature.properties.type === 'circle') {
        return new L.circle(latlng, {
          radius: feature.properties.radius,
        });
      } else if (feature.properties.type === 'circlemarker') {
        return new L.circleMarker(latlng, {
          radius: 10,
        });
      } else {
        return new L.Marker(latlng);
      }
    },
    onEachFeature: function (feature, layer) {
      drawnItems.addLayer(layer);
      const coordinates = feature.geometry.coordinates.toString();
      const result = coordinates.match(/[^,]+,[^,]+/g);

      layer.bindPopup(
        '<span>Coordinates:<br>' + result.join('<br>') + '</span>'
      );
    },
  }).addTo(map);

  map.flyToBounds(feature.getBounds());
}

if (geojsonFromLocalStorage) {
  setGeojsonToMap(geojsonFromLocalStorage);
}

// --------------------------------------------------
// get geojson from file

function openFile(event) {
  const input = event.target;

  const reader = new FileReader();
  reader.onload = function () {
    const result = reader.result;
    const geojson = JSON.parse(result);

    Notiflix.Notify.info('The data has been loaded from the file');

    setGeojsonToMap(geojson);
  };
  reader.readAsText(input.files[0]);

  input.value = '';
}

// --------------------------------------------------------------
// create seearch button

// add "random" button
const buttonTemplate = `<div class="leaflet-search"><svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M31.008 27.231l-7.58-6.447c-0.784-0.705-1.622-1.029-2.299-0.998 1.789-2.096 2.87-4.815 2.87-7.787 0-6.627-5.373-12-12-12s-12 5.373-12 12 5.373 12 12 12c2.972 0 5.691-1.081 7.787-2.87-0.031 0.677 0.293 1.515 0.998 2.299l6.447 7.58c1.104 1.226 2.907 1.33 4.007 0.23s0.997-2.903-0.23-4.007zM12 20c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8z"></path></svg></div><div class="auto-search-wrapper max-height"><input type="text" id="marker" autocomplete="off"  aria-describedby="instruction" aria-label="Search ..." /><div id="instruction" class="hidden">When autocomplete results are available use up and down arrows to review and enter to select. Touch device users, explore by touch or with swipe gestures.</div></div>`;

// create custom button
const customControl2 = L.Control.extend({
  // button position
  options: {
    position: 'topright',
    className: 'leaflet-autocomplete',
  },

  // method
  onAdd: function () {
    return this._initialLayout();
  },

  _initialLayout: function () {
    // create button
    const container = L.DomUtil.create(
      'div',
      'leaflet-bar ' + this.options.className
    );

    L.DomEvent.disableClickPropagation(container);

    container.innerHTML = buttonTemplate;

    return container;
  },
});

// adding new button to map controll
map.addControl(new customControl2());

// --------------------------------------------------------------

// input element
const root = document.getElementById('marker');

function addClassToParent() {
  const searchBtn = document.querySelector('.leaflet-search');
  searchBtn.addEventListener('click', (e) => {
    // toggle class
    e.target
      .closest('.leaflet-autocomplete')
      .classList.toggle('active-autocomplete');

    // add placeholder
    root.placeholder = 'Search ...';

    // focus on input
    root.focus();

    // use destroy method
    autocomplete.destroy();
  });
}

addClassToParent();

// function clear input
map.on('click', () => {
  document
    .querySelector('.leaflet-autocomplete')
    .classList.remove('active-autocomplete');

  clickOnClearButton();
});

// autocomplete section
// more config find in https://github.com/tomickigrzegorz/autocomplete
// --------------------------------------------------------------

const autocomplete = new Autocomplete('marker', {
  delay: 1000,
  selectFirst: true,
  howManyCharacters: 2,

  onSearch: function ({ currentValue }) {
    const api = `https://nominatim.openstreetmap.org/search?format=geojson&limit=5&q=${encodeURI(
      currentValue
    )}`;

    /**
     * Promise
     */
    return new Promise((resolve) => {
      fetch(api)
        .then((response) => response.json())
        .then((data) => {
          resolve(data.features);
        })
        .catch((error) => {
          console.error(error);
        });
    });
  },

  onResults: ({ currentValue, matches, template }) => {
    const regex = new RegExp(currentValue, 'i');
    // checking if we have results if we don't
    // take data from the noResults method
    return matches === 0
      ? template
      : matches
          .map((element) => {
            return `
              <li role="option">
                <p>${element.properties.display_name.replace(
                  regex,
                  (str) => `<b>${str}</b>`
                )}</p>
              </li> `;
          })
          .join('');
  },

  onSubmit: ({ object }) => {
    const { display_name } = object.properties;
    const cord = object.geometry.coordinates;
    // custom id for marker
    // const customId = Math.random();

    // remove last marker
    map.eachLayer(function (layer) {
      if (layer.options && layer.options.pane === 'markerPane') {
        if (layer._icon.classList.contains('leaflet-marker-locate')) {
          map.removeLayer(layer);
        }
      }
    });

    // add marker
    const marker = L.marker([cord[1], cord[0]], {
      title: display_name,
    });

    // add marker to map
    marker.addTo(map).bindPopup(display_name);

    // set marker to coordinates
    map.setView([cord[1], cord[0]], 8);

    // add class to marker
    L.DomUtil.addClass(marker._icon, 'leaflet-marker-locate');
  },

  // the method presents no results
  noResults: ({ currentValue, template }) =>
    template(`<li>No results found: "${currentValue}"</li>`),
});
