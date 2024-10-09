
import numpy as np
import networkx as nx
import matplotlib.cm as cm
import itertools
from enum import Enum, auto
import matplotlib.pyplot as plt
import matplotlib as mpl
from matplotlib.lines import Line2D
from coverage_path_planning.json import json_to_numpy
import numpy as np
import os, sys
import cv2
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'coverage_path_planning')))

import copy


import coverage_test
import weighted_strategy
from matplotlib.patches import FancyArrowPatch, Rectangle





class bcolors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'


class PlannerStatus(Enum):
    STANDBY = auto()
    COVERAGE_SEARCH = auto()
    NEARST_UNVISITED_SEARCH = auto()
    FOUND = auto()
    NOT_FOUND = auto()


class Maps_genetor():

    def __init__(self, map = None): 

        if map is None :
            self.generate_random_map(20, 20, (0, 0))
        else :
            self.map = map

        self.graph = nx.DiGraph()


    def generate_clear_map(self, rows, cols, start):
        rows, cols = 20, 20
        map = np.full((rows, cols), 0)
        map[start] = 2
        return map
    
    def add_obstacles(self, matrix, positions = None):
        rows , cols = matrix.shape
        for (i,j) in itertools.product(range(rows), range(cols)) :
            if positions :
                if (i,j) in positions :
                    matrix[(i,j)] = 1
            else :
                obs = np.random.normal(0.4,scale=0.3)
                if (obs> 0.95 and (i!=0 and j!=0) and (i!=rows-1 and j != cols - 1)):
                    matrix[(i,j)] = np.inf
        return matrix
    

    def generate_random_map(self, rows, cols, start):
        self.map = np.full((rows, cols), 0)
        for (i, j) in itertools.product(range(rows), range(cols)):
            obs = np.random.normal(0.4,scale=0.05)
            if (obs>= 0.5):
                self.map[(i,j)]= 1
        self.map[start] = 2
    
    def get_obstacles_positions(self):

        positions = []

        for (i, j) in itertools.product(range(self.map.shape[0]), range(self.map.shape[1])):
            if self.map[(i,j)]==1 :
                positions.append((i,j))

        return positions
    def save_as_image(self, name = 'filename'):
        print('map', self.map)
        mask = (self.map == 1)
        print('mask', mask)
        result_matrix = np.ones_like(self.map, dtype=int)
        print('result_matrix',result_matrix)
        result_matrix[mask] = 0
        print(result_matrix)
        with open("/home/root2024/drone-aquatique/ceri-sn_imt_m-planner/python/coverage_path_planning/map/"+name+".png", 'wb') as f:
            plt.imsave(f, np.array(result_matrix), cmap=cm.gray)




    def save_as_npy(self, name='map0'):
        m = np.array(self.map)
        with open("/home/root2024/drone-aquatique/ceri-sn_imt_m-planner/python/coverage_path_planning/maps/"+name+".npy", 'wb') as f:
            np.save(f, m)

    def load_npy_map(self, dir_path,  map_name):
        with open(dir_path+"{}.npy".format(map_name), 'rb') as f:
            return np.load(f)
        
    def load_plt_map(self, dir_path = '/home/root2024/drone-aquatique/ceri-sn_imt_m-planner/python/coverage_path_planning/map/', name= 'test_2'):

        img = plt.imread(os.path.join(dir_path, 'map', name+'.png'))
        return img
        
    def plot_obstacles(self) :

        obstacles = self.get_obstacles_positions()
        swapped_coordinates = [(y, x) for x, y in obstacles]
        for i, coord in enumerate(swapped_coordinates):
            self.graph.add_node(i, pos=coord)
            if i > 0:
                self.graph.add_edge(i-1, i)
        self.graph.add_edge(len(swapped_coordinates)-1, 0)

        pos = nx.get_node_attributes(self.graph, 'pos')

        nx.draw_networkx_nodes(self.graph, pos, node_size=50, node_color='red')
    
    def plot_arrows_with_networkx(self, coordinates):

        swapped_coordinates = [(y, x) for x, y in coordinates]
        for i, coord in enumerate(swapped_coordinates):
            self.graph.add_node(i, pos=coord)
            if i > 0:
                self.graph.add_edge(i-1, i)
        self.graph.add_edge(len(swapped_coordinates)-1, 0)

        pos = nx.get_node_attributes(self.graph, 'pos')

        nx.draw_networkx_nodes(self.graph, pos, node_size=50, node_color='blue')

        nx.draw_networkx_edges(self.graph, pos, edgelist=self.graph.edges(), arrowstyle='->', arrowsize=5)

        #labels = {i: f"{coord}" for i, coord in enumerate(coordinates)}
        #nx.draw_networkx_labels(G, pos, labels, font_size=12)

        plt.title('Chemin')
        ax = plt.gca()
        ax.invert_yaxis()
        self.plot_obstacles()
        plt.grid(False)
        #plt.show()



    def plot_map(self, trajectory, map_name="map", params_str=""):

        movement = [[-1,  0],  # up
                    [0, -1],    # left
                    [1,  0],    # down
                    [0,  1]]    # right
        action = [-1, 0, 1, 2]
        fig, ax = plt.subplots()
        start_position_color = 'gold'
        start_orientation_color = 'deeppink'
        status_color_ref = {PlannerStatus.STANDBY: 'black',
                            PlannerStatus.COVERAGE_SEARCH: 'royalblue',
                            PlannerStatus.NEARST_UNVISITED_SEARCH: 'darkturquoise',
                            PlannerStatus.FOUND: 'mediumseagreen',
                            PlannerStatus.NOT_FOUND: 'red'}
        cmap = mpl.colors.ListedColormap(
            ['w', 'k', start_position_color, status_color_ref[PlannerStatus.FOUND], status_color_ref[PlannerStatus.NOT_FOUND]])
        norm = mpl.colors.BoundaryNorm([0, 1, 2, 3, 4, 5], cmap.N)
        status_to_cmap_pos = {PlannerStatus.FOUND: 3,
                            PlannerStatus.NOT_FOUND: 4}

        target_map_ref = np.copy(self.map)

        print(trajectory[-1][1] , trajectory[-1][2])
        target_map_ref[
            trajectory[-1][1]][trajectory[-1][2]] = 3
        
        

        ax.imshow(target_map_ref, interpolation='none', cmap=cmap, norm=norm)

        for i in range(len(trajectory)-1):

            x = trajectory[i][2]
            y = trajectory[i][1]
            print(trajectory[i])
            print(x, y)

            mov_idx = 1#(trajectory[i][3]+action[trajectory[i][5]]) % len(movement)
            mov = movement[mov_idx]

            arrow_color = 'red'

            ax.arrow(x, y, mov[1], mov[0], width=0.1,
                    color=arrow_color, length_includes_head=True)

        init_direction = np.array(movement[trajectory[0][3]])/2
        ax.arrow(trajectory[0][2]-init_direction[1]/2, trajectory[0][1]-init_direction[0]/2, init_direction[1], init_direction[0], width=0.1,
                color=start_orientation_color, length_includes_head=True, head_length=0.2)

        legend_elements = [Line2D([0], [0], color=status_color_ref[PlannerStatus.COVERAGE_SEARCH], lw=1, marker='>',
                                markerfacecolor=status_color_ref[PlannerStatus.COVERAGE_SEARCH], label='Coverage Search'),
                        Line2D([0], [0], color=status_color_ref[PlannerStatus.NEARST_UNVISITED_SEARCH], lw=1, marker='>',
                                markerfacecolor=status_color_ref[PlannerStatus.NEARST_UNVISITED_SEARCH], label='A*u Search'),
                        Line2D([0], [0], color='w', lw=1, marker='>',
                                markerfacecolor=start_orientation_color, label='Start Orientation'),
                        Line2D([0], [0], marker='s', color='w', label='Start Pos',
                                markerfacecolor=start_position_color, markersize=15),
                        Line2D([0], [0], marker='s', color='w', label='End Pos',
                                markerfacecolor='red', markersize=15),
                        Line2D([0], [0], marker='s', color='w',
                                label='Obstacle', markerfacecolor='k', markersize=15),
                        ]
        ax.legend(handles=legend_elements, bbox_to_anchor=(
            1.025, 1.0), loc='upper left')
        plt.title("Coverage Path Planning - {}\n{}".format(map_name, params_str))
        plt.tight_layout()
        #plt.show()
        fig.savefig("output_images/{}.png".format(map_name), bbox_inches='tight')

    def draw_grid_with_path_and_arrows_and_squares(self, grid_size, path, image_name):
        fig, ax = plt.subplots()

        ax.set_xticks(np.arange(0, grid_size[0] + 1, 1))
        ax.set_yticks(np.arange(0, grid_size[1] + 1, 1))
        ax.grid(which='both')


        ax.set_xlim(-1, grid_size[0] + 1)
        ax.set_ylim(-1, grid_size[1] + 1)

        ax.set_aspect('equal')
        ax.invert_yaxis()

        for (x, y) in self.get_obstacles_positions():
            square = Rectangle((x - 0.5, y - 0.5), 1, 1, color='black')
            ax.add_patch(square)

        item_iter = iter(path)

        start_pos = next(item_iter)
        for (x0, y0), (x1, y1) in zip(path[:-1], path[1:]):
            if ( (x0, y0)== start_pos):
                square = Rectangle((x0 - 0.5, y0 - 0.5), 1, 1, color='yellow')
                ax.add_patch(square)

            arrow = FancyArrowPatch(
                (x0, y0), (x1, y1),
                arrowstyle='->', color='red',
                mutation_scale=8, linewidth=1.5
            )
            ax.add_patch(arrow)

        square = Rectangle((x1 - 0.5, y1 - 0.5), 1, 1, color='green')
        ax.add_patch(square)

        path_x, path_y = zip(*path)
        ax.plot(path_x, path_y, marker='+', color='blue', linestyle='-', linewidth=2, markersize=8)

        ax.set_xlabel('X-axis')
        ax.set_ylabel('Y-axis')
        ax.set_title('Path draw on grid')
        plt.gca().invert_yaxis()

        #plt.show()
        plt.savefig('/home/root2024/drone-aquatique/ceri-sn_imt_m-planner/python/coverage_path_planning/output_images/'+image_name+'.jpg')



