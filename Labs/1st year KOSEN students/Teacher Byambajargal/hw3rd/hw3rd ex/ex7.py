list = ["physics", "chemistry", 1997, 2000]
print(list)
del list[2]
print("Индексээр утгыг устгасны дараа : ", list)

firstlist=["Байцаа", "Төмс", "Лууван", "Сонгино", "Сармис"]
firstlist.clear()
print(firstlist)

list1= ["Байцаа", "Төмс"]
list2= ["Лууван", "Сонгино", "Сармис"]

for x in list2:
    list1.append(x)

print(list1)