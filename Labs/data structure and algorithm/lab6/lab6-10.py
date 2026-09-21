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
            print("Overflow")
            return
        else:
            if self.front is None:
                self.front = new_node
                return
            current = self.front
            while current.next:
                current = current.next
            current.next = new_node

    def dequeue(self):
        if self.front is None:
            print("underflow")
            return None
        dequeued = self.front.data
        self.front = self.front.next

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

size = 3
Que = Queue(size)
Que.dequeue()
Que.enqueue(1)
Que.enqueue(2)
Que.enqueue(3)
Que.print_queue()
Que.enqueue(4)
