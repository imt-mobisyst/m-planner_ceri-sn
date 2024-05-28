class Grid {


    // Constructor
    constructor(resolution , zoneId) {
        this.layer = L.layerGroup();
        this.id = layer._leaflet_id;
        this.resolution = resolution;
        this.drawn = false;
        this.zone = zoneId;
        this.gridCoordinates = [];
        
      }

    static DEFAULTRESOLUTION = 0.0000666666666667;



    createGridLines(bounds, resolution = Grid.DEFAULTRESOLUTION) {

        let latGridValues = [];
        let lngGridValues = [];

        // resolution = parseFloat(document.getElementById("resolution").value)
        // document.getElementById('log').innerHTML = "resolution: " + resolution 
        lngPolylines = [];
        var north = bounds.getNorthEast().lat;
        var east = bounds.getNorthEast().lng;
        var south = bounds.getSouthWest().lat;
        var west = bounds.getSouthWest().lng;
    
        // define the size of the grid
        var topLat = Math.ceil(north / resolution) * resolution;
        var rightLong = Math.ceil(east / resolution) * resolution;
    
        var bottomLat = Math.floor(south / resolution) * resolution;
        var leftLong = Math.floor(west / resolution) * resolution;
    
        var latlngs = [
                [topLat, rightLong],
                [topLat, leftLong],
            
            ];
    
        // var polyline = L.polyline(latlngs, {color: 'red'}).addTo(map);
        this.layer.addLayer(L.polyline(latlngs, {color: 'red'}))
            
    
        for (var latitude = bottomLat; latitude <= topLat; latitude += resolution) {
            // lines of latitude
            var latlngs = [
            [latitude, leftLong],
            [latitude, rightLong],
            ];
    
            // var polyline = L.polyline(latlngs, {color: 'red'}).addTo(map);
            this.layer.addLayer(L.polyline(latlngs, {color: 'red'}))
            latGridValues.push(latitude)
            
        }
        for (var longitude = leftLong; longitude <= rightLong; longitude += resolution) {
            // lines of longitude
            var latlngs = [
            [topLat, longitude],
            [bottomLat, longitude],
            ];
    
            // var polyline = L.polyline(latlngs, {color: 'red'}).addTo(map);
            this.layer.addLayer(L.polyline(latlngs, {color: 'red'}))
            lngGridValues.push(longitude)
    
        }

        function generateGridCoordinates() {


            latGridValues.forEach((lat) => {
                lngGridValues.forEach((lng) => {
        
                    this.gridCoordinates.push({lat: lat, lng: lng});
                });
                        });
            
        }

        generateGridCoordinates();
    
    
        
    }

    //--------draw the generated grid on the map--------
    drawGrid(zone){

        let bounds = zone.computeBounds();
        createGridLines(bounds, this.resolution);
        this.layer.addTo(map)
        this.drawn = true;

        // zoom the map to the polyline
        map.fitBounds(bounds);
        

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