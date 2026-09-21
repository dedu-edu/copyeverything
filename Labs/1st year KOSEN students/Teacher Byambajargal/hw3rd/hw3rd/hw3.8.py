word = input("please enter your word: ")
size = len(word)
i = 0
a = 0
while a<size:
    print(word[i], " has occured total of ", (word.count(word[i], 0, len(word))))
    i += 1
    a += 1
