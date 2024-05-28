import { startPoint } from "./Path";

export function layerGroupClickHandler(event) {

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
            console.log("somthong aleady selected, modifying" );
        }
        
        event.target.setIcon(startIcon);
        startPoint = event.target;


    }

    if (pointOption =="add-point"){

        addPathPonit()

        }
    
}


export function haversineDistance(lat1, lon1, lat2, lon2) {
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


export function calculateDistances(markersLayer) {
    const points = markersLayer.getLayers();
    const distances = {};
    const graph = {};

    for (let i = 0; i < points.length; i++) {
        const point1 = points[i];
        const key1 = point1._leaflet_id;
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
            distances[distanceKey] = distance;
            distances[backDistanceKey] = distance;
            if (distances.hasOwnProperty(distanceKey)) {
                distancesForPoint.push({ node: key2, distance: distances[distanceKey] });
            }

            if (!graph[key1]) {
                graph[key1] = {};
            }
            graph[key1][key2] = distance;
            if (!graph[key2]) {
                graph[key2] = {};
            }
            graph[key2][key1] = distance;
        }
        // Sort distances in ascending order
        distancesForPoint.sort((a, b) => a.distance - b.distance);
        //console.log(distancesForPoint)
        // Take the 8 smallest distances
        const minDistances = distancesForPoint.slice(0, 8);
        //console.log(minDistances)

        

    }
    console.log(graph)
    for(const [key, value] of Object.entries(graph)){

        console.log(`${key} ${value}`);
    }
    return graph;
}


export function nearestNeighbor(graph, currentNode, visited) {
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