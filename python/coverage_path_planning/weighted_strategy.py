import numpy as np
from scipy.ndimage import distance_transform_edt
import shutil
from  PT_planner import *
A = np.array([
 [24, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 24],
 [22, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18],
 [22, 18, 17, 17, 17, 17, 17, 17, 17, 17, 17, 17, 17, 17, 17, 17, 17, 17, 17, 17],
 [22, 18, 17, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16],
 [22, 18, 17, 16, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15],
 [22, 18, 17, 16, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14],
 [22, 18, 17, 16, 15, 14, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13],
 [22, 18, 17, 17, 16, 15, 13, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12],
 [23, np.inf, np.inf, np.inf, np.inf, 15, 13, 12, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11,  11, 11],
 [23, np.inf, 18, 17, 16, 15, 13, 12, 11, 10, 10, 10, 10, 10, 10, 10, 10, 10,  10, 10],
 [23, 19, 18, 16, 15, 14, 13, 12, 11, 10,  9,  9,  9,  9,  9,  9,  9,  9,  9,  9],
 [22, 18, 17, 16, 15, 14, 13, 13, 12, 11,  9,  9,  9,  9,  9,  9,  9,  8,  8,  8],
 [22, 18, 17, 16, 15, 14, 13, 13, np.inf, np.inf,  np.inf,  np.inf, np.inf,  8,  8, np.inf,  8,  7, 7,  7],
 [22, 18, 17, 16, 15, 14, 13, 13, 12, 11,  9,  9,  8,  7,  7,  7,  7,  6, 6,  6],
 [22, 18, 17, 16, 15, 14, 13, 12, 11, 10,  9,  8,  7,  6,  5,  5,  5,  5, 5,  5],
 [22, 18, 17, 16, 15, 14, 13, 12, 11, 10,  9,  8,  7,  6,  5,  4,  4,  4, 4,  4],
 [22, 18, 17, 16, 15, 14, 13, 12, 11, 10,  9,  9,  8,  7,  5,  4,  3,  3, 3,  3],
 [22, 18, 17, 16, 15, 15, 14, 13, 11, 10,  9,  9, np.inf, 7,  5,  4,  3, 2, 2,  2],
 [22, 18, 17, 16, 15, 15, np.inf, np.inf, np.inf, 10,  9,  9,  8,  7,  5,  4,  3,  2, 1,  1],
 [24, 18, 17, 16, 15, 15, 14, 13, 11, 10,  9,  8,  7,  6,  5,  4,  3,  2, 1,  0]])  
R = np.array(
[[3, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 3],
 [5, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 5],
 [5, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 5],
 [5, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 5],
 [5, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 5],
 [5, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 5],
 [5, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 5],
 [4, 8, 8, 7, 7, 7, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 5],
 [3, 0, 0, 0, 0, 7, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 5],
 [3, 0, 7, 7, 7, 7, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 5],
 [4, 7, 7, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 5],
 [5, 8, 8, 8, 8, 8, 8, 7, 6, 5, 5, 5, 6, 7, 7, 7, 7, 8, 8, 5],
 [5, 8, 8, 8, 8, 8, 8, 7, 0, 0, 0, 0, 0, 7, 7, 0, 7, 8, 8, 5],
 [5, 8, 8, 8, 8, 8, 8, 7, 7, 7, 8, 7, 7, 7, 7, 7, 7, 8, 8, 5],
 [5, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 5],
 [5, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 5],
 [5, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 7, 7, 7, 8, 8, 8, 8, 8, 5],
 [5, 8, 8, 8, 8, 7, 6, 5, 6, 7, 8, 7, 0, 7, 8, 8, 8, 8, 8, 5],
 [5, 8, 8, 8, 8, 7, 0, 0, 0, 7, 8, 7, 7, 7, 8, 8, 8, 8, 8, 5],
 [3, 5, 5, 5, 5, 4, 3, 2, 3, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 3]])  # Matrice de reachability (0 indique un obstacle)
