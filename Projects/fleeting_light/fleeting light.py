"""
 Pygame base template for opening a window
 
 Sample Python/Pygame Programs
 Simpson College Computer Science
 http://programarcadegames.com/
 http://simpson.edu/computer-science/
 
 Explanation video: http://youtu.be/vRB_983kUMc
"""
import time
from time import *
import pygame
import random
import threading

#timer of the game:
def timer():
    global my_timer
    my_timer = 100
    for seconds in range(my_timer):
        my_timer -= 1
        sleep(1)
    global done
    done = True
    return done


#threading the timer function to allow it run parallel to game
timer_thread = threading.Thread(target=timer,daemon=True)
timer_thread.start()
 
# Define some colors
BLACK = (0, 0, 0)
WHITE = (255, 255, 255)
GREEN = (0, 255, 0)
RED = (255, 0, 0)
BLUE = (0, 0, 255)
CYAN = (0, 255, 255)
PURPLE = (255, 0, 255)
YELLOW = (255, 255, 0)
 
pygame.init()
 
# Set the width and height of the screen [width, height]
size = (1400, 700)
screen = pygame.display.set_mode(size)
#Setting the font used for the game
font = pygame.font.SysFont('Calibri', 25, True, False)
pygame.display.set_caption("Fleeting Light")
 
# Loop until the user clicks the close button.
done = False
# Used to manage how fast the screen updates
clock = pygame.time.Clock()

#Player stats
health = 25
shield = 0
player_x = 700
player_y = 579
player_x_change = 0
player_y_change = 0
poison = 0
score = 0
speed = 5

#generating the orbs
snow_list = []
fireball_list = []
heal_list = []
shield_list = []
poison_list = []
snow_vertical_list = []
coin_list = []
# Create a surface for trails with per-pixel alpha transparency
trail_surface = pygame.Surface(size, pygame.SRCALPHA)

#snow
for i in range(100):
    x = random.randrange(0, 1400,20)
    y = random.randrange(-300, 100)
    snow_list.append([x, y])
#vertical snow
for q in range(90):
    x = random.randrange(-300, 0,20)
    y = random.randrange(0, 580,35)
    snow_vertical_list.append([x, y])
#fireball
for z in range(20):
    x = random.randrange(0, 1400,20)
    y = random.randrange(-300, 100)
    fireball_list.append([x, y])
#heal
for k in range(10):
    x = random.randrange(0, 1400,20)
    y = random.randrange(-300, 100)
    heal_list.append([x, y])
#shield
for l in range(10):
    x = random.randrange(0, 1400, 20)
    y = random.randrange(-300, 100)
    shield_list.append([x, y])
#poison
for p in range(20):
    x = random.randrange(0, 1400,20)
    y = random.randrange(-300, 100)
    poison_list.append([x, y])
#coins
for t in range(15):
    x = random.randrange(0, 1400,50)
    y = random.randrange(0, 580,50)
    coin_list.append([x, y])
acceleration = 0.2  # How fast the player speeds up
max_speed = 5       # Maximum speed
velocity_x = 0      # Horizontal speed
velocity_y = 0      # Vertical speed

