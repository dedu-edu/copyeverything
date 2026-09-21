def automorph_numbers():
    for i in range(pow(10,0),pow(10,3)):
        expo = pow(i,2)
        if i==int(str(expo)[-len(str(i)):]):
            print(i)

automorph_numbers()