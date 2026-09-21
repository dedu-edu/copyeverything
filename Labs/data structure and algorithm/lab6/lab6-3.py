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

class Queue:
    def __init__(self):
        self.front = None

    def enqueue(self, data):
        new_node = Node(data)
        length = self.length()
        if self.front is None:
            self.front = new_node
            return
        current = self.front
        while current.next:
            current = current.next
        current.next = new_node

    def dequeue(self):
        if self.front is None:
            return None
        dequeued = self.front.data
        self.front = self.front.next
        return dequeued

    def print_queue(self):
        current = self.front
        while current:
            print(current.data, end=" ")
            current = current.next

    def length(self):
        current = self.front
        length = 1
        while current:
            length += 1
            current = current.next
        return length

def palindrome_checker(string):
    for i in string:
        stack1.push(i)
        queue1.enqueue(i)
    for i in range(len(string)):
        out_from_stack = stack1.pop()
        out_from_queue = queue1.dequeue()
        if out_from_stack != out_from_queue:
            return False
    return True
stack1 = Stack()
queue1 = Queue()
strings = input("string: ")
outcome = palindrome_checker(strings)
print(outcome)