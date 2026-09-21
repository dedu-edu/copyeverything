#include <iostream>
#include <string>
#include <cmath>
using namespace std;
int calc(int x,int y, string opt) {
    if (opt == "s" or opt == "S" ) {
        return x-y;
    }
    else if (opt == "a" or opt == "A" ) {
        return x+y;
    }
    else if (opt == "M" or opt == "m" ) {
        return x*y;
    }
    else if (opt == "d" or opt == "D") {
        return x/y;
    }
    else if (opt == "p" or opt == "P") {
        return pow(x,y);
    }
}

int main() {
    int x,y = 0;
    string opt;
    cout<<"please choose your arthemetic operation:"<<endl;
    cout<<"s for subtract, a for addition, m for multiplication, d for divide, p for power: "<<endl;
    cin>>opt;
    cout<<"please enter your two numbers"<<endl;
    cin>>x>>y;
    cout<<calc(x,y,opt)<<endl;
    return 0;
}
