#include <iostream>
#include <cmath>
#include <iomanip>
using namespace std;
#define PI 3.14159265

int main ()
{
    double n, x,sum=0;
    cin>>x>>n;
    for(int i=1; i<=n;i++)
    {
        sum = sum + sin(pow(x,i));
    }
    cout<<fixed<<setprecision(3)<< sum;
}