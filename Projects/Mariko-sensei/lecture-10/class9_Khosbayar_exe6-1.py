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
 
# Set the width and height of the screen [width, height]
size = (700, 500)
screen = pygame.display.set_mode(size)
 
pygame.display.set_caption("My Game")
font = pygame.font.SysFont("Calibri", 30, True)
 
# Loop until the user clicks the close button.
done = False
 
# Used to manage how fast the screen updates
clock = pygame.time.Clock()
#speed of change for the shapes
rect1_x = random.randrange(100,600)
rect1_y = random.randrange(100, 400)
rect2_x = random.randrange(100,600)
rect2_y = random.randrange(100, 400)
rect1_x_change = 5
rect1_y_change = 5
rect2_x_change = 5
rect2_y_change = 5
rect_x_size = 100
rect_y_size = 100
red_score = 0
green_score = 0
# -------- Main Program Loop -----------
while not done:
    # --- Main event loop
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            done = True
 
    # --- Game logic should go here
    if rect1_y > 400 or rect1_y < 0:
        rect1_y_change = rect1_y_change * -1
        green_score += 1
    if rect1_x > 600 or rect1_x < 0:
        rect1_x_change = rect1_x_change * -1
        green_score += 1
    if rect2_y > 400 or rect2_y < 0:
        rect2_y_change = rect2_y_change * -1
        red_score += 1
    if rect2_x > 600 or rect2_x < 0:
        rect2_x_change = rect2_x_change * -1
        red_score += 1

    if (rect1_x < rect2_x + rect_x_size and
    rect1_y < rect2_y + rect_y_size and
    rect2_x < rect1_x + rect_x_size and
    rect2_y < rect1_y + rect_y_size ):
        rect1_x_change = rect1_x_change * -1
        rect1_y_change = rect1_y_change * -1
        rect2_x_change = rect2_x_change * -1
        rect2_y_change = rect2_y_change * -1
        red_score += 1
        green_score += 1
    if red_score == 25:
        text3 = font.render(f"RED WIN ", True, RED)
        screen.blit(text3, (350,350))
        done = True
    elif green_score == 25:
        text4 = font.render(f"GREEN WIN ", True, GREEN)
        screen.blit(text4, (350,350))
        done = True

    # Here, we clear the screen to white. Don't put other drawing commands
    # above this, or they will be erased with this command.

    screen.fill(BLACK)
 
    # If you want a background image, replace this clear with blit'ing the
    # background image.

    # --- Drawing code should go here
    pygame.draw.rect(screen, GREEN, [rect1_x, rect1_y, 100, 100])
    pygame.draw.rect(screen, RED, [rect2_x, rect2_y, 100, 100])
    rect1_x += rect1_x_change
    rect1_y += rect1_y_change
    rect2_x += rect2_x_change
    rect2_y += rect2_y_change
    text1 = font.render(f"Red bounce: {red_score} ", True, RED)
    text2 = font.render(f"Green bounce: {green_score}", True, GREEN)
    screen.blit(text1, [100, 100])
    screen.blit(text2, [300, 100])



    # --- Go ahead and update the screen with what we've drawn.
    pygame.display.flip()
 
    # --- Limit to 60 frames per second
    clock.tick(60)
 
# Close the window and quit.
pygame.quit()