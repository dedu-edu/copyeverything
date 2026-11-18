const prompt = require('prompt-sync')()
var odd_num_count = 0, arr = []
var size_of_array = prompt("Массив-ийн хэмжээг оруулна уу: ")
for (var i = 0; i < size_of_array; i++){
    var number = prompt("Тоо оруулна уу: ")
    arr.push(number)
}
for (var i = 0; i < size_of_array; i++){
    if (arr[i] % 2 != 0){
        odd_num_count ++
    }
}
console.log(`Массив доторх сондгой тоо нийт: ${odd_num_count}ш байна`)