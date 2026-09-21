import random
distance = 100
stamina = 100
#weather conditions
running = "yes"
rest = 20
turns = 0
currentweather = "sunny"
weatherdebuff = 0
choice_right = False
while running == "yes":
    action = input(f"""
    UlTRA-Desert marathon: 
    --------------------------- 
    Actions:
    a for jogging 5 km, will use 20 stamina
    b for running 10 km, will use 40 stamina
    r for rest, will regen 20 stamina
    q for quit
    
    --------------------------
     Day {turns}
     Distance left: {distance} km
     current weather: {currentweather} (rainy days deplate -10 stamina, windy days deplate -5 stamina, and sunny days -0 stamina)
     current stamina: {stamina}
     
    --------------------------
    User input:

""")
    action = action.lower()
    if distance <= 0:
        print(f"U have completed the game in {turns} turns")
        running = "no"
        break
    else:
        if action == 'q':
         running = "no"
         print("thank you for playing")
         break
        else:
            if stamina <= 0:
                print("U need to rest!!")
                stamina += 20
                turns += 1
                currentweather = random.randint(1, 3)
                if currentweather == 1:
                    currentweather = "sunny"
                    weatherdebuff = 0
                elif currentweather == 2:
                    currentweather = "rainy"
                    weatherdebuff = 10
                elif currentweather == 3:
                    currentweather = "windy"
                    weatherdebuff = 5
            elif 40 <= stamina:
                if action == 'a':
                    distance = distance - 5
                    stamina = stamina - 20 - weatherdebuff
                    turns += 1
                elif action == 'b':
                    distance = distance - 15
                    stamina = stamina - 40 - weatherdebuff
                    turns += 1
                elif action == 'r':
                    stamina = stamina + 20
                    turns += 1
                currentweather = random.randint(1, 4)
                if currentweather == 1:
                    currentweather = "sunny"
                    weatherdebuff = 0
                elif currentweather == 2:
                    currentweather = "rainy"
                    weatherdebuff = 10
                elif currentweather == 3:
                    currentweather = "windy"
                    weatherdebuff = 5
            elif 40> stamina > 19:
                while choice_right == False:
                    if action == 'a':
                        distance = distance - 5
                        stamina = stamina - 20 - weatherdebuff
                        turns += 1
                        choice_right = True
                    elif action == 'b':
                        print("Stamina too low to sprint!!,resting automatically")
                        stamina += 20
                        break
                    elif action == 'r':
                        stamina = stamina + 20
                        turns += 1
                        choice_right = True
                currentweather = random.randint(1, 3)
                if currentweather == 1:
                    currentweather = "sunny"
                    weatherdebuff = 0
                elif currentweather == 2:
                    currentweather = "rainy"
                    weatherdebuff = 10
                elif currentweather == 3:
                    currentweather = "windy"
                    weatherdebuff = 5
            else:
                while choice_right == False:
                    if action == 'a':
                        print("Stamina too low to jogging!!, resting automatically")
                        stamina = stamina + 20
                        break
                    elif action == 'b':
                        print("Stamina too low to sprint!!,resting automatically")
                        stamina = stamina + 20
                        break
                    elif action == 'r':
                        stamina = stamina + 20
                        turns += 1
                        choice_right = True
                        break
                currentweather = random.randint(1, 3)
                if currentweather == 1:
                    currentweather = "sunny"
                    weatherdebuff = 0
                elif currentweather == 2:
                    currentweather = "rainy"
                    weatherdebuff = 10
                elif currentweather == 3:
                    currentweather = "windy"
                    weatherdebuff = 5










