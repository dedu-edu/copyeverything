def perfect_number(limit):
    for i in range(1, limit+1):
        sum = 0
        for j in range(1, i):
            if i % j == 0:
                sum += j
        if sum == i:
            print(i)

perfect_number(int(input("enter the limit: ")))