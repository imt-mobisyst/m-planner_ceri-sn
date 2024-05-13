

//var map
var clickedLocations = [];
var polygon;
var gridCoordinates = []; // Grid points
var missionPoints = L.layerGroup()
var gridLayer = L.layerGroup()
var llOffset = 0.0000666666666667;
var drawGridBox = false;œ
var startPoint = L.marker();

var latGridValues = [];
var lngGridValues = [];

var bounds = L.latLngBounds();


//--------usefull for tests to show the map and initilize on a window--------
function initialize(oLat, oLon) { 

    map = new L.map('map-canvas').setView([oLat, oLon], 13);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);


    
    map.on('click', function(e) {        
        var clickedLocation= e.latlng;
        // var popup = L.popup()
        // .setLatLng(clickedLocation)
        // .setContent('<p>Hello world!<br />This is a nice popup.</p>')
        // .openOn(map);      
        var lat = clickedLocation.lat;
        var lng = clickedLocation.lng;  
        clickedLocations.push({lat: lat, lng: lng});
        
        L.marker([lat, lng]).addTo(map);
        polygon = L.polygon(clickedLocations, {color: 'red'}).addTo(map);
        document.getElementById('coordinates').innerHTML = "Latitude: " + lat + "<br>Longitude: " + lng;
    });
    
}

//--------getting bounds of a list of markers--------
function computeBounds(list) {
    if (!list || list.length === 0) {
        throw new Error("List is empty");
    }

    var firstLatLng = list[0];
    var s = firstLatLng.lat,
        n = firstLatLng.lat,
        w = firstLatLng.lng,
        e = firstLatLng.lng;

    for (var i = 1; i < list.length; i++) {
        var latlng = list[i];
        s = Math.min(s, latlng.lat);
        n = Math.max(n, latlng.lat);
        w = Math.min(w, latlng.lng);
        e = Math.max(e, latlng.lng);
    }

    return new L.latLngBounds(L.latLng(s, w) , L.latLng(n, e));

}

//--------creating line on map--------
function createGridLines(bounds) {

    // llOffset = parseFloat(document.getElementById("resolution").value)
    // document.getElementById('log').innerHTML = "llOffset: " + llOffset 
    lngPolylines = [];
    var north = bounds.getNorthEast().lat;
    var east = bounds.getNorthEast().lng;
    var south = bounds.getSouthWest().lat;
    var west = bounds.getSouthWest().lng;

    // define the size of the grid
    var topLat = Math.ceil(north / llOffset) * llOffset;
    var rightLong = Math.ceil(east / llOffset) * llOffset;

    var bottomLat = Math.floor(south / llOffset) * llOffset;
    var leftLong = Math.floor(west / llOffset) * llOffset;

    var latlngs = [
            [topLat, rightLong],
            [topLat, leftLong],
        
        ];

    // var polyline = L.polyline(latlngs, {color: 'red'}).addTo(map);
    gridLayer.addLayer(L.polyline(latlngs, {color: 'red'}))
        

    for (var latitude = bottomLat; latitude <= topLat; latitude += llOffset) {
        // lines of latitude
        var latlngs = [
        [latitude, leftLong],
        [latitude, rightLong],
        ];

        // var polyline = L.polyline(latlngs, {color: 'red'}).addTo(map);
        gridLayer.addLayer(L.polyline(latlngs, {color: 'red'}))
        latGridValues.push(latitude)
        
    }
    for (var longitude = leftLong; longitude <= rightLong; longitude += llOffset) {
        // lines of longitude
        var latlngs = [
        [topLat, longitude],
        [bottomLat, longitude],
        ];

        // var polyline = L.polyline(latlngs, {color: 'red'}).addTo(map);
        gridLayer.addLayer(L.polyline(latlngs, {color: 'red'}))
        lngGridValues.push(longitude)

    }

    gridLayer.addTo(map)

    // zoom the map to the polyline
    map.fitBounds(bounds);
}


function showCoordOnMap(){

    generateGridCoordinates();
    toggleCoordinates();
    deactivateClickEventOnMap()
    getMarkers();

}


