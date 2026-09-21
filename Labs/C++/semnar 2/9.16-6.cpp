#include <iostream>
using namespace std;
int main() {
    int a,b,c;
    cout << "Enter a number: ";
    cin >> a;
    while (a>1) {
        if (a%2==0) {
            b = a /= 2;
            ++c;
        }
        else {
            break;
        }
    }
    if (b == 1) {
        cout << "number is a power of two";
    }
    else {
        cout << "number is not a power of two";
    }
    return 0;
}

