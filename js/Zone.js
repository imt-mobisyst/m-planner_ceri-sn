/*import { layerGroupClickHandler } from './utils.js';
import { Path } from './Path.js';*/
import {Grid} from "./Grid.js";

export class Zone{

    // Constructor
    constructor(layer) {
        this.id = layer._leaflet_id;
        this.layer = layer;
        this.markers = L.layerGroup();
        //

    }


      get landmarks(){

        if (this.layer instanceof L.Polygon){
            let polylineCoordinates = this.layer.getLatLngs();
            return polylineCoordinates[0];
        }
        else if (this.layer instanceof L.Circle){
            return [this.layer.getLatLng(), this.layer.getRadius()];

        }
        else
        {
            console.log('form not supported yet !!')
        }



      }

    /*
      set forme(value) {
        this.forme = value;
      }*/


      computeBounds() {

          if (this.layer instanceof L.Circle){

              let circleLandmarks = this.landmarks;

              const latRadius = (circleLandmarks[1] / 6378137) * (180 / Math.PI); // Latitude degrees
              const lngRadius = latRadius / Math.cos(circleLandmarks[0].lat * Math.PI / 180); // Longitude degrees

              // Calculate bounds
              s = circleLandmarks[0].lat - latRadius;
              n = circleLandmarks[0].lat + latRadius;
              w = circleLandmarks[0].lng - lngRadius;
              e = circleLandmarks[0].lng + lngRadius;

          }
          else if (this.layer instanceof L.Polygon) {

              let list = this.landmarks;
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

          }
          else {
              console.log('Forme not supported yet !!')
          }


        return new L.latLngBounds(L.latLng(s, w) , L.latLng(n, e));

    }
    /*

    computeBorders(){

        let landmarks = this.landmarks();
        let line = L.polyline();
        let borders = [];
        for (var i=0; i<landmarks.length-1; i++){

            const lm1 = landmarks[i];
            const lm2 = landmarks[i+1];
            line = L.polyline([lm1.getLatLng(),lm2.getLatLng()]).addTo(map);
            borders.push(line);


        }

        return borders;

      }
    showarkers() {
        this.markers.addTo(map);
    }

    hideMarkers(){
        map.removeLayer(markers);
    }
*/
    // static variables for forms
    static POLYGONE = 'polygone';
    static CIRCLE = 'circle';
    static RECTANGLE = 'rectangle';
    // static variables for restrictions
    static TRESPASSING = 'trespassing';

    isMarkerInsideZone(marker) {

        var inside = false;
        var x = marker.getLatLng().lat, y = marker.getLatLng().lng;
        var polyPoints = this.landmarks;
        if (this.layer instanceof L.Polygon){
            for (var i = 0, j = polyPoints.length - 1; i < polyPoints.length; j = i++) {
                var xi = polyPoints[i].lat, yi = polyPoints[i].lng;
                var xj = polyPoints[j].lat, yj = polyPoints[j].lng;
                var intersect = ((yi > y) != (yj > y))
                    && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
                if (intersect) inside = !inside;
            }
        }
        else if (this.layer instanceof L.Circle) {
            const distance = marker.getLatLng().distanceTo(this.landmarks[0]);
            return distance <= this.landmarks[1];
        }
        else{

        }


        return inside;
    };


}


export class MissionZone extends Zone {

    constructor(layer){

        super(layer);

        this.restrictedZones = [];
        this.grid = new Grid(Grid.DEFAULTRESOLUTION, this.id)

    }

}


export class RestrictedZone extends Zone {

    constructor(layer,  typeOfRestriction = Zone.TRESPASSING){

        super(layer);
        this.restrictionType = typeOfRestriction;
    }



}



