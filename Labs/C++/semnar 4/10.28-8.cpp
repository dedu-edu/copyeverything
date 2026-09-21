#include <iostream>
#include <string>
using namespace std;
int main() {
    int n,j=0,yalgah;
    cin >> n;
    int arr[n]{};
    for (int i = 0; i < n; i++) {
        cin >> arr[i];
    }
    if (n%2==0) {
        while(j<n) {
            cout<<arr[j+1]<<","<<arr[j]<<",";
            j=j+2;
        }
    }
    else if (n%2!=0) {
        while(j<n-1) {
            cout<<arr[j+1]<<","<<arr[j]<<",";
            j=j+2;
        }
        yalgah = 1;
    }
    if (yalgah==1) {
        cout<<arr[n-1];
    }
    return 0;
}