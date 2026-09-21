#include <iostream>
#include <cmath>
using namespace std;
int main()
{
    int n,sum=0,mult=1;
    cin>>n;
    for(int i = 1;i<=n;i++)
    {
        for(int j=i;j<=i*2;j++)
        {
            mult = mult * j;
        }
        sum = sum + mult;
        mult = 1;
    }
    cout<<sum;
}
