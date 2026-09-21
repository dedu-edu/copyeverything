n = int(input("enter length of number: "))
nums = []
odd_sum = 0
even_sum = 0
for i in range(n):
    nums.append(int(input(f"enter {i+1}th num: ")))
    if i % 2 == 0:
        even_sum += nums[i]
    else:
        odd_sum += nums[i]
if even_sum > odd_sum:
    print("even")
elif even_sum < odd_sum:
    print("odd")
else:
    print("equal")