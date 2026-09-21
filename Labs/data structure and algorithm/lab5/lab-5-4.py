class Stack:
    def __init__(self):
        self.items = []

    def push(self, data):
        self.items.append(data)

    def pop(self):
        if not self.is_empty():
            return self.items.pop()
        return None

    def peek(self):
        if not self.is_empty():
            return self.items[-1]
        return None

    def is_empty(self):
        return len(self.items) == 0

    def size_of_stack(self):
        return len(self.items)

    def check_parenthesis(self, expr):
        for char in expr:
            if char == "(":
                self.push(char)
            elif char == ")":
                if self.is_empty():
                    return False
                self.pop()

        return self.is_empty()

steak = Stack()
parentheses = input("Enter the parentheses: ")

if steak.check_parenthesis(parentheses):
    print("Balanced")
else:
    print("Not balanced")



