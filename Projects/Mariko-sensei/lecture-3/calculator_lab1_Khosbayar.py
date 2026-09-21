#input from user
distance = float(input("Enter the distance in km: "))
kmm = float(input("How many minutes does it take you to run 1km: "))
#calculation part
total_minute = distance * kmm
total_hour = total_minute // 60
total_minute = total_minute % 60
print(f'Estimated time {total_hour} hours and {total_minute} minutes')