V = np.array([[0, 0, 0,0, 0, 0,0, 0, 0,0, 0, 0,0, 0, 0,0, 0, 0,0, 0],
              [0, 0, 0,0, 0, 0,0, 0, 0,0, 0, 0,0, 0, 0,0, 0, 0,0, 0],
            [0, 0, 0,0, 0, 0,0, 0, 0,0, 0, 0,0, 0, 0,0, 0, 0,0, 0],
            [0, 0, 0,0, 0, 0,0, 0, 0,0, 0, 0,0, 0, 0,0, 0, 0,0, 0],
            [0, 0, 0,0, 0, 0,0, 0, 0,0, 0, 0,0, 0, 0,0, 0, 0,0, 0],
            [0, 0, 0,0, 0, 0,0, 0, 0,0, 0, 0,0, 0, 0,0, 0, 0,0, 0],
            [0, 0, 0,0, 0, 0,0, 0, 0,0, 0, 0,0, 0, 0,0, 0, 0,0, 0],
            [0, 0, 0,0, 0, 0,0, 0, 0,0, 0, 0,0, 0, 0,0, 0, 0,0, 0],
            [0, 0, 0,0, 0, 0,0, 0, 0,0, 0, 0,0, 0, 0,0, 0, 0,0, 0],
            [0, 0, 0,0, 0, 0,0, 0, 0,0, 0, 0,0, 0, 0,0, 0, 0,0, 0],
            [0, 0, 0,0, 0, 0,0, 0, 0,0, 0, 0,0, 0, 0,0, 0, 0,0, 0],
            [0, 0, 0,0, 0, 0,0, 0, 0,0, 0, 0,0, 0, 0,0, 0, 0,0, 0],
            [0, 0, 0,0, 0, 0,0, 0, 0,0, 0, 0,0, 0, 0,0, 0, 0,0, 0],
            [0, 0, 0,0, 0, 0,0, 0, 0,0, 0, 0,0, 0, 0,0, 0, 0,0, 0],
            [0, 0, 0,0, 0, 0,0, 0, 0,0, 0, 0,0, 0, 0,0, 0, 0,0, 0],
            [0, 0, 0,0, 0, 0,0, 0, 0,0, 0, 0,0, 0, 0,0, 0, 0,0, 0],
            [0, 0, 0,0, 0, 0,0, 0, 0,0, 0, 0,0, 0, 0,0, 0, 0,0, 0],
            [0, 0, 0,0, 0, 0,0, 0, 0,0, 0, 0,0, 0, 0,0, 0, 0,0, 0],
            [0, 0, 0,0, 0, 0,0, 0, 0,0, 0, 0,0, 0, 0,0, 0, 0,0, 0],
              [0, 0, 0,0, 0, 0,0, 0, 0,0, 0, 0,0, 0, 0,0, 0, 0,0, 0]])                   

def weighted_cost(A, R, V, start):
    alpha = .8 #R
    beta = .3 # proxy
    gamma = 5 #A
    delta = .1  # visite
    high_cost = 1e6

    A_max = np.max(A)
    R_max = np.max(R[R > 0])  


    A_norm = 1 - A / A_max
    R_norm = R / R_max  

    obstacles = (R == 0)
    distances = distance_transform_edt(~obstacles)
    proximity_influence = np.exp(-distances)
    proximity_norm = 1 - proximity_influence

    C = (alpha * R_norm + 
        beta * proximity_norm + 
        gamma * A_norm + 
        delta * V)


    C[obstacles] = high_cost
    np.set_printoptions(suppress=True)
    print("Matrice de coût ajustée:")
    def print_matrix(matrix):
        term_width = shutil.get_terminal_size().columns
        row_format = "{:>10.2f}" * matrix.shape[1]
        for row in matrix:
            row_str = row_format.format(*row)
            for i in range(0, len(row_str), term_width):
                print(row_str[i:i+term_width])
    print_matrix(C)

    def find_sequence(R, C, V, start):
        sequence = []
        V = np.zeros_like(R, dtype=bool)
        current = start
        sequence.append(current)
        V[current] = 1
        stack = [current]
        backtrack = False
        
        while stack:
            if not backtrack:
                current = stack[-1]
            
            i, j = current
            neighbors = [(i-1, j), (i+1, j), (i, j-1), (i, j+1)]
            valid_neighbors = [p for p in neighbors if 0 <= p[0] < R.shape[0] and 0 <= p[1] < R.shape[1]]
            valid_neighbors = [p for p in valid_neighbors if not V[p] and not obstacles[p]]
            
            if valid_neighbors:
                next_point = min(valid_neighbors, key=lambda p: C[p])
                
                for neighbor in neighbors:
                    if 0 <= neighbor[0] < R.shape[0] and 0 <= neighbor[1] < R.shape[1]:
                        R[neighbor] -= 1
                
                R_norm = R / R_max
                C = (alpha * R_norm + 
                    beta * proximity_norm + 
                    gamma * A_norm + 
                    delta * V)
                C[obstacles] = high_cost
                
                sequence.append(next_point)
                V[next_point] = 1
                stack.append(next_point)
                backtrack = False
            else:
                if len(sequence) == 1:
                    break  
                backtrack = True
                stack.pop()
                if stack : current = stack[-1]
        
        return sequence, R, C

    sequence, updated_R, updated_C = find_sequence(R.copy(), C.copy(), V.copy(), start)

    return sequence

"""
    print("Sequence of V points:")
    print(sequence)
    print(len(sequence))
    mapGen = Maps_genetor()
    PT1 = PT_Planner(mapGen.map)
    print(PT1.calculate_cost(sequence))
    PT1.plot_grid_with_connections(updated_R, sequence) """
