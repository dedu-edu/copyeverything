#include <iostream>
using namespace std;
int main()
//find triangles parameter
{
    int a,b,c;
    cin>>a>>b>>c;
    cout<<max(max(a,b),c)<<endl;
    return 0;
}