function toggleGrid() {

    var layers = drawnItems.getLayers();

    // Iterate over each layer to get its coordinates
    layers.forEach(function(layer) {
        // Check the type of the layer
        if (layer instanceof L.Marker) {
            // For markers, get the marker's coordinates
            var markerCoordinates = layer.getLatLng();
            // console.log('Marker coordinates:', markerCoordinates);
        } else if (layer instanceof L.Polygon) {
            // For polylines and polygons, get the coordinates of their vertices
            polygon = layer;
            var polylineCoordinates = layer.getLatLngs();
            clickedLocations = polylineCoordinates[0];
            // console.log('Polyline/Polygon coordinates:', polylineCoordinates[0]);

        }
        // You can add more conditions for other types of layers if needed
        
    });
    // if (! drawGridBox && clickedLocations){
    //     drawGridBox = !drawGridBox;
    //     if (drawGridBox) {
    //         boundes = computeBounds(clickedLocations)
    //         createGridLines(boundes);
    //     } 
    // }
    drawGrid();
}

//--------drawi the generated grid on the map--------
function drawGrid(){

    if (drawGridBox){

        clearGrid();
    }
        missionZones.forEach(function(zone) {
            clickedLocations = zone.getLatLngs()[0];   
            console.log(clickedLocations)
            boundes = computeBounds(clickedLocations)
            createGridLines(boundes);
        
    });
    gridLayer.addTo(map)
    drawGridBox = !drawGridBox;
    

}


//--------to  be moved to path planner--------
function checkTranspassing(){

    var layers = drawnItems.getLayers();
    console.log('inside transpassing')
    layers.forEach(function(layer) {


        if ((layer instanceof L.Polyline) && !(layer instanceof L.Polygon)){

            pathLine = layer;
            lines.push(layer)
            
            if(!(restrictedZones.some((zone) => zone.getBounds().intersects(pathLine.getBounds())))){

            }
            else{
                layer.remove();

            }

        }
        else {
            console.log("not a polyline" +layer.constructor.name);

        }


    });

    console.log('cross lines : ' + lineSegmentsIntersect(lines[0], lines[1]));


}






function clearLayer() {

        for(i in map._layers) {
            console.log("layer : " + typeof map._layers[i]);
            if(map._layers[i]._path != undefined && map._layers[i]===layerName) {
                try {
                    map.removeLayer(map._layers[i]);
                }
                catch(e) {
                    console.log("problem with " + e + map._layers[i]);
                }
            }
        }
        

}


function clearGrid() {
    if (drawGridBox){

        map.removeLayer(gridLayer)
        drawGridBox = !drawGridBox;  
    }
    else {

        // No grid to delete
    }
}
function clearAll() {
    if (drawGridBox){

        for(i in map._layers) {
            if(map._layers[i]._path != undefined) {
                try {
                    map.removeLayer(map._layers[i]);
                }
                catch(e) {
                    console.log("problem with " + e + map._layers[i]);
                }
            }
        }
    }
}

//--------generated the grid on the selected zone--------
function generateGridCoordinates() {


    latGridValues.forEach((lat) => {
        lngGridValues.forEach((lng) => {

            gridCoordinates.push({lat: lat, lng: lng});
        });
                });
    
}

//--------generate and show path inside mission zone and outside restricted zone--------
function toggleCoordinates() {
    var coordIcon = L.divIcon({className: 'leaflet-div-icon'});
    var coordIconHover = L.divIcon({className: 'leaflet-div-icon'});
    gridCoordinates.forEach((coord) => {
    var marker = L.marker([coord.lat, coord.lng], {icon : coordIcon});
        //marker.on('click', e => e.target.remove() );
        marker.on('mouseover', function() {
            marker.icon = coordIconHover;
            marker.bindPopup("Click to apply action!").openPopup();
        });
        marker.on('click', layerGroupClickHandler);
        marker.on('mouseout', function() {
            marker.closePopup();
        });
        missionZones.forEach(function(missionZone){

            if(isMarkerInsidePolygon(marker, missionZone)) {
                if(!(restrictedZones.some((zone) => isMarkerInsidePolygon(marker, zone)))) {
                    missionPoints.addLayer(marker);
                }

            }
        });
        
        
    });
    missionPoints.addTo(map)

}

