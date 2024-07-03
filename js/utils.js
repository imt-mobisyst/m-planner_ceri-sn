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


// export function calculateDistances(markersLayer) {
//     const points = markersLayer.getLayers();
//     const distances = {};
//     const graph = {};

//     for (let i = 0; i < points.length; i++) {
//         const point1 = points[i];
//         const key1 = point1._leaflet_id;
//         const distancesForPoint = [];
//         for (let j = i + 1; j < points.length; j++) {
//             const point2 = points[j];
//             const key2 = point2._leaflet_id;
//             const distanceKey = key1 + '-' + key2;
//             const backDistanceKey = key2 + '-' + key1;
//             const lat1 = point1.getLatLng().lat;
//             const lon1 = point1.getLatLng().lng;
//             const lat2 = point2.getLatLng().lat;
//             const lon2 = point2.getLatLng().lng;
//             const distance = haversineDistance(lat1, lon1, lat2, lon2);
//             distances[distanceKey] = distance;
//             distances[backDistanceKey] = distance;
//             if (distances.hasOwnProperty(distanceKey)) {
//                 distancesForPoint.push({ node: key2, distance: distances[distanceKey] });
//             }

//             if (!graph[key1]) {
//                 graph[key1] = {};
//             }
//             graph[key1][key2] = distance;
//             if (!graph[key2]) {
//                 graph[key2] = {};
//             }
//             graph[key2][key1] = distance;
//         }
//         // Sort distances in ascending order
//         distancesForPoint.sort((a, b) => a.distance - b.distance);
//         //console.log(distancesForPoint)
//         // Take the 8 smallest distances
//         const minDistances = distancesForPoint.slice(0, 8);
//         //console.log(minDistances)

        

//     }
//     console.log(graph)
//     for(const [key, value] of Object.entries(graph)){

//         console.log(`${key} ${value}`);
//     }
//     return graph;
// }


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


export function branchNBound( graph){

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

export function slice2dArray(array, startX, endX, startY, endY){


      let section = array.slice(startX, endX + 1).map(i => i.slice(startY, endY + 1));

      return section;
}