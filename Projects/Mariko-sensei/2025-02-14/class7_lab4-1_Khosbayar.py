running = "yes"
turns = 0
distance_ran = 0
distance = 100
distance_left = distance
choice_right = False
while running == "yes":
    action = input(f"""
    UlTRA-Desert marathon: 
    --------------------------- 
    Actions:
    a for jogging 5 km
    b for running 10 km
    c for seeing the total distance ran
    q for quit

    --------------------------
     Day {turns}
     Distance left: {distance_left} km

    --------------------------
    User input:

""")
    action = action.lower()
    if action == "q":
        print("Goodbye")
        running = "no"
        break
    else:
        while choice_right == False:
         if action == "a":
            distance_ran += 5
            distance_left -= 5
            turns += 1
            break
         elif action == "b":
            distance_ran += 10
            distance_left -= 10
            turns += 1
            break
         elif action == "c":
            action = input(f"""
                UlTRA-Desert marathon: 
                --------------------------- 
                Actions:
                a for jogging 5 km
                b for running 10 km
                c for seeing the total distance ran
                q for quit

                --------------------------
                 Day {turns}
                 Distance left: {distance_left} km
                 Distance ran: {distance_ran} km

                --------------------------
                User input:

            """)

         else:
            action = input(f"""
            ERROR  WRONG CHOICE PLEASE ENTER RIGHT COMMAND!!!
                UlTRA-Desert marathon: 
                --------------------------- 
                Actions:
                a for jogging 5 km
                b for running 10 km
                c for seeing the total distance ran
                q for quit

                --------------------------
                 Day {turns}
                 Distance left: {distance_left} km

                --------------------------
                User input:

            """)