# -------- Main Program Loop -----------
while not done:
    # --- Main event loop
    keys = pygame.key.get_pressed()  # Get currently pressed keys
    #checking if player has poison
    if poison > 0:
        if keys[pygame.K_LEFT]:
            velocity_x -= 0
        if keys[pygame.K_RIGHT]:
            velocity_x += 0
        if keys[pygame.K_UP]:
            velocity_y -= 0
        if keys[pygame.K_DOWN]:
            velocity_y += 0
    else:
        if keys[pygame.K_LEFT]:
            velocity_x -= acceleration
        if keys[pygame.K_RIGHT]:
            velocity_x += acceleration
        if keys[pygame.K_UP]:
            velocity_y -= acceleration
        if keys[pygame.K_DOWN]:
            velocity_y += acceleration

    if health < 1:
        #if so we cut the game and display end screen
        lose_text = font.render("You lost :(", True, WHITE)
        score_text = font.render(f'Your score: {score}', True, WHITE)
        pygame.draw.rect(screen, BLACK, [0, 0, 1400, 700])
        screen.blit(lose_text, (650, 320))
        screen.blit(score_text, (650, 270))
        pygame.display.update()
        #dont know how to add buttons
        #but if i do learn it will go here
        sleep(3)
        done = True
        pygame.quit()

    # Apply friction to smooth movement
    if not keys[pygame.K_LEFT] and not keys[pygame.K_RIGHT]:
        velocity_x = 0
    if not keys[pygame.K_UP] and not keys[pygame.K_DOWN]:
        velocity_y = 0
    # Limit speed
    if velocity_x > max_speed:
        velocity_x = max_speed
    if velocity_x < -max_speed:
        velocity_x = -max_speed
    if velocity_y > max_speed:
        velocity_y = max_speed
    if velocity_y < -max_speed:
        velocity_y = -max_speed

    # Update player position
    player_x += velocity_x
    player_y += velocity_y

    # Keep player inside screen bounds
    player_x = max(0, min(1380, player_x))
    player_y = max(0, min(559, player_y))

    #player input:

    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            done = True

        #checking if any key is pressed
        #player movement:


    #character model movement:

    # Here, we clear the screen to white. Don't put other drawing commands
    # above this, or they will be erased with this command.

    # If you want a background image, replace this clear with blit'ing the
    # background image.
    screen.fill(BLACK)

    # --- Drawing code should go here

    #drawing the bottom line
    pygame.draw.rect(screen, WHITE, [player_x, player_y, 20, 20])
    #drawing the character
    pygame.draw.line(screen, WHITE, [0,580], [1400,580], 5)
    #showing visual if player has poison
    if poison > 0:
        pygame.draw.rect(screen, PURPLE, [player_x, player_y, 20, 20])
    #showing visual if player has shield
    if shield > 0:
        pygame.draw.circle(screen, BLUE, [player_x+10, player_y+10], 17,4,True,True,True,True)

    #snow behaviours:

    for i in range(len(snow_list)):

        # Draw the snowflake
        pygame.draw.circle(screen, WHITE, snow_list[i], 2)

        # Move the snowflake down three pixel
        snow_list[i][1] += 3
        #checking if snowflake has collided with the player
        snow_x = snow_list[i][0]
        snow_y = snow_list[i][1]
        if (player_x < snow_x < player_x + 20) and (player_y < snow_y < player_y + 20):
            # if so we check if there is any active shield
            if shield > 0:
                #if so we subtract one from the current shield
                shield -= 1
                #and then we show visuals of player getting hit
                pygame.draw.circle(screen, CYAN, [player_x + 10, player_y + 10], 17, 4, True, True, True, True)
                #atlast we give snowflake new coords
                snow_list[i][1] = random.randrange(-50, -10)
                snow_list[i][0] = random.randrange(0, 1400, 20)
            elif shield == 0:
                #if not we subtract one from the current health
                health -= 1
                #and then we show visuals of player getting hit
                pygame.draw.rect(screen, RED, [player_x, player_y, 20, 20])
                #atlast we give snowflake new coords
                snow_list[i][1] = random.randrange(-50, -10)
                snow_list[i][0] = random.randrange(0, 1400, 20)
        if snow_list[i][1] > 580:
            # Reset it just above the top
            y = random.randrange(-50, -10)
            snow_list[i][1] = y
            # Give it a new x position
            x = random.randrange(0, 1400,20)
            snow_list[i][0] = x

    #vertical snow behaviours:

    for i in range(len(snow_vertical_list)):

        # Draw the snowflake
        pygame.draw.circle(screen, WHITE, snow_vertical_list[i], 2)

        # Move the snowflake to right by 5 pixel
        snow_vertical_list[i][0] += 5
        #checking if snowflake has collided with player
        snow_vertical_x = snow_vertical_list[i][0]
        snow_vertical_y = snow_vertical_list[i][1]
        if (player_x < snow_vertical_x < player_x + 20) and (player_y < snow_vertical_y < player_y + 20):
            #if so we check if there is any active shield
            if shield > 0:
                #if so we subtract 1 from current shield
                shield -= 1
                #and we show visuals of player getting hit
                pygame.draw.circle(screen, CYAN, [player_x + 10, player_y + 10], 17, 4, True, True, True, True)
                #atlast we give new coords to snowflake(vertical)
                snow_vertical_list[i][0] = random.randrange(-300, -10,20)
                snow_vertical_list[i][1] = random.randrange(0, 580, 35)
            elif shield == 0:
                #if not we subtract 1 from current health
                health -= 1
                #and we show visuals of player getting hit
                pygame.draw.rect(screen, RED, [player_x, player_y, 20, 20])
                #atlast we give new coords to snowflake(vertical)
                snow_vertical_list[i][0] = random.randrange(-300, -10,20)
                snow_vertical_list[i][1] = random.randrange(0, 580, 35)
        if snow_vertical_list[i][0] > 1400:
            # Reset it just above the top
            x = random.randrange(-300, -10,20)
            snow_vertical_list[i][0] = x
            # Give it a new x position
            y = random.randrange(0, 580, 35)
            snow_vertical_list[i][1] = y

    #fireball behaviours:

    for i in range(len(fireball_list)):

        # Draw fireball
        pygame.draw.circle(screen, RED, fireball_list[i], 4)
        # Move the fireball down seven pixel
        fireball_list[i][1] += 7
        #checking if fireball has collided with player
        fireball_x = fireball_list[i][0]
        fireball_y = fireball_list[i][1]
        if (player_x < fireball_x < player_x + 20) and (player_y < fireball_y < player_y + 20):
            # if so we check if the player has shield
            if shield > 0:
                #if so we subtract 1 from the current shield count
                shield -= 1
                #and then showing visuals of the player getting hit
                pygame.draw.circle(screen, CYAN, [player_x + 10, player_y + 10], 17, 4, True, True, True, True)
                #atlast we give new coords to the fireball
                fireball_list[i][1] = random.randrange(-50, -10)
                fireball_list[i][0] = random.randrange(0, 1400, 20)
            elif shield == 0:
                #if not we subtract 2 from the current health
                health -= 2
                #and then we show visuals of player getting hit
                pygame.draw.rect(screen, RED, [player_x, player_y, 20, 20])
                #atlast we give new coords to fireball
                fireball_list[i][1] = random.randrange(-50, -10)
                fireball_list[i][0] = random.randrange(0, 1400, 20)
        # If the fireball has moved off the bottom of the screen
        if fireball_list[i][1] > 580:
            # Reset it just above the top
            y = random.randrange(-50, -10)
            fireball_list[i][1] = y
            # Give it a new x position
            x = random.randrange(0, 1400,20)
            fireball_list[i][0] = x

    #heal behaviours:

    for i in range(len(heal_list)):

        # Drawing heal
        pygame.draw.circle(screen, GREEN, heal_list[i], 2)
        # Move the heal down three pixel
        heal_list[i][1] += 3
        #checking if heal has collided with player
        heal_x = heal_list[i][0]
        heal_y = heal_list[i][1]
        if (player_x < heal_x < player_x + 20) and (player_y < heal_y < player_y + 20):
            #if so we check if the player's health is at the max cap
            if health < 25:
                #if so we don't add more health
                health += 1
                pygame.draw.rect(screen, GREEN, [player_x, player_y, 20, 20])
                heal_list[i][1] = random.randrange(-50, -10)
                heal_list[i][0] = random.randrange(0, 1400, 20)
            elif health == 25:
                #if not we add +1 health to player
                pygame.draw.rect(screen, GREEN, [player_x, player_y, 20, 20])
                heal_list[i][1] = random.randrange(-50, -10)
                heal_list[i][0] = random.randrange(0, 1400, 20)

        # If heal has moved off the bottom of the screen
        if heal_list[i][1] > 580:
            # Reset it just above the top
            y = random.randrange(-50, -10)
            heal_list[i][1] = y
            # Give it a new x position
            x = random.randrange(0, 1400,20)
            heal_list[i][0] = x

    #shield behaviours:

    for i in range(len(shield_list)):

        # Draw the shield
        pygame.draw.circle(screen, BLUE, shield_list[i], 2)
        # Move the shield down three pixel
        shield_list[i][1] += 3
        #checking if shield collided with player
        shield_x = shield_list[i][0]
        shield_y = shield_list[i][1]
        if (player_x < shield_x < player_x + 20) and (player_y < shield_y < player_y + 20):
            #if so we also check if there is any active shields
            if shield == 0:
                #if not we add new 5 shields
                shield += 5
                shield_list[i][1] = random.randrange(-50, -10)
                shield_list[i][0] = random.randrange(0, 1400, 20)
                pygame.draw.circle(screen, BLUE, [player_x, player_y], 20)
            elif shield > 0:
                #if there is active shield, we don't add shield
                shield_list[i][1] = random.randrange(-50, -10)
                shield_list[i][0] = random.randrange(0, 1400, 20)
                pygame.draw.circle(screen, BLUE, [player_x, player_y], 20)
        # If the shield has moved off the bottom of the screen
        if shield_list[i][1] > 580:
            # Reset it just above the top
            y = random.randrange(-50, -10)
            shield_list[i][1] = y
            # Give it a new x position
            x = random.randrange(0, 1400,20)
            shield_list[i][0] = x

    #poison behaviours:

    for i in range(len(poison_list)):

        # Draw the poison
        pygame.draw.circle(screen, PURPLE, poison_list[i], 3)
        # Move the poison down five pixel
        poison_list[i][1] += 5
        #checking if the poison has collided with the player
        poison_x = poison_list[i][0]
        poison_y = poison_list[i][1]
        if (player_x < poison_x < player_x + 20) and (player_y < poison_y < player_y + 20):
            #poison cooldown timer
            poison = 60
            # assigning new coords to poison if collided
            poison_list[i][1] = random.randrange(-50, -10)
            poison_list[i][0] = random.randrange(0, 1400, 20)
        # If the poison has moved off the bottom of the screen
        if poison_list[i][1] > 580:
            # Reset it just above the top
            y = random.randrange(-50, -10)
            poison_list[i][1] = y
            # Give it a new x position
            x = random.randrange(0, 1400,20)
            poison_list[i][0] = x

    #coin behaviours:

    for i in range(len(coin_list)):

        #draw the coins
        pygame.draw.circle(screen, YELLOW, coin_list[i], 4)
        #checking if the coins coordinates collide with the current player position
        coin_x = coin_list[i][0]
        coin_y = coin_list[i][1]
        if (player_x < coin_x< player_x + 20) and (player_y < coin_y < player_y + 20):
            # if so then score will be added by 1
            #and reseting the coin back to random location
            score += 1
            coin_list[i][1] = random.randrange(0, 580, 50)
            coin_list[i][0] = random.randrange(0, 1400, 50)

    #outputing the datas:

    #health display
    text = font.render(f"HEALTH LEFT: {health} ", True, WHITE)
    screen.blit(text, [50, 600])
    #timer display
    text1 = font.render(f"TIME LEFT: {my_timer} ", True, WHITE)
    screen.blit(text1, [500, 600])
    #poison display
    text2 = font.render(f'POISON COOLDOWN: {poison}', True, WHITE)
    screen.blit(text2, [440, 630])
    #shield display
    text3 = font.render(f'SHIELD LEFT: {shield}', True, WHITE)
    screen.blit(text3, [50, 630])
    #current score display
    current_score = font.render(f'SCORE: {score}', True, WHITE)
    screen.blit(current_score, [650, 600])

    # --- Go ahead and update the screen with what we've drawn.
    pygame.display.flip()
 
    # --- Limit to 60 frames per second
    clock.tick(60)

    #counting down the cooldown timer of the poison
    if poison > 0:
        poison -= 1
    else:
        poison = 0

    #checking score
    if score == 3:
        win_text = font.render("YOU WIN", True, WHITE)
        screen.blit(win_text, [400, 250])
        pygame.display.flip()
        sleep(3)
        done = True
 
# Close the window and quit.
pygame.quit()