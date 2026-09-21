def lucky_numbers():
    import math
    for i in range(pow(10,5), pow(10,6)):
        right_half, left_half = int(str(i)[0:4]), int(str(i)[4:])
        right_sum, left_sum = 0,0
        for j in range(len(str(right_half))):
            right_sum += right_half%10
            right_half = math.floor(right_half/10)
        for k in range(len(str(left_half))):
            left_sum += left_half % 10
            left_half = math.floor(left_half / 10)
        if right_sum == left_sum:
            print(i)

lucky_numbers()