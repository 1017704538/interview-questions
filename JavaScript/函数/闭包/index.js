//使用立即执行函数
for (var i = 0; i < 5; i++) {
    ;
    (function (i) {
        setTimeout(function timer() {
            console.log(i)
        }, i * 100)
    })(i)
}

function test() {
    var arr = [];
    for (i = 0; i < 10; i++) {
        (function (j) {
            arr[j] = function () {
                console.log(j);
            }
        })(i)
    }
    return arr;
}

var myArr = test();
for (j = 0; j < 10; j++) {
    myArr[j]();
}

//闭包封装私有变量
function Counter() {
    let count = 0;
    this.plus = function () {
        return ++count;
    }
    this.minus = function () {
        return --count;
    }
    this.getCount = function () {
        return count;
    }
}

const counter = new Counter();
counter.puls();
counter.puls();
console.log(counter.getCount())