#include <iostream>
#include <cmath>
#include <iomanip>
using namespace std;
int main()
{
    double n,sum=1;
    cin>>n;
    for(int i=1;i<=n;i++)
    {
        sum=sum * (1+1/pow(i,2));
    }
    cout<<fixed<<setprecision(3)<<sum;
}