class Mission():

    def __init__(self, data):

        matrix, id_matrix, starting = json_to_numpy.json_to_matrix_with_ids(data)
        self.map_matrix = matrix
        self.id_matrix = id_matrix
        self.starting_point = starting
        self.map_generator = Maps_genetor(np.array(matrix))

    def id_sequence(self, rowcol_sequence):

        ids_sequence = []
        for position in rowcol_sequence :
            ids_sequence.append(self.id_matrix[position])

        return ids_sequence

    def free_space_first_position(self):
        first_available_point = None
        for i in range(self.map_matrix.shape[0]):
            for j in range(self.map_matrix.shape[1]):
                if self.map_matrix[i, j] == 0:
                    first_available_point = (i, j)
                    break
            if first_available_point:
                break

        return  first_available_point


class PT_Planner():


    def __init__(self, matrix) :
        self.reachabilty = np.full_like(matrix, 8)
        self.reachabilty[[0, -1], :] = 5; self.reachabilty[:, [0, -1]] = 5
        self.reachabilty[(0, 0, -1, -1), (0, -1, 0, -1)] = 3
        self.cost_matrix = np.full_like(matrix, np.inf)
        self.visited = np.full_like(matrix, 0)

    
    def wavefront_algorithm(self, matrix, goal):
    
        rows, cols = matrix.shape
        self.cost_matrix = np.full((rows, cols), np.inf)
        self.cost_matrix[goal] = 0
        
        queue = [goal]
        
        loop_cost = 1
        

        while queue:
            current = queue.pop(0)
            current_cost = np.max([np.abs(current[0]-goal[0]),np.abs(current[1]-goal[1])])
            current_neighborhood = self.neighborhood(current, matrix)
            for neighbor in current_neighborhood:
                current_cost = np.max([np.abs(neighbor[0]-goal[0]),np.abs(neighbor[1]-goal[1])])
                new_cost = current_cost 

                try :
                    if new_cost < self.cost_matrix[neighbor]:
                        
                        self.cost_matrix[neighbor] = new_cost
                        queue.append(neighbor)
                except :
                    continue
                
            #print('------',current)
            loop_cost=loop_cost+1
        
    
    def neighborhood(self, point, matrix, type ='square', excluded = None):
            rows , cols = matrix.shape
            neighborhood_list = []
            if type =='square':
                directions = [(-1, 0), (1, 0), (0, -1), (0, 1)]
            elif type =='octa':
                directions = [(-1, 0), (1, 0), (0, -1), (0, 1), (-1, -1), (-1, 1), (1, -1), (1, 1)]

            for direction in directions:
                neighbor = (point[0] + direction[0], point[1] + direction[1])
                if 0 <= neighbor[0] < rows and 0 <= neighbor[1] < cols:
                    if (excluded and neighbor in excluded) :
                        continue
                    else:    
                        neighborhood_list.append(neighbor)
            return neighborhood_list



    def add_obstacles_from_map(self, map : Maps_genetor):
        positions = map.get_obstacles_positions()
        rows , cols = self.cost_matrix.shape
        for (i,j) in itertools.product(range(rows), range(cols)) :
            if positions :
                if (i,j) in positions :
                    self.cost_matrix[(i,j)] = np.inf
            else :
                obs = np.random.normal(0.4,scale=0.3)
                if (obs> 0.95 and (i!=0 and j!=0) and (i!=rows-1 and j != cols - 1)):
                    self.cost_matrix[(i,j)] = np.inf
        


    def add_obstacles(matrix, positions = None):
        rows , cols = matrix.shape
        for (i,j) in itertools.product(range(rows), range(cols)) :
            if positions :
                if (i,j) in positions :
                    matrix[(i,j)] = np.inf
            else :
                obs = np.random.normal(0.4,scale=0.3)
                if (obs> 0.95 and (i!=0 and j!=0) and (i!=rows-1 and j != cols - 1)):
                    matrix[(i,j)] = np.inf
        return matrix

    def calculate_reachability(self):
        rows , cols = self.reachabilty.shape
        for (i,j) in itertools.product(range(rows), range(cols)) :
            if(self.cost_matrix[(i,j)]==np.inf):
                        self.reachabilty[(i,j)] = 0
                        current_neighborhood_inf = self.neighborhood((i,j), self.reachabilty, type='octa')
                        try :
                            for nei in current_neighborhood_inf :
                                if self.reachabilty[nei]!=0 :self.reachabilty[nei] = self.reachabilty[nei] - 1 
                        except :
                            continue

    def readapt_wavefront_weights(self, matrix):

        rows, cols = matrix.shape
        inf_pos = self.get_value_positions(matrix, np.inf)

        for i in range(rows):

            for j in range(cols):
                if (i == 0 or j == 0):
                    matrix[(i,j)]= matrix[(i,j)]+ 3
                    if ((i == 0 and (j == 0 or j == cols-1)) or (i == rows-1 and (j == 0 or j == cols-1))):
                        matrix[(i,j)]= matrix[(i,j)]+ 2

                neighbors = self.neighborhood((i,j), matrix, type='octa')
                matrix[(i,j)]= matrix[(i,j)]+ sum(1 for item in neighbors if item in inf_pos)

        return matrix

    def sweep(self, start_point = None):
        # Determine the size of the matrix
        attractivity_matrix = self.cost_matrix
        reachability_matrix = self.reachabilty
        n = len(attractivity_matrix)

        visited = [[False] * n for _ in range(n)]
        visit_sequence = []

        directions = [(0, 1), (1, 0), (0, -1), (-1, 0)]

        def get_sorted_neighbors(x, y):
            neighbors = []
            for dx, dy in directions:
                nx, ny = x + dx, y + dy
                if 0 <= nx < n and 0 <= ny < n and not visited[nx][ny]:
                    neighbors.append(((nx, ny), attractivity_matrix[nx][ny], reachability_matrix[nx][ny]))
            neighbors.sort(key=lambda neighbor: (neighbor[1], neighbor[2]), reverse=True)
            return neighbors

        max_attractivity = -1
        if start_point == None : 
            for i in range(n):
                for j in range(n):
                    if attractivity_matrix[i][j] > max_attractivity:
                        max_attractivity = attractivity_matrix[i][j]
                        start_point = (i, j)

        def find_next_free_neighbor(current_x, current_y):
            for dx, dy in directions:
                nx, ny = current_x + dx, current_y + dy
                if 0 <= nx < n and 0 <= ny < n and not visited[nx][ny] and attractivity_matrix[nx][ny] != np.inf:
                    return (nx, ny)
            return None

        current_x, current_y = start_point
        while True:
            visited[current_x][current_y] = True
            visit_sequence.append((current_x, current_y))

            sorted_neighbors = get_sorted_neighbors(current_x, current_y)

            next_valid_neighbor = None
            for neighbor, _, _ in sorted_neighbors:
                nx, ny = neighbor
                if not visited[nx][ny]:
                    next_valid_neighbor = neighbor
                    break

            if next_valid_neighbor is None:
                next_valid_neighbor = find_next_free_neighbor(current_x, current_y)

            if next_valid_neighbor is None:
                break

            current_x, current_y = next_valid_neighbor

        return visit_sequence
        

    def sweeping(self, start):
        cost_matrix = self.cost_matrix
        reachable_neighbors = self.reachabilty
        rows, cols = cost_matrix.shape
        current = start
        end =False
        visit_matrix = np.full((rows, cols), 0)
        inf_pos = self.get_value_positions(cost_matrix, np.inf)
        visit_matrix[start] = 1
        for pos in inf_pos :
            visit_matrix[pos]= 1
        sequence = []
        sequence.append(start)
        traceback = []
        sequence.append(start)
        excluded_neigbors = []
        visited = []
        cost = 0
        stack = [current]
        backtrack = False
        while(not end):
            if not backtrack:
                current = stack[-1]
            neighbors = self.neighborhood(current, cost_matrix, excluded=excluded_neigbors)
            next_max_pos = self.find_max_position(cost_matrix, neighbors)
            if(next_max_pos== None) :
                if (np.all(visit_matrix==1)):
                    print(bcolors.OKGREEN +'All the point have been visited : Path planning complete'+ bcolors.ENDC)
                    end = True
                else:
                    print(bcolors.WARNING + 'In a dead-end point ...correcting situation' + bcolors.ENDC)
                    if len(sequence) == 1:
                        break  # No more backtracking possible, all points visited or blocked
                    backtrack = True
                    try :
                        stack.pop()
                        if stack : current = stack[-1]
                    except Exception as e:
                        print(bcolors.FAIL +'Please check the starting point seems to be not a valid one'+ bcolors.ENDC)
                        break


                
                
            if (next_max_pos and visit_matrix[next_max_pos] == 0):
                visit_matrix[next_max_pos] = 1
                visited.append(next_max_pos)
                sequence.append(next_max_pos)
                stack.append(next_max_pos)
                backtrack = False
                #input()
                traceback.append(next_max_pos)
                cost = cost + self.calculate_distance(current, next_max_pos)
                current = next_max_pos
                excluded_neigbors = []

                for nei in self.neighborhood(next_max_pos, cost_matrix, type='octa') :
                    reachable_neighbors[nei]= reachable_neighbors[nei]-1
                    if reachable_neighbors[nei] <3 :
                        cost_matrix[nei] = cost_matrix[nei] + 1
            else :
                excluded_neigbors.append(next_max_pos)
        
        return sequence, cost

    def deblock(self, visit_matrix):

        pos = self.get_value_positions(visit_matrix, 0)
    def find_value_positions(matrix, value):
        result = np.where(matrix == value)
        positions = list(zip(result[0], result[1]))
        return positions

    def calculate_distance(self, point1, point2):

        return np.sqrt(np.power(point2[0]-point1[0],2)+np.power(point2[1]-point1[1],2))

    def find_max_position(self, matrix, positions):
    
        max_value = -np.inf
        max_position = None
            
        for pos in positions:
                if (matrix[pos] > max_value and matrix[pos]!= np.inf):
                    max_value = matrix[pos]
                    max_position = pos
        
        return max_position

    def find_leatest_reachability(matrix, positions):
    
        leatest_value = np.inf
        leatest_position = None
            
        for pos in positions:
                if (matrix[pos] < leatest_value):
                    leatest_value = matrix[pos]
                    leatest_position = pos
        if leatest_value > 2 :
            return None
        return leatest_position

    def get_value_positions(self, matrix, value):

        rows, cols = matrix.shape
        max_value = -np.inf
        max_positions = []
        row_indices, col_indices = np.indices((rows, cols))
        positions = list(zip(row_indices.flatten(), col_indices.flatten()))
            
        for pos in positions:
            try :
                if (matrix[pos] == value ):
                    max_positions.append(pos) 
            except :
                continue

    
        
        return max_positions

    def plot_grid_with_connections(self, matrix, positions):

        fig, ax = plt.subplots(figsize=(8, 8))
        
        cax = ax.matshow(matrix, cmap='viridis')
        
        for i in range(matrix.shape[0]):
            for j in range(matrix.shape[1]):
                ax.text(j, i, str(matrix[i, j]), va='center', ha='center', color='white', fontsize=12)
        
        x_coords = [pos[1] for pos in positions]
        y_coords = [pos[0] for pos in positions]
        
        ax.plot(x_coords, y_coords, marker='o', color='red', linewidth=2, markersize=8)
        
        ax.set_xticks(np.arange(-0.5, matrix.shape[1], 1), minor=True)
        ax.set_yticks(np.arange(-0.5, matrix.shape[0], 1), minor=True)
        ax.grid(which='minor', color='white', linestyle='-', linewidth=2)
        
        ax.set_xticks(np.arange(matrix.shape[1]))
        ax.set_yticks(np.arange(matrix.shape[0]))
        ax.set_xticklabels(np.arange(1, matrix.shape[1] + 1))
        ax.set_yticklabels(np.arange(1, matrix.shape[0] + 1))
    
        
        plt.tight_layout()
        
        #plt.show()

    def create_trajectory_for_plot(self, sequence):
        i=0
        trajectory = []
        while (i < len(sequence)-1):
            step = [None,sequence[i][0], sequence[i][1], None, None]

            if sequence[i][0]== sequence[i+1][0]-1:
                step[3]=2
            if sequence[i][0]== sequence[i+1][0]+1:
                step[3]=0
            if sequence[i][1]== sequence[i+1][1]-1:
                step[3]=3
            if sequence[i][1]== sequence[i+1][1]:
                step[3]=1
            trajectory.append(step)
            i = i+1
        return trajectory
    
    def calculate_cost(self, sequence):
        i = 0
        cost = 0
        while (i< len(sequence)-1) :

            cost = cost +self.calculate_distance(sequence[i], sequence[i+1])
            i= i +1
        return cost



