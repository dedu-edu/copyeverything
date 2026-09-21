starting_hour=input("Please enter your starting hour: ")
duration=int(input('Please enter your duration in minutes: '))
hour=int(starting_hour[0:2])
minute=int(starting_hour[3:5])
total_minute = hour*60 + minute + duration
hour = total_minute // 60
minute = total_minute % 60
print(f"Your work will end at {hour}:{minute}")