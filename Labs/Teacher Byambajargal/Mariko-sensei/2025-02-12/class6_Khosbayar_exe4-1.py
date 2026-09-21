day = 1
sum = 0
while day <= 7:
    distance_ran_today = int(input(f"""
    day {day}
    How many km did u ran today?
    
    """))
    sum = sum + distance_ran_today
    day += 1
print(f'For total of {day} u ran total of {sum} km.')