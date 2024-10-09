

//var map
var clickedLocations = [];
var polygon;
var gridCoordinates = []; // Grid points
var missionPoints = L.layerGroup()
var gridLayer = L.layerGroup()
var llOffset = 0.0000666666666667;
var drawGridBox = false;
var startPoint = L.marker();

var latGridValues = [];
var lngGridValues = [];

var bounds = L.latLngBounds();
var MAX_NEIGHBOURS = 8;


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
        var latlngs = [
        [latitude, leftLong],
        [latitude, rightLong],
        ];

        // var polyline = L.polyline(latlngs, {color: 'red'}).addTo(map);
        gridLayer.addLayer(L.polyline(latlngs, {color: 'red'}))
        latGridValues.push(latitude)
        
    }
    for (var longitude = leftLong; longitude <= rightLong; longitude += llOffset) {
        var latlngs = [
        [topLat, longitude],
        [bottomLat, longitude],
        ];

        // var polyline = L.polyline(latlngs, {color: 'red'}).addTo(map);
        gridLayer.addLayer(L.polyline(latlngs, {color: 'red'}))
        lngGridValues.push(longitude)

    }

    //gridLayer.addTo(map)

    // zoom the map to the polyline
    map.fitBounds(bounds);
}


function showCoordOnMap(){

    generateGrid();
    generateGridCoordinates();
    toggleCoordinates();
    deactivateClickEventOnMap()
    getMarkers();

}


function generateGrid() {

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

function toggleGrid() {
    console.log(drawGridBox)
    if (drawGridBox) {
        clearGrid()
    }
    else {
        gridLayer.addTo(map)
        
    }
    drawGridBox = !drawGridBox
    
}

//--------drawi the generated grid on the map--------
function drawGrid(){

 
        missionZones.forEach(function(zone) {
            clickedLocations = zone.getLatLngs()[0];   
            console.log(clickedLocations)
            boundes = computeBounds(clickedLocations)
            createGridLines(boundes);
        
    });
    //gridLayer.addTo(map)
    

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
            //console.log("layer : " + typeof map._layers[i]);
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
            marker.bindPopup("Click to apply action on id : !"+ marker._leaflet_id).openPopup();
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

function exportMissionPointsToJson(missionPoints, startPoint) {
    const pointsArray = missionPoints.getLayers().map(marker => {
        const latlng = marker.getLatLng();
        return {
            id: marker._leaflet_id, 
            lat: latlng.lat,
            lng: latlng.lng
        };
    });

    const output = {
        startPointId: startPoint._leaflet_id, 
        points: pointsArray
    };

    const json = JSON.stringify(output);
    console.log(json);
    return json
}

function downloadJson(json, filename) {
    var blob = new Blob([json], {type: "application/json"});
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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

        alert('Layer Group clicked at: ' + event.target.getLatLng() + event.target._leaflet_id);
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
        var missionPointsJson = exportMissionPointsToJson(missionPoints,startPoint);
        downloadJson(missionPointsJson, 'missionPoints.json');


    }

    if (pointOption =="add-point"){

        addPathPonit()

        }

    if (pointOption =="add-segment"){

            
        }
    
}

function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6378137; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance; // Distance in meters
}

function calculateDistances(layerGroup) {
    const points = layerGroup.getLayers();
    const distances = {};
    const graph = {};
    const id_array = [];
    let array_graph = new Array(points.length).fill(null).map(() => new Array(1).fill(0));

    for (let i = 0; i < points.length; i++) {
        const point1 = points[i];
        const key1 = point1._leaflet_id;
        id_array.push(key1);
        const distancesForPoint = [];
        for (let j = i + 1; j < points.length; j++) {
            const point2 = points[j];
            const key2 = point2._leaflet_id;
            const distanceKey = key1 + '-' + key2;
            const backDistanceKey = key2 + '-' + key1;
            const lat1 = point1.getLatLng().lat;
            const lon1 = point1.getLatLng().lng;
            const lat2 = point2.getLatLng().lat;
            const lon2 = point2.getLatLng().lng;
            const distance = haversineDistance(lat1, lon1, lat2, lon2);
            array_graph[i][j] = distance;
            array_graph[j][i] = distance;
            distances[distanceKey] = distance;
            distances[backDistanceKey] = distance;
            if (distances.hasOwnProperty(distanceKey)) {
                distancesForPoint.push({ node: key2, distance: distances[distanceKey] });
            }

            if (!graph[key1]) {
                graph[key1] = {};
            }
           
            else{
            graph[key1][key2] = distance;}
            if (!graph[key2]) {
                graph[key2] = {};
            }
            graph[key2][key1] = distance;
            

        }
        array_graph.push(distancesForPoint);
        // Sort distances in ascending order
        distancesForPoint.sort((a, b) => a.distance - b.distance);
        //console.log(distancesForPoint)
        // Take the 8 smallest distances
        const minDistances = distancesForPoint.slice(0, 8);
        //console.log(minDistances)

        

    }
    for(const [key, value] of Object.entries(graph)){

        console.log(`${key} ${value}`);
    }
    //console.log("arrraaaaaaaaaaay", array_graph.slice(0,points.length));
    return [array_graph.slice(0,points.length), id_array];
}

