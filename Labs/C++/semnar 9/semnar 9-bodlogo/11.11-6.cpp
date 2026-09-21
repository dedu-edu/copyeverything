#include <iostream>
using namespace std;
int ore(int a) {
    if (a%2==0) {
        return 1;
    }
    else {
        return 0;
    }
}
int main() {
    int a;
    cin>>a;
    ore(a);
    if (ore(a) == 1) {
        cout<<"even";
    }
    else if (ore(a) == 0) {
        cout<<"odd";
    }
    return 0;
}