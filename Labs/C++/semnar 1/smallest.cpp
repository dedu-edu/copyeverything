#include <iostream>
using namespace std;
int main() {
    int a,b,c;
    cout << "Enter the first number: ";
    cin >> a >> b >> c;
    if (a < b and a < c) {
        cout << "The smallest number is " << a << endl;
    }
    else if (b < a and b < c) {
        cout << "The smallest number is " << b << endl;
    }
    else if (c < a and c < b) {
        cout << "The smallest number is " << c << endl;
    }
    return 0;
}
