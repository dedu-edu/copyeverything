sum = 0
con = 1
i = 0
while con != 0:
    sum = sum + i
    i = int(input("Enter num: "))
    if i == 0:
        con = 0
print(sum)