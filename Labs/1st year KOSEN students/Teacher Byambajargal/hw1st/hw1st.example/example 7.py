a = int(input("Эхний тал: "))
b = int(input("Хоёр дахь тал: "))
c = int(input("Гурав дахь тал: "))
if a>0 and b>0 and c>0:
    if a+b>c and a+c>b and c+b>a:
        print("yes")
    else:
        print("No")
else:
    print("Ядаж нэг нь эерэг биш")