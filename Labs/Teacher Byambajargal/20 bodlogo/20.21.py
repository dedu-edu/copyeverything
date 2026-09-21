def k_th_digit(k):
    the_number = ""
    for i in range(10,100):
        the_number += str(i)
    print(the_number[k-1])

k_th_digit(int(input("Please enter the digit: ")))