function slice2dArray(array, startX, endX, startY, endY){


    let section = array.slice(startX, endX + 1).map(i => i.slice(startY, endY + 1));

    return section;
}

function distanceCalculationTrigger(){

    const [distances, poits_ids] = calculateDistances(missionPoints);
    const startNode = startPoint._leaflet_id;
    let section = [];
    let sections = [];
    if (startNode){

        const optimizedPath = visitAllNodes(distances, startNode);
        console.log("Optimized path:", optimizedPath, distances.length);
        if (distances.length > 24){
            for (i=0; i< distances.length; i=i+24){
                section = slice2dArray(distances, i, i+23, i, i+23);
                sections.push(section);

            }
            
        }
        else {
            section.push(distances);
        }
        let j = 0;
        sections.forEach((section) => {

            console.log("befor bnb");
            const path = branchNBound(section);
            console.log('agter bnb')
            const draw_path = []
            for (i = 0; i< path.length; i++){

                point1_id = poits_ids[path[i]+j];
                if (i < path.length-1){
                    
                    point2_id = poits_ids[path[i+1]+j];
                }else{
                    point2_id = poits_ids[path[0]+j];
                }
                coord1 = missionPoints.getLayer(point1_id).getLatLng();
                coord2 = missionPoints.getLayer(point2_id).getLatLng();
                //draw_path.push(coord1)
                var polyline = L.polyline([coord1, coord2], {color: 'red'}).addTo(map);
                polyline.on('click', event => {
                    if (window.confirm("Do you really want to remove this line?")) {
                        event.target.remove();
                    }
                });
                


                
            }
            // var polyline = L.polyline(draw_path, {color: 'red'}).addTo(map);
            // polyline.on('click', event => {
            //     if (window.confirm("Do you really want to remove this polyline?")) {
            //         event.target.remove();
            //       }
            // });
            j = j +24;

        });
        

    }
    else{

        console.log("please select the starting point")
    }
    
    
   
    
}


function nearestNeighbor(graph, currentNode, visited) {
    let minDistance = Infinity;
    let nearestNode = null;
    for (let neighbor in graph[currentNode]) {
        if (!visited.has(neighbor) && graph[currentNode][neighbor] < minDistance) {
            minDistance = graph[currentNode][neighbor];
            nearestNode = neighbor;
        }
    }
    return nearestNode;
}

function visitAllNodes(graph, startNode) {
    const visited = new Set();
    visited.add(startNode)
    const path = [startNode];
    let currentNode = startNode;

    while (visited.size < Object.keys(graph).length) {
        const nextNode = nearestNeighbor(graph, currentNode, visited);
        if (nextNode === null) {
            break;
        }
        visited.add(nextNode);
        path.push(nextNode);
        currentNode = nextNode;
    }

    return path;
}


