start_min = int(input("Enter starting minutes: "))
start_hours = int(input("Enter starting hours: "))
duration = int(input("Enter the duration: "))
end_min = (start_min + duration) % 60
end_hours = start_hours + ((start_min + duration) // 60)
print(f"Ending time is {end_hours}:{end_min}")