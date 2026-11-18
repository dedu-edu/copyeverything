const prompt = require('prompt-sync')()
var arr = [], multi = 1
var n = prompt("Массив-ийн N хэмжээг оруулна уу: ")
var m = prompt("Массив-ийн M хэмжээг оруулна уу: ")
for (var i = 0; i < n; i++){
    var temp_arr = []
    for (var j = 0; j < m; j++){
        var number = prompt('Тоог оруулна уу: ')
        temp_arr.push(number)
    }
    arr.push(temp_arr)
}
for (var i = 0; i < n; i++){
    for (var j = 0; j < m; j++){
        if (i == 0 || i==n-1 || j==0 || j==m-1){
            multi *= arr[i][j]
        }
    }
}
console.log(`Захын гишүүдийн үржвэр: ${multi}`)