function deactivateClickEventOnMap() {
    clickEventActive = false;
    map.off('click');
}

function activateClickEventOnMap() {
    clickEventActive = false;
    map.on('click');
}

function deactivateRemoveEventOnCoord() {
    clickEventActive = false;
    map.off('click');
}

//--------adding a point to generated path points--------
function addPathPonit(){

    activateClickEventOnMap();
    var coordIcon = L.divIcon({className: 'leaflet-div-icon'});
    map.on('click', function(e) {        
        var clickedLocation= e.latlng;
                
        var lat = clickedLocation.lat;
        var lng = clickedLocation.lng;  
        gridCoordinates.push({lat: lat, lng: lng});
        
        var marker = L.marker([lat, lng], {icon : coordIcon})
        marker.on('click', layerGroupClickHandler);
        marker.on('mouseout', function() {
            marker.closePopup();
        });
        
        missionPoints.addLayer(marker);
        
    });  

}

//--------checks if a marker is inside a polygone--------
function isMarkerInsidePolygon(marker, polyg) {

    var polyPoints = polyg.getLatLngs()[0];       
    var x = marker.getLatLng().lat, y = marker.getLatLng().lng;
    // console.log("poly  : " + polyPoints[0].lat)   ; 
    var inside = false;
    for (var i = 0, j = polyPoints.length - 1; i < polyPoints.length; j = i++) {
        var xi = polyPoints[i].lat, yi = polyPoints[i].lng;
        var xj = polyPoints[j].lat, yj = polyPoints[j].lng;
        // console.log("values : " + xi + " , " + yi + " , " + xj + " , " + yj + " , " + x + " , " + x + " , ");
        var intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }

    return inside;
};

//--------return true if line1 and line2 intersects--------
function lineSegmentsIntersect(line1, line2) {
    let line1point1 = line1.getLatLngs()[0];
    let line1point2 = line1.getLatLngs()[1];
  
    let line2point1 = line2.getLatLngs()[0];
    let line2point2 = line2.getLatLngs()[1];

    console.log(line1point1 +' : ' +line1point2);
    function ccw(l1p1, l1p2, l2p1) {
        return (l2p1.lng - l1p1.lng) * (l1p2.lat - l1p1.lat) > (l1p2.lng - l1p1.lng) * (l2p1.lat - l1p1.lat);
    }

    return ccw(line1point1, line2point1, line2point2) !== ccw(line1point2, line2point1, line2point2) && ccw(line1point1, line1point2, line2point1) !== ccw(line1point1, line1point2, line2point2);
}

//--------getting everything from the map--------
function getMarkers(){

    map.eachLayer(function (layer) { 
        console.log("layer : " + layer.options.name);
    });
}

//--------click options on path points--------
function layerGroupClickHandler(event) {

    var pointOption = document.getElementById("point-option-select").value;
    if (pointOption =="show-coord"){

        alert('Layer Group clicked at: ' + event.target.getLatLng());
    }
    if (pointOption =="remove-point"){

        if (event.target === startPoint){

            if (window.confirm("Do you really want to remove the start point?")) {
                event.target.remove();
                startPoint = L.marker();
              }
              

        }
        else{
            event.target.remove()

        }
        //console.log("problem with " + e );

    }

    if (pointOption =="start-point"){

        var startIcon = L.divIcon({className: 'leaflet-div-icon-start'});
        var normalIcon = L.divIcon({className: 'leaflet-div-icon'});
        var markerPoistion = event.target.getLatLng();
        var markerStart = L.marker([markerPoistion.lat, markerPoistion.lng], {icon : startIcon});
        if( startPoint.getLatLng()){

            startPoint.setIcon(normalIcon)
            // markerId = missionPoints.getLayerId(startPoint)
            // var marker = L.marker([startPoint.getLatLng().lat, startPoint.getLatLng().lng], {icon : normalIcon})
            // missionPoints.removeLayer(markerId);
            // missionPoints.addLayer(marker)
            console.log("somthong aleady " );
        }
        
        event.target.setIcon(startIcon);
        startPoint = event.target;


    }

    if (pointOption =="add-point"){

        addPathPonit()

        }
    
}


//initialize(50.38,3.08)
//getMarkers()
