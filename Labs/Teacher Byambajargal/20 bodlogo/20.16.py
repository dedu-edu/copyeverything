import math
def sum(*numbers):
    multi = 1
    sum = 0
    for i in numbers:
        multi += i
    for j in range(len(str(multi))):
        sum += multi % 10
        multi = math.floor(multi / 10)
    for k in range(len(str(sum))):
        print(sum)
        sum = math.floor(sum/10)


sum(9,5,8,5,11)