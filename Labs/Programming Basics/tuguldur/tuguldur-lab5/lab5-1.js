const prompt = require('prompt-sync')()
var arr = [], sum = 0
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
        if (arr[i][j] % 5 == 0){
            sum = sum + Number(arr[i][j])
        }
    }
}
console.log(`Массив доторх 0 болон 5-аар төгссөн тоонуудын нийлбэр: ${sum}`)