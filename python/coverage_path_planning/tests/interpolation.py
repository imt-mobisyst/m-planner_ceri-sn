#'/home/root2024/drone-aquatique/ceri-sn_imt_m-planner/python/coverage_path_planning/map/stateOA.png'


import cv2
import numpy as np


from heapq import heappop, heappush
import math


# Load the binary image in grayscale
image = cv2.imread('/home/root2024/drone-aquatique/ceri-sn_imt_m-planner/python/coverage_path_planning/map/stateOA.png', cv2.IMREAD_GRAYSCALE)
"""
# Ensure the image is strictly binary (0 and 255)
_, binary_image = cv2.threshold(image, 127, 255, cv2.THRESH_BINARY)

# Point de départ initial (un point blanc)
start_point = None
for i in range(binary_image.shape[0]):
    for j in range(binary_image.shape[1]):
        if binary_image[i, j] == 255:
            start_point = (i, j)
            break
    if start_point:
        break

# Directions possibles pour les déplacements (8 directions)
directions = [(-1, 0), (1, 0), (0, -1), (0, 1), (-1, -1), (-1, 1), (1, -1), (1, 1)]

def heuristic(current, neighbor, prev_direction):
    #Fonction heuristique pour minimiser les distances et les rotations.
    # Distance Euclidienne comme base pour minimiser la distance
    distance = math.sqrt((current[0] - neighbor[0]) ** 2 + (current[1] - neighbor[1]) ** 2)

    # Calculer la direction actuelle
    current_direction = (neighbor[0] - current[0], neighbor[1] - current[1])

    # Calculer l'angle entre la direction précédente et la direction actuelle
    if prev_direction is None:
        rotation_penalty = 0  # Pas de pénalité pour le premier mouvement
    else:
        cos_angle = (prev_direction[0] * current_direction[0] + prev_direction[1] * current_direction[1]) / (
                    math.sqrt(prev_direction[0]**2 + prev_direction[1]**2) *
                    math.sqrt(current_direction[0]**2 + current_direction[1]**2))
        rotation_penalty = math.acos(max(min(cos_angle, 1), -1))  # Limite cos_angle entre -1 et 1 pour éviter les erreurs numériques

    # Pénaliser les rotations pour maximiser les lignes droites
    return distance + rotation_penalty

def find_path(image, start):
    #Trouve le chemin pour parcourir tous les points blancs en minimisant les rotations et distances.
    rows, cols = image.shape
    visited = set()
    path = []
    priority_queue = [(0, start, None, [])]  # (coût, position, direction précédente, chemin jusqu'ici)

    while priority_queue:
        cost, current, prev_direction, current_path = heappop(priority_queue)
        if current in visited:
            continue

        visited.add(current)
        path.append(current)

        # Ajoute le pixel au chemin
        current_path.append(current)

        # Vérifie si tous les pixels blancs sont visités
        if len(visited) == np.sum(image == 255):
            return current_path

        for direction in directions:
            neighbor = (current[0] + direction[0], current[1] + direction[1])
            if 0 <= neighbor[0] < rows and 0 <= neighbor[1] < cols and neighbor not in visited:
                if image[neighbor] == 255:
                    new_cost = cost + heuristic(current, neighbor, prev_direction)
                    heappush(priority_queue, (new_cost, neighbor, direction, current_path.copy()))

    return path

# Trouver le chemin optimisé
optimized_path = find_path(binary_image, start_point)

# Affichage du chemin sur l'image
# output_image = cv2.cvtColor(binary_image, cv2.COLOR_GRAY2BGR)
# for point in optimized_path:
#     output_image[point] = (0, 0, 255)  # Marquer le chemin en rouge

# Sauvegarder et afficher l'image avec le chemin tracé
# cv2.imwrite('optimized_path.png', output_image)
# cv2.imshow('Optimized Path', output_image)
# cv2.waitKey(0)
# cv2.destroyAllWindows()

print(optimized_path)







# Find contours of the white regions
contours, _ = cv2.findContours(binary_image, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

# Find the largest contour (assuming it's the main region of interest)
largest_contour = max(contours, key=cv2.contourArea)

# Get the bounding box of the largest contour
x, y, w, h = cv2.boundingRect(largest_contour)

# Calculate the aspect ratio
aspect_ratio = w / h

# Decide whether to shift rows or columns based on the aspect ratio
if aspect_ratio > 1:
    # Shift columns if the aspect ratio indicates a wider shape
    shift_direction = 'columns'
else:
    # Shift rows if the aspect ratio indicates a taller shape
    shift_direction = 'rows'

def detect_shift_amounts(binary_image, shift_direction):
    #Detect rows or columns to be shifted and the amount of shift for each
    shifts = []

    # Analyze based on the direction
    if shift_direction == 'rows':
        # Analyze each row
        for row in range(binary_image.shape[0]):
            white_pixel_indices = np.where(binary_image[row, :] == 255)[0]
            if len(white_pixel_indices) > 0:
                # Calculate shift amount based on the median position
                median_position = int(np.median(white_pixel_indices))
                target_position = binary_image.shape[1] // 2
                shift_amount = target_position - median_position
                shifts.append((row, shift_amount))
    elif shift_direction == 'columns':
        # Analyze each column
        for col in range(binary_image.shape[1]):
            white_pixel_indices = np.where(binary_image[:, col] == 255)[0]
            if len(white_pixel_indices) > 0:
                # Calculate shift amount based on the median position
                median_position = int(np.median(white_pixel_indices))
                target_position = binary_image.shape[0] // 2
                shift_amount = target_position - median_position
                shifts.append((col, shift_amount))

    return shifts

def apply_shifts(binary_image, shifts, shift_direction):
    #Apply shifts to rows or columns based on detected shifts
    shifted_image = binary_image.copy()

    if shift_direction == 'rows':
        for row, shift_amount in shifts:
            shifted_image[row, :] = np.roll(shifted_image[row, :], shift_amount)
    elif shift_direction == 'columns':
        for col, shift_amount in shifts:
            shifted_image[:, col] = np.roll(shifted_image[:, col], shift_amount)

    return shifted_image

# Detect shifts for rows or columns
shifts = detect_shift_amounts(binary_image, shift_direction)

# Apply the detected shifts to the image
shifted_image = apply_shifts(binary_image, shifts, shift_direction)

# Save and display the transformed image
cv2.imwrite('transformed_image.png', shifted_image)
cv2.imshow('Transformed Image', shifted_image)
cv2.waitKey(0)
cv2.destroyAllWindows()"""
#-----------------------------------------------------------------------------------------------------------------------------------------------------------
"""
import numpy as np
import matplotlib.pyplot as plt
from PIL import Image

# Load the image and convert it to grayscale
image_path = '/home/root2024/drone-aquatique/ceri-sn_imt_m-planner/python/coverage_path_planning/map/stateOA.png'  # Change this to your image path
img = Image.open(image_path).convert('L')  # Convert to grayscale
img = img.resize((20, 20), Image.NEAREST)  # Resize for easy manipulation
img_array = np.array(img)

# Get image dimensions
height, width = img_array.shape

# Display the image
fig, ax = plt.subplots(figsize=(8, 8))
ax.imshow(img_array, cmap='gray', interpolation='nearest')

# Set up the grid and ticks to match the pixel centers
ax.set_xticks(np.arange(0.5, width, 1))
ax.set_yticks(np.arange(0.5, height, 1))
ax.grid(which='both', color='black', linestyle='-', linewidth=0.5)
ax.set_xticklabels([])
ax.set_yticklabels([])

# Ensure the aspect ratio is equal
ax.set_aspect('equal')

# Function to draw a line between selected points
lines = []

def on_click(event):
    if event.inaxes != ax:
        return

    # Calculate the center of the clicked pixel
    x = int(event.xdata+0.5)
    y = int(event.ydata+0.5)
    print(event.xdata, event.ydata, x,y)

    x_center = x
    y_center = y

    # Mark the clicked pixel center
    ax.plot(x_center, y_center, 'ro')

    # Save the point
    lines.append((x_center, y_center))

    # If two points are selected, draw a line between them
    if len(lines) == 2:
        x0, y0 = lines[0]
        x1, y1 = lines[1]
        ax.plot([x0, x1], [y0, y1], 'b-', lw=2)  # Draw line between pixel centers
        fig.canvas.draw()
        lines.clear()  # Clear points after drawing

    fig.canvas.draw()

# Connect the click event to the function
cid = fig.canvas.mpl_connect('button_press_event', on_click)

plt.title('Click on pixel centers to draw lines')
plt.show()"""

#------------------------------------------------------------------------------------------------------------------------------------
def grid_coverage(grid, start):
    rows, cols = len(grid), len(grid[0])
    visited = [[False for _ in range(cols)] for _ in range(rows)]
    path = []  # To store the sequence of visited cells

    directions = [(-1, 0), (1, 0), (0, -1), (0, 1), (-1, -1), (1, 1), (1, -1), (-1, 1)]

    def dfs(x, y):
        visited[x][y] = True
        path.append((x, y))

        for dx, dy in directions:
            nx, ny = x + dx, y + dy
            if 0 <= nx < rows and 0 <= ny < cols and not visited[nx][ny] and grid[nx][ny] == 0:
                dfs(nx, ny)

    dfs(start[0], start[1])

    return path

grid = [
    [0, 0, 1, 0],
    [0, 0, 0, 0],
    [1, 1, 0, 1],
    [0, 0, 0, 0]
]

start_position = (0, 0)
coverage_path = grid_coverage(grid, start_position)
print("Coverage Path:", coverage_path)