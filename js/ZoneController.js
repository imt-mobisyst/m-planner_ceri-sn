import MissionZone from "./Zone";

class ZoneController {

    constructor (){

        this.missionZones = new Array();


    }


    addMissionZone(zoneLayer){

        this.missionZones.push(new MissionZone(zoneLayer));
    }


}