def main(source, file_path = None, request_data = None):
    if source == 'file':
        if file_path is None:
            raise ValueError("File path must be provided when source is 'file'.")
        data = json_to_numpy.load_data_from_file(file_path)
    elif source == 'request':
        if request_data is None:
            raise ValueError("Data must be provided when source is 'request'.")
        data = request_data
    else:
        raise ValueError("Invalid source. Please specify either 'request' or 'file'.")


    """ Generate mission"""
    mission = Mission(data)
    """ Generate image map and numpy format for state of art algoriths"""
    mission.map_generator.save_as_image('binary_map')
    mission.map_generator.save_as_npy('map0')
    """ Read binary image """
    image = cv2.imread('~/drone-aquatique/ceri-sn_imt_m-planner/python/coverage_path_planning/map/binary_map.png', cv2.IMREAD_GRAYSCALE)
    _, binary_image = cv2.threshold(image, 127, 255, cv2.THRESH_BINARY)


    """ Linear WaveFront Algorithm """
    PT1 = PT_Planner(mission.map_matrix)
    PT1.wavefront_algorithm(mission.map_matrix, mission.starting_point)
    PT1.add_obstacles_from_map(mission.map_generator)
    PT1.calculate_reachability()
    linear_wafront_obstacle_adapted_matrix = PT1.readapt_wavefront_weights(PT1.cost_matrix)
    save_reachability = copy.deepcopy(PT1.reachabilty)
    save_visited = copy.deepcopy(PT1.visited)
    save_cost = copy.deepcopy(PT1.cost_matrix)
    linear_wavefront_sequence, linear_wavefront_cost = PT1.sweeping(mission.starting_point)
    PT1.plot_grid_with_connections(PT1.cost_matrix, linear_wavefront_sequence)

    """ Circular WaveFront Algorithm  """
    PT2 = PT_Planner(mission.map_matrix)
    PT2.wavefront_algorithm(mission.map_matrix, (int(mission.map_matrix.shape[0]/2),int(mission.map_matrix.shape[1]/2)))
    PT2.add_obstacles_from_map(mission.map_generator)
    centr_wave_obs_readapted = PT2.readapt_wavefront_weights(PT2.cost_matrix)
    circular_wafront_obstacle_adapted_matrix = PT2.readapt_wavefront_weights(PT1.cost_matrix)
    circular_wavefront_sequence, circular_wavefront_cost = PT2.sweeping(mission.starting_point)
    PT2.plot_grid_with_connections(PT2.cost_matrix, circular_wavefront_sequence)

    """ State of Art Algorithm"""
    stateOfArt_sequence = coverage_test.main()

    """ VAR Algorithm"""
    weighted_sequence = weighted_strategy.weighted_cost(save_cost, save_reachability, save_visited, mission.starting_point)

    print("Map Scenario:\n", mission.map_matrix)
    print("Linear Reachability matrix : \n", PT1.reachabilty)
    print("Circular Reachability matrix : \n", PT2.reachabilty)


    """ Drawing paths in output images folder """
    mission.map_generator.draw_grid_with_path_and_arrows_and_squares(mission.map_matrix.shape, linear_wavefront_sequence, 'linear_wavefront_path')
    mission.map_generator.draw_grid_with_path_and_arrows_and_squares(mission.map_matrix.shape, circular_wavefront_sequence, 'circular_wavefront_path')

    """ Calculating costs"""
    path_ids = mission.id_sequence(stateOfArt_sequence)
    linear_wavefront_cost = PT1.calculate_cost(linear_wavefront_sequence)
    circular_wavefront_cost = PT1.calculate_cost(circular_wavefront_sequence)
    weighted_wavefront_cost = PT1.calculate_cost(circular_wavefront_sequence)
    SOA_cost = PT1.calculate_cost(stateOfArt_sequence)
    print('linear - circular - weighted - SOA distance costs :' + str(linear_wavefront_cost)+ ' - '+ str(circular_wavefront_cost)+ ' - '+ str(weighted_wavefront_cost)+ ' - '+ str(SOA_cost))



    return path_ids


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Process some data.")
    parser.add_argument("--source", choices=['request', 'file'], required=True,
                        help="Specify the data source: 'request' to use request.json, 'file' to use a JSON file.")
    parser.add_argument("--file", type=str,
                        help="The path to the JSON file. Required if source is 'file'.")

    args = parser.parse_args()

    main(args.source, file_path=args.file)