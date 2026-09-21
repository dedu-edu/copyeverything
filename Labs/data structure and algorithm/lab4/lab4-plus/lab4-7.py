class Node(object):
    def __init__(self, data):
        self.data = data
        self.next = None

class LinkedList(object):
    def __init__(self):
        self.head = None

    def append(self, data):
        new_node = Node(data)
        if not self.head:
            self.head = new_node
            return
        current = self.head
        while current.next:
            current = current.next
        current.next = new_node

    def length(self):
        length = 0
        current = self.head
        while current:
            length += 1
            current = current.next
        return length
List1 = LinkedList()
List1.append(10)
List1.append(20)
List1.append(30)
List1.append(40)
length = List1.length()
print(length)