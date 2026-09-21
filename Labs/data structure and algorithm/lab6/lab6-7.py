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
        if length > self.size:
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

    def print_medean(self):
        current = self.front
        target = self.length() // 2
        for i in range(target-1):
            current = current.next
        print(current.data)

    def max_num(self):
        current_max = 0
        current = self.front
        while current:
            if current.data > current_max:
                current_max = current.data
            current = current.next
        return current_max

queue1 = Queue(5)
queue1.enqueue(1)
queue1.enqueue(9)
queue1.enqueue(3)
queue1.print_queue()
print(f'max num in queue is: {queue1.max_num()}')
