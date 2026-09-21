def linear_search(arr,num):
    last_ind = 0
    for i in range(len(arr)):
        if arr[i] == num:
            last_ind = i
    return last_ind
arr = [1,3,1,2,3,4]
search_num = 1
out = linear_search(arr,search_num)
print(out)
