from flask import Flask, request, jsonify
from flask_cors import CORS
import sys , os
import time

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'coverage_path_planning')))
import PT_planner
# added the way to import
import qgc_sender

app = Flask(__name__)
CORS(app)

 

@app.route('/landmarks', methods=['POST'])
def receive_json():
    data = request.json
    sequence = list(map(int, planner(data)))
    data['path'] = sequence

    #extra added for loop
    #points_dict = {point["id"]: point for point in data["points"]}
    ordered_waypoints = []

    for path_id in data["path"]:
        for point in data["points"]:
            if point["id"] == path_id:
                ordered_waypoints.append(point)
                break   

            
    print("Ordered Waypoints:")
    for i, wp in enumerate(ordered_waypoints):
        print(f"  {i+1}. ID: {wp['id']} | lat: {wp['lat']} | lng: {wp['lng']}")


    #ordered_waypoints = qgc_sender.prepare_ordered_waypoints(data)

    #Send to QGroundControl
    try:
        qgc_sender.send_mission_to_qgc(ordered_waypoints)
    except Exception as e:
        print(f"Error sending mission to QGC: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500


    return jsonify({"status": "success", "received": data})

def planner(data):

    sequencePointIds = PT_planner.main('request', request_data = data)
    return  sequencePointIds

if __name__ == "__main__":
    app.run(debug=True)