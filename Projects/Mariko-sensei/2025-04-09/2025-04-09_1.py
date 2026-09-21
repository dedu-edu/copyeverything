"""
 Pygame base template for opening a window

 Sample Python/Pygame Programs
 Simpson College Computer Science
 http://programarcadegames.com/
 http://simpson.edu/computer-science/

 Explanation video: http://youtu.be/vRB_983kUMc
"""

import pygame
import random

# Define some colors
BLACK = (0, 0, 0)
WHITE = (255, 255, 255)
GREEN = (0, 255, 0)
RED = (255, 0, 0)

pygame.init()
width = 700
height = 500
radius = 30
# Set the width and height of the screen [width, height]
size = (width, height)
screen = pygame.display.set_mode(size)

pygame.display.set_caption("My Game")

# Loop until the user clicks the close button.
done = False
# Used to manage how fast the screen updates
clock = pygame.time.Clock()
bg_img = pygame.image.load("shutis.jpg").convert()
bg_img = pygame.transform.scale(bg_img, (width, height))
def background_image():
    screen.blit(bg_img, (0,0))
r = 0
g = 0
b = 0
RANDOM_COLOR = (r,g,b)
popping = False
delay = pygame.time.get_ticks()
current_delay = pygame.time.get_ticks()
score = 0
font = pygame.font.SysFont("Canterbury Regular", 20)

subjects = ["math",'biology', 'physics', 'Mongolian scripture',
            'informatics', 'PE', 'geometry', 'civil ethics',
            'arts & crafts', 'health', 'electronics', "mongolian language"
            'literature', 'chemistry', 'geography']

def random_color():
    global RANDOM_COLOR
    r = random.randint(0, 255)
    g = random.randint(0, 255)
    b = random.randint(0, 255)
    RANDOM_COLOR = (r,g,b)
    return RANDOM_COLOR

#balloon
balloon = []
quantity = 15
for i in range(quantity):
    x = random.randrange(0, width,radius)
    y = random.randrange(-500, 0,80)
    balloon.append([x, y])

colors = []
for i in range(quantity):
    r = random.randint(0,255)
    g = random.randint(0,255)
    b = random.randint(0,255)
    colors.append([r,g,b])

# -------- Main Program Loop -----------
while not done:
    # --- Main event loop
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            done = True
    pos = pygame.mouse.get_pos()
    x = pos[0]
    y = pos[1]


    # --- Game logic should go here

    # --- Screen-clearing code goes here

    # Here, we clear the screen to white. Don't put other drawing commands
    # above this, or they will be erased with this command.

    # If you want a background image, replace this clear with blit'ing the
    # background image.
    screen.fill(WHITE)
    background_image()

    for i in range(len(balloon)-1):
        pygame.draw.line(screen, WHITE, balloon[i], (balloon[i][0], balloon[i][1] + 70), 3)
        pygame.draw.circle(screen, colors[i], balloon[i], radius)
        subject_text = font.render(subjects[i], True, BLACK)
        screen.blit(subject_text, (balloon[i][0]-15, balloon[i][1]-5))

        balloon[i][1] += 1

        if balloon[i][1] > height:
            # Reset it just above the top
            y = random.randrange(-500, -10, 80)
            balloon[i][1] = y
            # Give it a new x position
            x = random.randrange(0, width,radius)
            balloon[i][0] = x
            colors[i][0] = random.randint(0,255)

            colors[i][1]= random.randint(0,255)
            colors[i][2] = random.randint(0,255)

        if balloon[i][0] < x < balloon[i][0] + radius and balloon[i][1] < y < balloon[i][1] + radius and pygame.mouse.get_pressed()[0]:
            y = random.randrange(-500, -10,80)
            balloon[i][1] = y
            x = random.randrange(0, width,radius)
            balloon[i][0] = x
            popping = False
            colors[i][0] = random.randint(0, 255)
            colors[i][1] = random.randint(0, 255)
            colors[i][2] = random.randint(0, 255)
            score += 1

    score_show = font.render(f"Score: {score}", True, BLACK)
    screen.blit(score_show, (10, 10))
    # --- Drawing code should go here

    # --- Go ahead and update the screen with what we've drawn.
    pygame.display.flip()

    # --- Limit to 60 frames per second
    clock.tick(60)

# Close the window and quit.
pygame.quit()