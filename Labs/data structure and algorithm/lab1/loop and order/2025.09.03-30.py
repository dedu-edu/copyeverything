n = int(input("enter the range: "))
i=2
while i <= n:
    j = 2
    div_count = 0
    while j < i:
        if i % j == 0:
            div_count += 1
        j += 1
    if div_count == 0:
        print(i)
    i+=1
