from math import inf

nums = [1,2,3,4,5,6,7,8,9]
t = int(input("enter t: "))
best_apprx = inf
best_apprx_nums = []
for i in range(len(nums)):
    twosum = 0
    for k in range(i+1,len(nums)):
        twosum = nums[i] + nums[k]
        curr_apprx = abs(t - twosum)
        if curr_apprx < best_apprx:
            best_apprx_nums.clear()
            best_apprx = curr_apprx
            best_apprx_nums = [nums[i],nums[k]]
print(best_apprx_nums)