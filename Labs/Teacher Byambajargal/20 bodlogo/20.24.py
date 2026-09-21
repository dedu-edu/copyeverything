import random
def contestant(n):
    contestants = []
    order = []
    for i in range(3):
        sports = []
        for j in range(3):
            l = j
            l = random.randint(0,9)
            sports.append({j:l})
        contestants.append({i:sports})
    if n == 0:
        for i in range(3):
            place = sum(contestants[i][0][0])
            order.append({i: place})
        sort = sorted(order[1])
        print(sort)
    if n > 0:
        for i in range(3):
            place = contestants[i][n]
            order.append({i: place})
        sort = sorted(order[1])
        print(sort)

contestant(0)

