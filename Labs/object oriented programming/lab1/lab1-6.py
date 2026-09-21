strings = "abcabcbb"
longest_len = 0
longest_growing_list = []
curr_len = 0
curr_list = []
for i in range(len(strings)-1):
    if strings[i] != strings[i+1] and strings[i] not in curr_list:
        curr_len += 1
        curr_list.append(strings[i])
    else:
        if curr_len > longest_len:
            longest_len = curr_len
            longest_growing_list = curr_list[:]
            curr_list = []
            curr_len = 0
output = "".join(longest_growing_list)
print(output)
