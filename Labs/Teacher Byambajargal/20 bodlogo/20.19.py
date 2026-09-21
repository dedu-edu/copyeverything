def min_and_max(A):
    temp = []
    for i in str(A):
        temp.append(int(i))
    maximum = max(temp)
    minimum = min(temp)
    if A % (maximum-minimum) == 0:
        print("yes")
    elif A % (maximum-minimum) != 0:
        print("no")

min_and_max(int(input("enter your number: ")))