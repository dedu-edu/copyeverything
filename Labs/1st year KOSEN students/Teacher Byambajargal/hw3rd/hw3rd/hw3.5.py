list= (['abc', 'xyz', 'aba', '1221', '2122'])
count = 0
for x in list:
    if len(x)>2 and x[0]==x[-1]:
        count = count + 1
    else:
        ()
print(count)
