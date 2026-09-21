import random as rd
n = int(input("enter the size of the array: "))
rand_range = int(input("enter the range of random num: "))
number = []
for i in range(n):
    num = rd.randint(1, rand_range)
    number.append(num)
print(number)