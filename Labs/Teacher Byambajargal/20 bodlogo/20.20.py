def weekday(k):
    if k % 7 == 1:
        print("monday")
    elif k % 7 == 2:
        print("tuesday")
    elif k % 7 == 3:
        print("wednesday")
    elif k % 7 == 4:
        print("thursday")
    elif k % 7 == 5:
        print("friday")
    elif k % 7 == 6:
        print("saturday")
    elif k % 7 == 0:
        print("sunday")

k = int(input("please enter day a from a whole year: "))
if k <= 0 or k > 365:
    print("please enter a number between 1 and 365")
else:
    weekday(k)