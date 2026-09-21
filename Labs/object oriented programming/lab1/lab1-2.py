nums = [1, 2, 3, 2, 5, 6, 7, 1]
longest_len = 0
longest_growing_list = []
curr_len = 0
curr_list = []
for i in range(0, len(nums)-1):
        if nums[i] < nums[i + 1]:
            curr_len += 1
            curr_list.append(nums[i])
        else:
            curr_list.append(nums[i])
            if curr_len > longest_len:
                longest_len = curr_len
                longest_growing_list = curr_list[:]
                curr_list = []
                curr_len = 0
print(longest_growing_list)