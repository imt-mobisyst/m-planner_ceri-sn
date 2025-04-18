# Aquatic drone mission planner UI/Backend
## Folders Organization
This project is organized into different folder as follows :<br>
├── audios<br>
├── class_loadmap.html<br>
├── cpp<br>
├── docs<br>
├── images<br>
├── index.html<br>
├── js<br>
├── LICENSE<br>
├── node_modules<br>
├── package.json<br>
├── package-lock.json<br>
├── projectServer.js<br>
├── python<br>
│   ├── coverage_path_planning<br>
│   ├── flask_server.py<br>
│   ├── install.txt<br>
│   ├── planner_venv<br>
│   └── requirements.txt<br>
├── README.md<br>
└── style<br>


## Explanation :

Our approach is comapred to a state of art solution that could be foudn here : <br>
https://github.com/rodriguesrenato/coverage-path-planning <br>
This solution try to identify the "best" heuristic to plan the coverage path. These heuristics difference mainly in 
the manner of neighborhood definition. It takes also into account the movement to operate by the robot. based on these parameters it defines a policy matrix that defines the sequence of movement given a position.<br>

### Our approach :
 In our approach we define 3 Main matrix, V, A and R each is of the size of the map conatainig :<br>

**V: Visted** : Binary matrix defining selecting the visited regions during sweep<br>

**A: Attractivty** : Depending on a "goal point", more the point is far from the goal the more is attractive.

**R: Reachability** : Depending on obstacles and visited neighbors the region is more or less reachable.

By using these three matrix, we can define a logic that optimizes the path by going to the more attractive point while prioritizing the mess reachable ones.<br>
The visited matrix can help if we want a strategy to visit each point once. or reduce the number of pass-through of each region

### Metrics 
To be able to compare different solutions and the "best" optimized path we define three metrics : <br>
**Coverage Distance** :  the total distance of coverage path.<br>
**Turn / Rotation number** : the number of left / right turns.<br>
**Pass-through distance** : the total distance of passing over already visited region. <br>

## Run the project <br>
To run this project you need to open index.html in a browser :<br>

To run the backend flask server, move inside python folder cd python and do :<br>
1. **Move to python directory :**  cd python
2. **Create Python Virtual Environment by running:**<br>
run : python3 -m venv <env_name> <br>
replace <env_name> by the name of your environment<br>
source <env_name>/bin/activate<br>
You should see the environment activated<br>
3. **Install requirements by running :**<br>
pip install  requirements.txt<br>
Or run each of needed packages installation inside folder file python/install.txt, it will automatically install dependencies<br>
4. **Run :** <br>
Go to root directory of this project then run : <br>
<pre> bash python3 -m http.server 8000 </pre> 
Open your browser and go to:<br>
<pre> http://localhost:8000/index.html</pre> 
Navigate to the python folder:<br>
<pre> cd python</pre> 
(Optional / if not done yet) Activate your virtual environment if needed:<br>
<pre>source &lt;env_name&gt;/bin/activate</pre> 
Start the Flask server:<br>
<pre>python3 flask_server.py</pre> 
Use web interface to plan a mision and generate a path.<br>
**NB :** If needed data is saved into  python/coverage_path_planning/json folder : files are references by datetime of palanning
