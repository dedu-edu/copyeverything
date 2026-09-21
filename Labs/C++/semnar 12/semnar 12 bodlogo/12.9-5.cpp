#include <iostream>
#include <iomanip>
using namespace std;
int main()
{
    int n;
    double sum=0;
    cin>>n;
    double myarr[n];
    for(int i=0;i<n;i++)
    {
        cin>>myarr[i];
    }
    for(int i=0;i<n;i++)
    {
        sum = sum + myarr[i];
    }
    cout<<fixed<<setprecision(2)<<sum/n;
}