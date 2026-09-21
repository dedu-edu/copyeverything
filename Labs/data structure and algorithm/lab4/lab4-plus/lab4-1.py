def linear_search(arr):
    max = 0
    for i in arr:
        if i > max:
            max = i
    return max
arr = [1,3,1,2,3,4]
output = linear_search(arr)
print(output)