a = int(input("Эхний тал: "))
b = int(input("Хоёр дахь тал: "))
c = int(input("Гурав дахь тал: "))
if a>0 and b>0 and c>0:
    if a+b>c:
        if a+c>b:
            if b+c>a:
                print("Yes")
            else:
                print("no")
        else:
            print("No")
    else:
        print("no")
else:
    print("Ядаж нэг нь эерэг биш")