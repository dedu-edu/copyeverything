class Node:
    def __init__(self, data):
        self.data = data
        self.next = None

class Queue:
    def __init__(self,size):
        self.front = None
        self.size = size

    def enqueue(self, data):
        new_node = Node(data)
        length = self.length()
        if length >= self.size:
            self.dequeue()
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
        length = 0
        while current:
            length += 1
            current = current.next
        return length

    def print_medean(self):
        current = self.front
        target = self.length() // 2
        for i in range(target-1):
            current = current.next
        print(current.data)

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

queue1 = Queue(5)
queue1.enqueue(1)
queue1.enqueue(2)
queue1.enqueue(3)
queue1.enqueue(4)
queue1.enqueue(5)

stack1 = Stack()
for i in range(queue1.length()):
    data = queue1.dequeue()
    stack1.push(data)
stack1.print_stack()