nums = [1,2,2,3,3,3,4]
dupl_nums = []
for i in range(len(nums)):
    curr = nums[i]
    for k in range(i+1, len(nums)):
        if curr == nums[k] and curr not in dupl_nums:
            dupl_nums.append(curr)
        break
dupl_nums.sort()
print(dupl_nums)