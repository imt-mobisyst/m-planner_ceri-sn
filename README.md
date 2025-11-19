# Aquatic drone mission planner UI/Backend

This project of M-Planner API for QGroundControl combines an interactive web interface with a backend powered by a custom coverage path planning algorithm. Missions are sent directly to **QGroundControl(QGC)** using **MAVLink over UDP**, allowing real-time waypoint updates without manual reloading.


## Folders Organization
This project is organized into different folder as follows :<br>
├── audios<br>
....<br>
├── index.html **-->  Used to see interface** <br>
├── js<br> **--> JavaScript for UI logic** <br>
|   ├── scripts.js     **--> Sends map points from UI to backend via http requests** <br>
└──...<br>
├── python<br>
│   ├── coverage_path_planning<br>
│   │   ├── coverage_planner.py<br>
│   │   ├── coverage_test.py<br>
│   │   ├── json **-->  Used to save json files**<br>
│   │   │   ├── json_to_numpy.py<br>
│   │   │   ├── missionPoints.json<br>
│   │   │   ├── __pycache__<br>
│   │   │   ├── updated_missionPoints.json<br> 
|   |   |   └── mission_29-04-2025_125308.json<br> **--> Saves the json points individually**<br>

│   ├── flask_server.py **-->  Used to run planner backend**<br>
|   ├── qgc_sender.py   **--> Handles MAVLink UDP communication to QGC** <br>
│   ├── install.txt<br>
│   ├── planner_venv<br>
│   └── requirements.txt<br>
├── ...<br>
└── <br>


## Explanation :  

Our approach is compared with a state of art solution that could be found here : <br>
https://github.com/rodriguesrenato/coverage-path-planning <br>
This solution try to identify the "best" heuristic to plan the coverage path. These heuristics difference mainly in 
the manner of neighborhood definition. It takes also into account the movement to operate by the robot. Based on these parameters, the approach defines a policy matrix, which in turn defines the sequence of movements given a position.<br>

Building on these ideas, this project evolves into a complete mission planning framework by integrating:<br>

- Matrix-based heuristic logic for path optimization.<br>

- A web-based user interface for mission zone selection. <br>

- A backend planning pipeline with intelligent waypoint sequencing.<br>

- Real-time transmission of missions to QGroundControl using MAVLink over UDP. <br>

This system is designed to support automated and visual mission creation, reducing operator burden and improving drone path efficiency during aquatic monitoring missions.


### Our approach :

- **Interactive Web-Based Mission Planning**: Users can select mission points from a browser-based map interface to define coverage or exploration zones for the aquatic drone. <br>

- **Custom Point Sequencing with PT_planner**: The **PT_planner** module intelligently determines the optimal sequence of mission waypoints based on simple heuristics. This improves the logical flow of missions and is easily extendable for advanced path optimization. <br>

In our approach we define 3 Main matrix, V, A and R each is of the size of the map conatainig :<br>

**V: Visted** : Binary matrix defining selecting the visited regions during sweep<br>

**A: Attractivty** : Depending on a "goal point", more the point is far from the goal the more is attractive.

**R: Reachability** : Depending on obstacles and visited neighbors the region is more or less reachable.

By using these three matrix, we can define a logic that optimizes the path by going to the more attractive point while prioritizing the mess reachable ones.<br>
The visited matrix can help if we want a strategy to visit each point once. or reduce the number of pass-through of each region


- **Real-Time MAVLink Communication**: Seamless transmission of waypoints to QGroundControl (QGC) via UDP using the **pymavlink** library, supporting full automation. <br>

- **Live Mission Updates in QGC**: Uploaded missions are visible in QGC’s Plan view without needing to restart the application, using MAVLink refresh commands. <br>

- **Modular Architecture**: Clean separation between the frontend **(JS)**,backend server **(Flask_server)**, mission planning logic **(PT_planner)** and communication logic **(qgc_sender.py)** makes the system extensible and easy to maintain. <br>

### Metrics 
To be able to compare different solutions and the "best" optimized path we define three metrics : <br>
**Coverage Distance** :  the total distance of coverage path.<br>
**Turn / Rotation number** : the number of left / right turns.<br>
**Pass-through distance** : the total distance of passing over already visited region. <br>


## Run the project <br>

To run this project you need to open index.html in a browser :<br>

