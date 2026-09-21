class Node(object):
    def __init__(self, data):
        self.data = data
        self.next = None

class CircularLinkedList(object):
    def __init__(self):
        self.head = None

    def append(self, data):
        new_node = Node(data)
        if not self.head:
            self.head = new_node
            new_node.next = self.head
            return
        else:
            current = self.head
            while current.next != self.head:
                current = current.next
            current.next = new_node
            new_node.next = self.head

    def lastnode(self):
        current = self.head
        while current.next != self.head:
            current = current.next
        print(current.data)
List1 = CircularLinkedList()
List1.append(1)
List1.append(2)
List1.append(3)
List1.append(4)
List1.lastnode()
