#include <iostream>
using namespace std;
int maximum(int x,int y) {
    if (x>y) {
        return x;
    }
    else if (x<y) {
        return y;
    }
}
int main() {
    int x,y;
    cin >> x>>y;
    cout << maximum(x,y) << endl;
    return 0;
}