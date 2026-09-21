#include <iostream>
#include <cmath>
using namespace std;
int pow(int x) {
    return pow(x,2);
}
int main() {
    int x;
    cin >> x;
    cout << pow(x) << endl;
    return 0;
}