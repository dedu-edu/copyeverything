#include <iostream>
using namespace std;
int main()
//find triangles parameter
{
    int a,b,c,d;
    cin>>a>>b>>c>>d;
    cout<<min(min(min(a,b),c),d)<<endl;
    return 0;
}