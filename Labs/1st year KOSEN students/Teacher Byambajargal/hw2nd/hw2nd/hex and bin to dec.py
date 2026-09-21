print("please enter your type to convert from: ")
type = input("(H) for hexadecimal, (B) for binary ")
if type=='H' or type=='h':
    hex_num = input("please enter your num in hexadecimal: ")
    dec_num = int(hex_num, 16)
    print(dec_num)
elif type=='B' or type=='b':
    bin_num = input("please enter your num in binary: ")
    dec_num = int(bin_num, 2)
    print(dec_num)
else:
    print("invalid number type")
