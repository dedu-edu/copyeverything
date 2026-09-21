#include <iostream>
#include <string>
using namespace std;
int main() {
    int n,mx=0,ind;
    cin >> n;
    int arr[n]{};
    for (int i = 0; i < n; i++) {
        cin >> arr[i];
    }
    for (int j = 0; j < n; j++) {
        if (arr[j] > mx) {
            mx = arr[j];
            ind = j;
        }
    }
    cout << mx << endl;
    cout << ind+1;
    return 0;
}