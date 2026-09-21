choose = input("please choose ur conversion from..: (H) for hexadecimal, (B) for binary: ")
a = ["A", "B", "C", "D", "E", "F"]
if choose == "B" or choose == "b":
    b_num = input("enter the number in binary: ")
    power = len(b_num)
    i = -1
    expo = 0
    if int(b_num) ==1:
        print(1)
    elif int(b_num) ==0:
        print(0)
    else:
        while -1*i <= power:
            if i == -1:
                dec = int(b_num[i]) * 2**expo
                i = i - 1
                expo = expo + 1
            else:
                dec = dec + (int(b_num[i]) * 2**expo)
                i = i - 1
                expo = expo + 1
        print(dec)
elif choose == "H" or choose == "h":
     h_num = input("enter the number in hexadecimal: ")
     power = len(h_num)
     i = -1
     expo = 0
     if ("A" in h_num)==True or ("B" in h_num)==True or ("C" in h_num)==True or ("D" in h_num)==True or ("E" in h_num)==True or ("F" in h_num)==True:
         if h_num == "A":
             print(10)
         elif h_num == "B":
             print(11)
         elif h_num == "C":
             print(12)
         elif h_num == "D":
             print(13)
         elif h_num == "E":
             print(14)
         elif h_num == "F":
             print(15)
     else:
         while -1 * i <= power:
             if i == -1:
                 dec = int(h_num[i]) * 16 ** expo
                 i = i - 1
                 expo = expo + 1
             else:
                 dec = dec + (int(h_num[i]) * 16 ** expo)
                 i = i - 1
                 expo = expo + 1
         print(dec)
else:
    print("invalid type")

