import * as Notiflix from '/node_modules/notiflix/src/notiflix.js';
import CustomControl from './CustomControl.js';

// --------------------------------------------------------------
class LoadSaveControl extends CustomControl {
  constructor() {
    super({
      position: 'topright',
    });
  }

  onAdd() {
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

      //--------add buttons to container;--------
      container.appendChild(button);
    });

    return container;
  }
}

// Exporting the class to other modules
export default LoadSaveControl;
/*
exportGeoJSON() {
    const data = this.drawnItems.toGeoJSON();

    if (data.features.length === 0) {
      Notiflix.Notify.failure('You must have some data to save a geojson file');
      return;
    } else {
      Notiflix.Notify.info('You can save the data to a geojson');
    }

    const convertedData =
      'text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data));
    const exportJSON = document.querySelector('.export');
    exportJSON.setAttribute('href', 'data:' + convertedData);
    exportJSON.setAttribute('download', 'data.geojson');
  }
  //--------save geojson to file--------

  initializeExportButton() {
    const exportJSON = document.querySelector('.export');
    exportJSON.addEventListener('click', this.exportGeoJSON.bind(this));
  }

  openFile(event) {
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
*/
