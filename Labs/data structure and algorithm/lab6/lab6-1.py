class Node:
    def __init__(self, data):
        self.data = data
        self.next = None

class Stack:
    def __init__(self):
        self.top = None

    def push(self, data):
        new_node = Node(data)
        new_node.next = self.top
        self.top = new_node

    def pop(self):
        if self.top is None:
            return None
        popped = self.top.data
        self.top = self.top.next
        return popped

    def print_stack(self):
        current = self.top
        while current:
            print(current.data, end=" ")
            current = current.next

    def peek(self):
        if self.top is None:
            print("Stack is empty")
        print(self.top.data)

    def length(self):
        if self.top is None:
            return 0
        leng = 0
        current = self.top
        while current:
            leng += 1
            current = current.next
        return leng
Stack1 = Stack()
Stack1.push(1)
Stack1.push(2)
Stack1.push(3)
Stack1.print_stack()
Stack2 = Stack()
for i in range(Stack1.length()):
    data = Stack1.pop()
    Stack2.push(data)
Stack2.print_stack()
