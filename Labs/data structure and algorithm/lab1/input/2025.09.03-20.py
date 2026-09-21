current_time = int(input("enter current hour: "))
if current_time > 12:
    current_time = current_time - 12
    print(f'{current_time}PM')
else:
    print(f'{current_time}AM')