#include <iostream>
using namespace std;
int main()
//find triangles parameter
{
    int a,b,c,d,sum=0;
    cin>>a>>b>>c>>d;
    if(a>80){
      sum+=a;
    }
    if(b>80){
      sum+=b;
    }
    if(c>80){
      sum+=c;
    }
    if(d>80){
      sum+=d;
    }
    cout<<sum;
    return 0;
}