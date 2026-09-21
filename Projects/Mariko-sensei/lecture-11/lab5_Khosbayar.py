# -*- coding: utf-8 -*-
"""
Created on Mon Dec  9 15:23:50 2024

@author: marikotagawa
"""

# Import a library of functions called 'pygame'
import pygame
import random
 
# Initialize the game engine
pygame.init()
bucket = pygame.image.load('bucket.png')
width = bucket.get_width()
height = bucket.get_height()
bucket = pygame.transform.rotate(bucket, (180))

BLACK = [0, 0, 0]
WHITE = [255, 255, 255]
 
# Set the height and width of the screen
SIZE = [700, 700]
 
screen = pygame.display.set_mode(SIZE)
pygame.display.set_caption("Snow Animation")
 
# Create an empty array
snow_list = []
 
# Loop 50 times and add a snow flake in a random x,y position
for i in range(500):
    x = random.randrange(0, 700)
    y = random.randrange(0, 700)
    snow_list.append([x, y])
 
clock = pygame.time.Clock()
 
# Loop until the user clicks the close button.
done = False
while not done:
 
    for event in pygame.event.get():   # User did something
        if event.type == pygame.QUIT:  # If user clicked close
            done = True   # Flag that we are done so we exit this loop
 
    # Set the screen background
    screen.fill(BLACK)
    bucket = pygame.transform.scale(bucket, (140, 200))
    pygame.draw.circle(screen, WHITE, (350, 330), 70)
    pygame.draw.circle(screen, WHITE, (350, 550), 150)
    pygame.draw.circle(screen, BLACK, (320, 320), 10)
    pygame.draw.circle(screen, BLACK, (380, 320), 10)
    pygame.draw.circle(screen, BLACK, (350, 550), 10)
    pygame.draw.circle(screen, BLACK, (350, 510), 10)
    pygame.draw.circle(screen, BLACK, (350, 590), 10)
    screen.blit(bucket, (280, 150))
 
    # Process each snow flake in the list
    for i in range(len(snow_list)):
 
        # Draw the snow flake
        pygame.draw.circle(screen, WHITE, snow_list[i], 2)
 
        # Move the snow flake down one pixel
        snow_list[i][1] += 1
 
        # If the snow flake has moved off the bottom of the screen
        if snow_list[i][1] > 700:
            # Reset it just above the top
            y = random.randrange(-50, -10)
            snow_list[i][1] = y
            # Give it a new x position
            x = random.randrange(0, 700)
            snow_list[i][0] = x
 
    # Go ahead and update the screen with what we've drawn.
    pygame.display.flip()
    clock.tick(20)
 
# Be IDLE friendly. If you forget this line, the program will 'hang'
# on exit.
pygame.quit()