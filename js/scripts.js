import {Mapper, gridVisible,  setVisibleGrid, setLandmarkLayer} from "./Mapper.js";
import {Grid, metersToDegreesLatitude} from "./Grid.js";
import {MissionZone, RestrictedZone} from "./Zone.js";
import { Mission, pathEndLandmarkId } from "./Mission.js";

let Grids = []
let landmarkLayer
let pathOnMapLayerId = NaN
let pathArrowsLayerId = NaN
let missionLandmarksLayerId = NaN
export let mission = new Mission()

export let mapInstance = new Mapper('map', {     
    center: [-33.7220295, 150.6733845],    
    zoom: 15})

mapInstance.initializeMap()

window.createGrids = function (){


    if (mapInstance.zones.length === 0){
        confirm("No mission zones defined, please select mission zone")
    }


    else {
        mapInstance.zones.forEach(function(zone) {

            if (zone instanceof  MissionZone){
                const resolutionInMeters = document.getElementById('step').value || Grid.DEFAULTRESOLUTION
                console.log('used resolutoin ', resolutionInMeters)
                const gridInstance = new Grid(resolutionInMeters, zone.id)
                Grids.push(gridInstance)
            }


        })
    }

}

window.showGrids = function (){

    createGrids()

    if (Grids.length === 0) {

        confirm("No Grid instance created yet")
    }

    else{

        Grids.forEach(function (grid) {

            let selectedZone
            mapInstance.zones.forEach(function(zone) {

                let gridZoneID  = grid.zoneId


                if (zone.id === gridZoneID){
                    selectedZone = zone
                    grid.drawGrid(selectedZone)
                    setVisibleGrid(true)
                    mapInstance.map.addLayer(grid.layer)


                    // To be modified to zoom on the global region of multiple zones and not the last edited zone
                    mapInstance.map.fitBounds(selectedZone.layer.getBounds());

                }
            })

        })
    }

}


window.showInterstCoordinates = function(){

        let missionZones = []
        let restrictedZones = []
        if (mission.areaLandmarks.getLayers().length > 0){
            console.log("there are landmarks")
            mapInstance.removeLayerbyId(missionLandmarksLayerId)
            mapInstance.removeLayerbyId(pathArrowsLayerId)
            mission.areaLandmarks = L.layerGroup();
            mission.arrows = L.layerGroup();
            missionLandmarksLayerId = NaN;
            pathArrowsLayerId = NaN;
        }
        else{
            console.log("there are no landmarks")
        }
    mapInstance.zones.forEach((zone) =>{
        if (zone instanceof MissionZone){
            missionZones.push(zone)
        }else if(zone instanceof  RestrictedZone){
            restrictedZones.push(zone)
        }
    })
    Grids.forEach(function (grid) {
        grid.gridCoordinates.forEach((coord) => {
            //let marker = L.marker([coord.lat, coord.lng], {icon: coordIcon});
            let marker = mapInstance.addMarker(coord.lat, coord.lng, '')

            missionZones.forEach(function (missionZone) {

                if (missionZone.isMarkerInsideZone(marker)) {
                    if (!(restrictedZones.some((restrictZone) => restrictZone.isMarkerInsideZone(marker)))) {
                        mission.areaLandmarks.addLayer(marker);
                    }

                }
            });


        });
    });
    missionLandmarksLayerId = mission.areaLandmarks.addTo(mapInstance.map)._leaflet_id
}


window.toggleGridShow = function(){
    if (!gridVisible){
        showGrids()
        setVisibleGrid(true)
    }
   else {
        Grids.forEach(function (grid) {
            mapInstance.map.removeLayer(grid.layer)
        })
        setVisibleGrid(false)


    }


}

window.planMission = function () {

    if (mission.areaLandmarks.getLayers().length > 0){

        if(mission.startPoint.getLatLng()){
            let jsonLandmarks =  mission.exportMissionPointsToJson()


            fetch('http://localhost:5000/landmarks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: jsonLandmarks
            })
                .then(response => response.json())
                .then(data => {
/*
                    mapInstance.map.removeLayer(pathOnMap);
*/

                    mapInstance.removeLayerbyId(pathOnMapLayerId)
                    mapInstance.removeLayerbyId(pathArrowsLayerId)
                    mission.arrows = L.layerGroup();
                    mission.path = data['received']['path']
                    let latLngs = mission.drawMissionPath()
                    addArrows(latLngs)

                    let pathPolyline = L.polyline(latLngs, {color: 'red'}).addTo(mapInstance.map);
                    let endIcon = L.divIcon({className: 'leaflet-div-icon-end'});
                    mission.areaLandmarks.getLayers().forEach((layer) => {
                        if (layer._leaflet_id === pathEndLandmarkId){

                            layer.setIcon(endIcon)
                        }
                    })

                    pathOnMapLayerId = pathPolyline._leaflet_id
                    pathArrowsLayerId = mission.arrows._leaflet_id

                } )
                .catch(error => {
                    console.error('Error:', error)
                    confirm("Server error")
                });
        }
        else{
            confirm("Please set a starting point")
        }
    }else{

        confirm("There are no landmarks set, please generate landmarks !")
    }


}




function addArrows(latlngs) {
    for (let i = 0; i < latlngs.length - 1; i++) {
        var start = L.latLng(latlngs[i]);
        var end = L.latLng(latlngs[i + 1]);

        var angle = Math.atan2(end.lat - start.lat, end.lng - start.lng);
        const resolutionInMeters = document.getElementById('step').value || Grid.DEFAULTRESOLUTION
        var arrowLength = metersToDegreesLatitude(resolutionInMeters / 4); // Length of the arrow
        var arrowWidth = 1;   // Width of the arrowhead

        // Calculate the arrowhead points
        if (Math.abs(angle) === Math.PI / 2 ){
            angle = angle + 3 * Math.PI / 2
        }else if(Math.abs(angle) === Math.PI ){
            angle = angle +  Math.PI / 2
        }else if (Math.abs(angle) === 0){
            angle = angle +  Math.PI / 2
        }
        var arrowDirection1 = angle - Math.PI / 6;
        var arrowDirection2 = angle + Math.PI / 6
        var point1 = L.latLng(end.lat - arrowLength * Math.cos(arrowDirection1), end.lng - arrowLength * Math.sin(arrowDirection1));
        var point2 = L.latLng(end.lat - arrowLength * Math.cos(arrowDirection2), end.lng - arrowLength * Math.sin(arrowDirection2));// Create arrowhead as a polygon

        let arrowsLayer =L.polygon([end, point1, point2], {
            color: 'red',
            fillColor: 'red',
            fillOpacity: 1,
            weight: 0
        });
        mission.arrows.addLayer(arrowsLayer)
        mission.arrows.addTo(mapInstance.map)
    }
}






