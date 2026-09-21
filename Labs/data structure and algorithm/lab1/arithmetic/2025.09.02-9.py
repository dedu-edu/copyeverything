money = int(input("enter the price: "))
million = money // 1000000
thousand = (money % 1000000)//1000
print(f'{million} mil {thousand}k')