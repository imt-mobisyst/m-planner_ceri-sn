from flask import Flask, request, jsonify
from flask_cors import CORS
import sys , os
import time

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'coverage_path_planning')))
import PT_planner


app = Flask(__name__)
CORS(app)

@app.route('/landmarks', methods=['POST'])
def receive_json():
    data = request.json
    #print(data)
    #sequencePointIds =
    sequence = list(map(int, planner(data)))
    data['path'] = sequence
    return jsonify({"status": "success", "received": data})

def planner(data):

    sequencePointIds = PT_planner.main('request', request_data = data)
    return  sequencePointIds

if __name__ == "__main__":
    app.run(debug=True)