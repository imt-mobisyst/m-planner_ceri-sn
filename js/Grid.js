
export class Grid {
    static DEFAULTRESOLUTION = 30;
    // Constructor
    constructor(resolution = Grid.DEFAULTRESOLUTION , zoneId) {
        this.layer = L.layerGroup();
        this.id = this.layer._leaflet_id;
        this.resolution = resolution;
        this.drawn = false;
        this.zoneId = zoneId;
        this.gridCoordinates = [];
        
      }

    //static DEFAULTRESOLUTION = 0.0000666666666667;




    createGridLines(bounds) {
        let latGridValues = [];
        let lngGridValues = [];
        let resolutionInMeters = this.resolution

        // Convert resolution from meters to degrees
        const centerLat = bounds.getCenter().lat;
        let resolutionLat = metersToDegreesLatitude(resolutionInMeters);
        let resolutionLng = metersToDegreesLongitude(resolutionInMeters, centerLat);

        let lngPolylines = [];
        var north = bounds.getNorthEast().lat;
        var east = bounds.getNorthEast().lng;
        var south = bounds.getSouthWest().lat;
        var west = bounds.getSouthWest().lng;

        // define the size of the grid
        var topLat = Math.ceil(north / resolutionLat) * resolutionLat;
        var rightLong = Math.ceil(east / resolutionLng) * resolutionLng;

        var bottomLat = Math.floor(south / resolutionLat) * resolutionLat;
        var leftLong = Math.floor(west / resolutionLng) * resolutionLng;

        var latlngs = [
            [topLat, rightLong],
            [topLat, leftLong],
        ];

        this.layer.addLayer(L.polyline(latlngs, {color: 'red'}))

        for (var latitude = bottomLat; latitude <= topLat; latitude += resolutionLat) {
            // lines of latitude
            var latlngs = [
                [latitude, leftLong],
                [latitude, rightLong],
            ];

            this.layer.addLayer(L.polyline(latlngs, {color: 'red'}))
            latGridValues.push(latitude)
        }

        for (var longitude = leftLong; longitude <= rightLong; longitude += resolutionLng) {
            // lines of longitude
            var latlngs = [
                [topLat, longitude],
                [bottomLat, longitude],
            ];

            this.layer.addLayer(L.polyline(latlngs, {color: 'red'}))
            lngGridValues.push(longitude)
        }

        function generateGridCoordinates() {
            let gridCoordinates = []
            latGridValues.forEach((lat) => {
                lngGridValues.forEach((lng) => {
                    gridCoordinates.push({lat: lat, lng: lng});
                });
            });

            return gridCoordinates;
        }

        this.gridCoordinates = generateGridCoordinates();
    }

    generateGrid() {

        var layers = drawnItems.getLayers();

        layers.forEach(function(layer) {
            if (layer instanceof L.Marker) {
                var markerCoordinates = layer.getLatLng();
            } else if (layer instanceof L.Polygon) {
                polygon = layer;
                var polylineCoordinates = layer.getLatLngs();
                clickedLocations = polylineCoordinates[0];

            }

        });

        drawGrid();
    }

    //--------draw the generated grid on the map--------
    drawGrid(zone){
        let bounds = zone.computeBounds();
        this.createGridLines(bounds);
        //this.layer.addTo(map)
        this.drawn = true;

        // zoom the map to the polyline
        //map.fitBounds(bounds);
        

    }

    clearGrid() {
        if (this.drawn){
    
            map.removeLayer(this.layer);
            this.layer = L.layerGroup();
            this.drawn = false;  
        }
        else {
    
            // No grid to delete
        }
    }

}

export function metersToDegreesLatitude(meters) {
    return meters / 111320; // Convert meters to degrees of latitude
}

function metersToDegreesLongitude(meters, latitude) {
    return meters / (111320 * Math.cos(latitude * (Math.PI / 180))); // Convert meters to degrees of longitude
}