function branchNBound( graph){

    const N = graph.length;
    console.log ("bnb",N, graph.length);
        // final_path[] stores the final solution ie, the
        // path of the salesman.
         let final_path = Array (N + 1).fill (-1);
          
        // visited[] keeps track of the already visited nodes
        // in a particular path
          let visited = Array (N).fill (false);
         
        // Stores the final minimum weight of shortest tour.
          let final_res = Number.MAX_SAFE_INTEGER;
         
        // Function to copy temporary solution to
        // the final solution
        function copyToFinal (curr_path){

              for (let i = 0; i < N; i++){
              final_path[i] = curr_path[i];
              }
              final_path[N] = curr_path[0];
        }
         
        // Function to find the minimum edge cost
        // having an end at the vertex i
        function firstMin (adj, i){
        let min = Number.MAX_SAFE_INTEGER;
            for (let k = 0; k < N; k++){
              if (adj[i][k] < min && i !== k){
                     min = adj[i][k];
               }
               }
         return min;
        }
         
         
        // function to find the second minimum edge cost
        // having an end at the vertex i
        function secondMin (adj, i){
            let first = Number.MAX_SAFE_INTEGER;
            let second = Number.MAX_SAFE_INTEGER;

              for (let j = 0; j < N; j++){
                if (i ==  j){
                    continue;
                 }
                if (adj[i][j] <= first){
                      second = first;
                     first = adj[i][j];
                }
                  else if (adj[i][j] <= second && adj[i][j] !== first){
                      second = adj[i][j];
                }
           }
              return second;
        }
         
         
        // function that takes as arguments:
        // curr_bound -> lower bound of the root node
        // curr_weight-> stores the weight of the path so far
        // level-> current level while moving in the search
        //         space tree
        // curr_path[] -> where the solution is being stored which
        //             would later be copied to final_path[]
          function TSPRec (adj, curr_bound, curr_weight, level, curr_path)
        {
           
        // base case is when we have reached level N which
        // means we have covered all the nodes once
            if (level ==  N)
            { 
            // check if there is an edge from last vertex in
            // path back to the first vertex
            if (adj[curr_path[level - 1]][curr_path[0]] !== 0)
            {
               
                // curr_res has the total weight of the
                // solution we got
                let curr_res =
                curr_weight + adj[curr_path[level - 1]][curr_path[0]];
               
                // Update final result and final path if
                // current result is better.
                if (curr_res < final_res)
                {
                  copyToFinal (curr_path);
                  final_res = curr_res;
                }
            }
              return;
             
        }
            // for any other level iterate for all vertices to
            // build the search space tree recursively
            for (let i = 0; i < N; i++){
               
            // Consider next vertex if it is not same (diagonal
            // entry in adjacency matrix and not visited
            // already)
            if (adj[curr_path[level - 1]][i] !== 0 && !visited[i]){
               
            let temp = curr_bound;
           curr_weight += adj[curr_path[level - 1]][i];
               
                // different computation of curr_bound for
                // level 2 from the other levels
                if (level ==  1){
                  curr_bound -= (firstMin (adj, curr_path[level - 1]) + firstMin (adj, i)) / 2;
                 
        }
              else
                {
                  curr_bound -= (secondMin (adj, curr_path[level - 1]) + firstMin (adj, i)) / 2;
                 
        }
               
                // curr_bound + curr_weight is the actual lower bound
                // for the node that we have arrived on
                // If current lower bound < final_res, we need to explore
                // the node further
                if (curr_bound + curr_weight < final_res){
                  curr_path[level] = i;
                  visited[i] = true;      
                // call TSPRec for the next level
                TSPRec (adj, curr_bound, curr_weight, level + 1, curr_path);
                 
        }
               
                // Else we have to prune the node by resetting
                // all changes to curr_weight and curr_bound
                curr_weight -= adj[curr_path[level - 1]][i];
                  curr_bound = temp;
               
                // Also reset the visited array
                visited.fill (false) 
                for (var j = 0; j <= level - 1; j++)
                       visited[curr_path[j]] = true;
             
        }
             
        }
         
        }
         
         
          // This function sets up final_path[] 
          function TSP (adj)
        {
           
        let curr_path = Array (N + 1).fill (-1);
           
        // Calculate initial lower bound for the root node
        // using the formula 1/2 * (sum of first min +
        // second min) for all edges.
        // Also initialize the curr_path and visited array
            let curr_bound = 0;
           
        visited.fill (false);
           
            // compute initial bound

            for (let i = 0; i < N; i++){
              curr_bound += firstMin (adj, i) + secondMin (adj, i);
             
            }
           
            // Rounding off the lower bound to an integer
            curr_bound = curr_bound ==  1 ? (curr_bound / 2) + 1 : (curr_bound / 2);
           
        // We start at vertex 1 so the first vertex
        // in curr_path[] is 0
            visited[0] = true;
           
        curr_path[0] = 0;
           
        // Call to TSPRec for curr_weight equal to
        // 0 and level 1
            TSPRec (adj, curr_bound, 0, 1, curr_path);
         
        }

        let adj = graph;
        TSP (graph);
        console.log (`Longueur du trajet:${final_res}`);
        console.log (`Trajet :${final_path.join (" ")}`);

        return final_path;
         
         
}





//initialize(50.38,3.08)
//getMarkers()
