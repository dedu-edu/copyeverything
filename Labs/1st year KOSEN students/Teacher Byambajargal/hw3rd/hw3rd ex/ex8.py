# define a list first.
mylist = ["physics", "chemistry", 1997, 2000]

#change element
mylist[2] = 2001

#delete an element
del mylist[2]

#append it
mylist.append(2005)

list_test=[1,2,3,4,5,6,7,8,9]

if len(list_test)==0:
    print("empty list")
else:
    print("the list is not empty")