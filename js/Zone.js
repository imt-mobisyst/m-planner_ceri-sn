import { layerGroupClickHandler } from './utils.js';
import { Path } from './Path.js';

class Zone{

    // Constructor
    constructor(layer) {
        this.id = layer._leaflet_id;
        this.layer = layer;
        this.markers = L.layerGroup();
        //this.path = new Path();
        
        if (layer instanceof L.Circle) {

            this.forme = Zone.CIRCLE
        }
        if (layer instanceof L.Polygone ) {

            
            if (layer instanceof L.Rectangle ) {

                this.forme = Zone.RECTANGLE
            }
            else {
                this.forme = Zone.POLYGONE
            }
        }
        

      }
      // Getters
      get id() {
        return this.id;
      }

      get forme() {
        return this.forme;
      }

      get landmarks(){

        let polylineCoordinates = layer.getLatLngs();
        return polylineCoordinates[0];

        
      }


      

      
      

      //Setters
      set id(value) {
        this.id = value;
      }
      set forme(value) {
        this.forme = value;
      }


      //methods
      computeBounds() {

        let list = this.landmarks();
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

    computeBorders(){

        let landmarks = this.landmarks();
        for (var i=0; i<landmarks.length-1; i++){

            const lm1 = landmarks[i];
            const lm2 = landmarks[i+1];

        }
        let coord = [];
        let line = L.polyline();
      }



    showarkers() {

        this.markers.addTo(map);

        
    }

    hideMarkers(){

        map.removeLayer(markers);
    }

    isMarkerInsidePolygon(marker, polyg) {

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

    

    // static variables for forms
    static POLYGONE = 'polygone';
    static CIRCLE = 'circle';
    static RECTANGLE = 'rectangle';
    // static variables for restrictions
    static TRESPASSING = 'trespassing';
}


export default class MissionZone extends Zone {

    constructor(layer){

        super(layer);
        
        this.restrictedZones = [];
        this.grid = new Grid(Grid.DEFAULTRESOLUTION, this.id)
        
    }

    addRestrictedZone(zone){

        const restricted = new RestrictedZone();
        restricted = zone;
        this.restrictedZones.push(restricted);
    }


    generateZoneMarkers(){

        var coordIcon = L.divIcon({className: 'leaflet-div-icon'});
        var coordIconHover = L.divIcon({className: 'leaflet-div-icon'});
        this.grid.gridCoordinates.forEach((coord) => {
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

            if (this.forme === Zone.POLYGONE || this.forme === Zone.RECTANGLE)
            {
                let zoneOfRestriction = null;
                const isInsideRestrictedZone = restrictedZones.some((zone) => {
                    if (isMarkerInsidePolygon(marker, zone)) {
                      zoneOfRestriction = zone;
                      return true;
                    }
                    return false;
                  });
                  

                if(isMarkerInsidePolygon(marker, layer)) {
                        if(!isInsideRestrictedZone) {
                            this.markers.addLayer(marker);
                        }
                        else{

                            zoneOfRestriction.markers.addLayer(marker)

                        }

                }
                }
           
            
            
        });
        

    }

    
}


class RestrictedZone extends Zone {

    constructor(id, layer, typeOfRestriction){

        super(id, layer);
        this.restrictionType = typeOfRestriction;
    }


    hideMarkers(){


    }


}



