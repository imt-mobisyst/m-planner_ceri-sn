import json
import sys, os
import numpy as np
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'coverage_path_planning')))

class NpEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.integer):
            return int(obj)
        if isinstance(obj, np.floating):
            return float(obj)
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        return super(NpEncoder, self).default(obj)
    
def myconverter(obj):
        if isinstance(obj, np.integer):
            return int(obj)
        elif isinstance(obj, np.floating):
            return float(obj)
        elif isinstance(obj, np.ndarray):
            return obj.tolist()

def load_data_from_file(file_path):
    try :
        with open('json/'+file_path, 'r') as file:
                return json.load(file)
    except Exception as e :
        print(e)

def json_to_matrix_with_ids(row_data):
    starting_point = None
    print(row_data)
    data = row_data['points']
    lats = [point['lat'] for point in data]
    lngs = [point['lng'] for point in data]
    
    min_lat, max_lat = min(lats), max(lats)
    min_lng, max_lng = min(lngs), max(lngs)

    lat_steps = [abs(lats[i] - lats[i+1]) for i in range(len(lats)-1) if abs(lats[i] - lats[i+1]) > 0]
    lng_steps = [abs(lngs[i] - lngs[i+1]) for i in range(len(lngs)-1) if abs(lngs[i] - lngs[i+1]) > 0]
    
    if not lat_steps or not lng_steps:
        raise ValueError("Unable to determine step size: No valid non-zero steps found")
    
    lat_step = min(lat_steps)
    lng_step = min(lng_steps)
    
    num_rows = int((max_lat - min_lat) / lat_step) + 1
    num_cols = int((max_lng - min_lng) / lng_step) + 1
    
    matrix = np.ones((num_rows, num_cols), dtype=int)
    id_matrix = np.full((num_rows, num_cols), -1, dtype=int)
    
    position_to_id = {}
    
    for point in data:
        row = int((point['lat'] - min_lat) / lat_step)
        col = int((point['lng'] - min_lng) / lng_step)
        if (point['id']== row_data['startPointId']) :
            matrix[row, col] = 2

        else :
            matrix[row, col] = 0
        position_to_id[(row, col)] = point['id']
        id_matrix[row, col] = point['id']
    
    matrix = np.flipud(matrix)
    id_matrix = np.flipud(id_matrix)
    starting_point = (np.where(matrix == 2)[0][0],np.where(matrix == 2)[1][0])
    
    
    adjusted_position_to_id = {(num_rows - 1 - row, col): id for (row, col), id in position_to_id.items()}
    
    return matrix, id_matrix, starting_point

def write_sequence_to_json(json_file, sequence):

    with open('json/'+json_file, 'r') as file:
        raw_data = json.load(file)
    print(sequence[0].dtype)
    sequence = list(map(int, sequence))
    raw_data['path'] = sequence
    print(json.dumps(raw_data))
    
    with open('json/updated_'+json_file, 'w') as file:
        json.dump(raw_data, file, indent=4)




