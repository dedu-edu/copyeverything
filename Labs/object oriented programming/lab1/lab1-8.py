string = "hghhah"
front_ind = 0
back_ind = -1
needs_fix_count = 0
needs_fix_list = []
for i in range(len(string)//2):
    first = string[front_ind]
    last = string[back_ind]
    if first != last:
        needs_fix_count += 1
        needs_fix_list.append(f'{first}->{last}')
    front_ind += 1
    back_ind -= 1
print(needs_fix_count, needs_fix_list)
