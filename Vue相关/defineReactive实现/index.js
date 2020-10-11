function defineReactive(obj, key, value) {
    // 注意这里！！！！！！！
    observer(value)
    Object.defineProperty(obj, key, {
        get: function () {
            return value
        },
        set: function (newVal) {
            // 注意这里！！！！！！！
            observer(newVal)
            console.log('数据更新了')
            value = newVal
        }

    })
}

// 把数组上大部分方法重写了，这里不一一列举。但是如果你 [1,2].length--，这是捕捉不到的
let arr = ['push', 'slice', 'split']
arr.forEach(method => {
    let oldPush = Array.property[method]
    Array.property[method] = function (value) {
        console.log('数据更新')
        oldPush.call(this, value)
    }
})