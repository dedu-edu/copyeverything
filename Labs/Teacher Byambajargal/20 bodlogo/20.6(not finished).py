def friendly_numbers(n,m):
    for i in range(n,m+1):
        sum = 0
        for j in range(i,m+1):
            for k in range(2,j):
                if j % k == 0:
                    sum += 0