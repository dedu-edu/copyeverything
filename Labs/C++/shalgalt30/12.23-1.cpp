#include <iostream>

using namespace std;

int main( ){

    int a;

    cin>>a;

    int c=a/100;

    int b = (a-c*100 )%10;

    int z = (a-c*100 )/10;

    int q =c+b+z;

    cout<<q;

    return 0;

}