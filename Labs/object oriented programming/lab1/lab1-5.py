txt = "aaabbcddd"
slist = list(txt)
compressed_list = []
curr_char = ""
freq_count = 1
for i in range(len(slist)-1):
    if slist[i] == slist[i+1]:
        freq_count += 1
        curr_char = slist[i]
    else:
        compressed_list.append(slist[i])
        compressed_list.append(str(freq_count))
        freq_count = 1
compressed_list.append(curr_char)
compressed_list.append(str(freq_count))
output = "".join(compressed_list)
print(output)
