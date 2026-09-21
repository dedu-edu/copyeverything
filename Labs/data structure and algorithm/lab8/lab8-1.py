class Node(object):
    def __init__(self, data):
        self.data = data
        self.right = None
        self.left = None

class Tree(object):
    def __init__(self):
        self.root = None

    def insert(self,data):
        new_node = Node(data)
        if self.root == None:
            self.root = new_node
            return
        

Tree1 = Tree()
Tree1.insert(5)
Tree1.insert(8)
Tree1.insert(6)
Tree1.insert(7)