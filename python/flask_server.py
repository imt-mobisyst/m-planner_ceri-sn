from flask import Flask, request, jsonify
from flask_cors import CORS
import sys , os
import time

import json
import datetime

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'coverage_path_planning')))
import PT_planner


app = Flask(__name__)
CORS(app)

@app.route('/landmarks', methods=['POST'])
def receive_json():
    data = request.json
    sequence = list(map(int, planner(data)))
    data['path'] = sequence
    saveToJson(data)
    return jsonify({"status": "success", "received": data})

def planner(data):

    sequencePointIds = PT_planner.main('request', request_data = data)
    return  sequencePointIds

def saveToJson(data):
    JSONfilename =  f"mission_{datetime.datetime.now().strftime('%d-%m-%Y_%H%M%S')}.json"
    with open(f"coverage_path_planning/json/{JSONfilename}", 'w') as f:
        json.dump(data, f, indent=4)

if __name__ == "__main__":
    app.run(debug=True)