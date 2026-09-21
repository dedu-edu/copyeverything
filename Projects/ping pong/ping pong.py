# Example file showing a circle moving on screen
import pygame

# pygame setup
pygame.init()
height = 720
width = 1280
screen = pygame.display.set_mode((width, height))
clock = pygame.time.Clock()
#icons
icon = pygame.image.load('ping-pong (1).png')
pygame.display.set_icon(icon)
#colors
background = (255,255,255)

#player
playerIMG = pygame.image.load('rectangular-shape-outline.png')
playerX = 640
playerY = 500
accelerationX = 0
accelerationY = 0
running = True


def player(x,y):
    screen.blit(playerIMG, (x-540,y-250 ))
player_pos = pygame.Vector2(screen.get_width() / 2, screen.get_height() / 2)

while running:
    # pygame.QUIT event means the user clicked X to close your window
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
        #keystrokes
        if event.type == pygame.KEYDOWN:
            if event.key == pygame.K_LEFT or event.key == pygame.K_a:
                accelerationX -= 0.3
            if event.key == pygame.K_RIGHT or event.key == pygame.K_d:
                accelerationX += 0.3
            if event.key == pygame.K_UP or event.key == pygame.K_w:
                accelerationY -= 0.3
            if event.key == pygame.K_DOWN or event.key == pygame.K_s:
                accelerationY += 0.3
        if event.type == pygame.KEYUP:
            if event.key == pygame.K_LEFT or event.key == pygame.K_RIGHT or event.key == pygame.K_d or event.key == pygame.K_a:
                accelerationX = 0
            if event.key == pygame.K_UP or event.key == pygame.K_DOWN or event.key == pygame.K_w or event.key == pygame.K_s:
                accelerationY = 0
    #players movement
    playerX += accelerationX
    playerY += accelerationY
    #setting the border
    if playerX <= 0:
        playerX = 0
    elif playerX >= width-80:
        playerX = width-80
    elif playerY <= 0:
        playerY = 0
    elif playerY >= height-70:
        playerY = height-70
    # fill the screen with a color to wipe away anything from last frame
    screen.fill(background)
    #displaying player movement
    player(playerX, playerY)
    pygame.display.update()
pygame.quit()