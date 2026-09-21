def selection_sort(arr):
    n = len(arr)
    for i in range(n):
        max_ind = i
        for j in range(i+1, n):
            if arr[j] > arr[max_ind]:
                max_ind = j
        arr[max_ind], arr[i] = arr[i], arr[max_ind]
    return arr
my_list = [5,8,2,9]
print(selection_sort(my_list))