export let startPoint = L.marker();
/*
import { nearestNeighbor } from './utils.js';
*/


export class Path{



    constructor(startPoint){

    // get markers frome zone object

    if (startPoint){

        this.startPoint = startPoint._leaflet_id;
    }
    else{

        console.log('You have to select a starting point!')
        //throw new Error('You have to select a starting point!');
    }

    }

    visitAllNodes(graph) {
        const visited = new Set();
        visited.add(this.startNode)
        const path = [this.startNode];
        let currentNode = this.startNode;

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


}   