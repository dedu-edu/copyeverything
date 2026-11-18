search_range = int(input("Enter a range of numbers: "))
if search_range == 0:
    print("None")
else:
    for i in range(1, search_range+1):
        if str(i)[0] == str(i)[-1]:
            print(i)


