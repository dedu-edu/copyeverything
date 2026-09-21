def binary_sort(arr,num):
    arr.sort()
    low_ind = 0
    high_ind = len(arr) - 1
    mid_ind = (high_ind + low_ind) // 2
    loop_count = 0
    while mid_ind >= low_ind and mid_ind <= high_ind:
        if num == arr[mid_ind]:
            return mid_ind
        elif num < arr[mid_ind]:
            high_ind = mid_ind
            mid_ind = (high_ind + low_ind) // 2
            if loop_count > 0:
                return None
        elif num > arr[mid_ind]:
            low_ind = mid_ind
            mid_ind = (high_ind + low_ind) // 2
            if loop_count > 0:
                break
        if mid_ind == low_ind or mid_ind == high_ind:
            loop_count += 1
    if num == arr[high_ind]:
        return high_ind
    else:
        return None

arr = [2,4,6,8,10]
num = 7
output = binary_sort(arr,num)
print(output)
#muuhai code bichsend uuchlaarai bagsh, uuruu binary_sort zohiogood bichlee.