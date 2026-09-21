import pygame
import random
BLACK = (0, 0, 0)
WHITE = (255, 255, 255)
GREEN = (0, 255, 0)
RED = (255, 0, 0)
BLUE = (116,167,255)
PI = 3.14
pygame.init()
size = (700, 500)
screen = pygame.display.set_mode(size)
 
pygame.display.set_caption("My first pygame game")
 
done = False
polygon_list=[]
for i in range(5):
    x = random.randrange(0,700)
    y = random.randrange(0,500)
    polygon_list.append([x, y])
 
clock = pygame.time.Clock()
while not done:
   
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            done = True

    screen.fill(BLUE)
    for i in range(5):
        pygame.draw.line(screen, GREEN, [i*150, i*150], [i*150, i*150], 5)
        pygame.draw.circle(screen, GREEN, [i*100, i*100], 10)
        pygame.draw.rect(screen, GREEN, [i*100, i*100, 20, 20], 10)
    
    for i in range(10):
        x = random.randrange(0,700)
        y = random.randrange(0,500)
        pygame.draw.circle(screen,WHITE,[x,y],10)
    for i in range(len(polygon_list)):
        pygame.draw.rect(screen, RED, [polygon_list[i][0], polygon_list[i][1],50,50])

    pygame.display.flip()
 
    clock.tick(10)
 
pygame.quit()
 
