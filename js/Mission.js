

export let pathEndLandmarkId = NaN
export class Mission {



    constructor() {

        this.areaLandmarks = L.layerGroup();
        this.startPoint = L.marker();
        this.path = [];
        this.arrows = L.layerGroup();
    }


    drawMissionPath(){

        let pathSequenceMarkers = []
        this.path.forEach( (landmarkId) => {

            pathSequenceMarkers.push([this.areaLandmarks.getLayer(landmarkId)._latlng.lat,this.areaLandmarks.getLayer(landmarkId)._latlng.lng])
            pathEndLandmarkId = landmarkId
            })

        return pathSequenceMarkers

    }





    exportMissionPointsToJson() {
        const pointsArray = this.areaLandmarks.getLayers().map(marker => {
            const latlng = marker.getLatLng();
            return {
                id: marker._leaflet_id,
                lat: latlng.lat,
                lng: latlng.lng
            };
        });
        const output = {
            startPointId: this.startPoint._leaflet_id,
            points: pointsArray
        };

        const json = JSON.stringify(output);
        //console.log(json);
        return json
    }


}

