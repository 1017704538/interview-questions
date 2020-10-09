// 1. 字面量创建
var object1 = {
    name: 'value'
};
var object2 = new Object({
    name: 'value'
});

// 2. 构造函数创建
var M = function () {
    this.name = 'object3'
};
var object3 = new M();

// 3. Object.create()
var P = {
    name: 'object4'
};
var object4 = Object.create(P);