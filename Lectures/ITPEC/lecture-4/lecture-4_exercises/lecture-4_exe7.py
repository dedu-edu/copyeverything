hours=int(input("enter your hours: "))
day = hours//24
hours = hours % 24
print(f'{day}:{hours}')