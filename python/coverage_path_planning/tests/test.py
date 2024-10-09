import matplotlib.pyplot as plt
import numpy as np
from matplotlib.patches import FancyArrowPatch, Rectangle

def draw_grid_with_path_and_arrows_and_squares(grid_size, path, black_squares):
    fig, ax = plt.subplots()

    ax.set_xticks(np.arange(0, grid_size[0] + 1, 1))
    ax.set_yticks(np.arange(0, grid_size[1] + 1, 1))
    ax.grid(which='both')

    ax.set_xlim(-1, grid_size[0] + 1)
    ax.set_ylim(-1, grid_size[1] + 1)

    ax.set_aspect('equal')
    ax.invert_yaxis()

    for (x, y) in black_squares:
        square = Rectangle((x - 0.5, y - 0.5), 1, 1, color='black')
        ax.add_patch(square)

    for (x0, y0), (x1, y1) in zip(path[:-1], path[1:]):
        arrow = FancyArrowPatch(
            (x0, y0), (x1, y1),
            arrowstyle='->', color='red',
            mutation_scale=15, linewidth=2
        )
        ax.add_patch(arrow)

    path_x, path_y = zip(*path)
    ax.plot(path_x, path_y, marker='o', color='blue', linestyle='-', linewidth=2, markersize=8)

    ax.set_xlabel('X-axis')
    ax.set_ylabel('Y-axis')
    ax.set_title('Grid with Path, Arrows, and Black Squares')

    plt.show()


import json
with open('../json/missionPoints.json', 'r') as file:
                print(json.load(file))