n = int(input("enter the size of the array: "))
number = []
mt_avg_nums = []
sum = 0
for i in range(n):
    num = int(input(f"enter your {i+1}th number: "))
    number.append(num)
    sum += num
avg = sum / n
for i in range(n):
    if number[i] > avg:
        mt_avg_nums.append(number[i])
print(mt_avg_nums)