To run the backend flask server, move inside python folder cd python and do :<br>
1. **Move to python directory :**  cd pythonication with **QGroundCication with **QGroundControl** using the **pymavlink** library. It creates the MAVLink mission items and sends them via UDP. <br>
ontrol** using the **pymavlink** library. It creates the MAVLink mission items and sends them via UDP. <br>

2. **Create Python Virtual Environment by running:**<br>
run : python3 -m venv <env_name> <br>
replace <env_name> by the name of your environment<br>
source <env_name>/bin/activate<br>
You should see the environment activated<br>
3. **Install requirements by running :**<br>
pip install  requirements.txt<br>
Or run each of needed packages installation inside folder file python/install.txt, it will automatically install dependencies<br>
4. **Run :** <br>
 
(Optional / if not done yet) Activate your virtual environment if needed:<br>
<pre>source &lt;env_name&gt;/bin/activate</pre> 
Start the Flask server:<br>
<pre>python3 flask_server.py</pre> 
Go to root directory of this project then run : <br>
<pre> bash python3 -m http.server 8000 </pre> 
Open your browser and go to:<br>
<pre> http://localhost:8000/index.html</pre> 
Use web interface to plan a mision and generate a path.<br>

5. **Launch QGroundControl :**
In a separate terminal, start the ArduPilot SITL simulation: <br>
```bash
cd suv_ws/src/suv_simulation/scripts/ <br>
```
Then:<br>
Open QGroundControl using **./launch simulation.sh** <br>
QGC will automatically connect to the simulator (default UDP port 14550) and display the mission once it receives waypoints. <br>

6. **Output**
All generated mission plans (waypoints) are saved to: <br>

```bash
python/coverage_path_planning/json/ <br>
```
Each file is timestamped for easy reference and recovery. <br>

## Key Code Components – Explained


### 1. **flask_server.py – Mission Planning Backend**
This is the main Flask-based backend server that receives mission data from the frontend and initiates all logic to compute and send waypoints to QGroundControl (QGC). <br>

**Main Responsibilities:**<br>

- **Receives mission points (landmarks) from frontend** <br>
    - Accepts a **POST** request rom the frontend UI at the endpoint **/landmarks**. <br>

- **Performs path planning**
    - Calls your custom coverage path planner (**PT_planner.main()**) to determine the optimal sequence of waypoints.<br>
    - This planner uses matrices V, A, and R to calculate efficient traversal paths while avoiding redundancy and obstacles.<br>

- **Prepares ordered waypoints** <br>
    - Converts the ordered points into a list of dictionaries with latitude, longitude, and altitude (typically a default of 0m).<br>
    - Ensures the sequence follows the path planner logic.<br>

- **Establishes a MAVLink connection**<br>
    - Calls **qgc_sender.connect_to_qgc()** to open a UDP connection to QGC on port **14551**.<br>

- **Uploads the mission to QGC**<br>
    - Calls: <br>
    **send_mission_to_qgc(connection, waypoints)**<br>
    - Sends a complete MAVLink mission that includes all waypoints with **lat/lon/alt**.<br>

- **Handles cleanup and logging**<br>
    - Prints connection success, mission upload confirmation, and gracefully closes the connection.

### 2. **qgc_sender.py – MAVLink Mission Sender**

This module handles low-level communication with **QGroundControl** using the **pymavlink** library. It creates the MAVLink mission items and sends them via UDP. <br>

**Main Responsibilities:**<br>

- **Connects to QGC via UDP** 
    - Opens a UDP connection to QGC’s listening port (default is **127.0.0.1:14551**) using: <br>

    **mavutil.mavlink_connection('udpout:127.0.0.1:14551')** <br>

    - Waits for a heartbeat to confirm communication is live. <br>

- **Creates and sends waypoints**
    - Converts each waypoint (lat, lon, alt) into a **MAVLink MISSION_ITEM_INT** message: <br>
    **connection.mav.mission_item_int_send(...)** <br>

- **Sends mission count and index**
    - Initiates the mission upload by sending:<br>
    **connection.mav.mission_count_send(...)** <br>
    followed by each waypoint message. <br>

- **Logs progress**
    - Prints helpful debug information (mission accepted, failed, invalid, etc.). <br>
    - Can be run in debug mode to print every MAVLink message exchanged (useful for diagnostics). <br>

## Future Development Goals








