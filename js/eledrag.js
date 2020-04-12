//用闭包形式来写，前面加; 是防止跟其他js压缩时报错
//undefined  防止出现undefined问题
;
(function (undefined) {

    //开启严格模式
    "use strict";

    let _global;

    //构造函数定义一个类  传参数
    function Eledrag() {};
    // function Eledrag(options) {
    //     this._init(options);
    // };


    // 原型链上添加方法
    Eledrag.prototype = {

        constructor: this,

        // 扩展自定义配置
        _extend: function (o, n, override) {
            for (let key in n) {
                if (n.hasOwnProperty(key) && (!o.hasOwnProperty(key) || override)) {
                    o[key] = n[key];
                }
            }
            return o;
        },

        // 初始化配置
        _init: function (opt) {

            let _this = this;

            // 默认参数 和 初始化 暴露的内部方法
            let def = {
                selectBoxId: 'selectBox',
                selectItemClass: 'fileDiv',
                selectedClass: 'selected'
            };

             // 配置参数
            _this.def = _this._extend(def, opt, true);

            // 鼠标按下
            document.addEventListener('mousedown', function (e) {

                _this.isSelect = true;

                let _ev = e || window.event;
                let target = _ev.target || _ev.srcElement;
                console.log(target);

                let selectBoxId = _this.def.selectBoxId;
                let selectItemClass = _this.def.selectItemClass;
                let selectedClass = _this.def.selectedClass;

                // 鼠标指针开始点击位置相对于父文档的 x/y 像素坐标(亦即相对于当前窗口)
                _this.startX = _ev.x || _ev.clientX;
                _this.startY = _ev.y || _ev.clientY;

                // 只有在被选中的元素之外点击和拖动才有效
                if (target.className.indexOf(selectedClass) === -1) {

                    // 如果存在旧的选框元素节点，则先清除
                    _this._removeELe(document.getElementById(selectBoxId));

                    _this.selectList = [];
                    let fileNodes = document.getElementsByClassName(selectItemClass);
                    console.log(fileNodes);
                    for (var i = 0; i < fileNodes.length; i++) {
                        if (fileNodes[i].className.indexOf(selectItemClass) !== -1) {
                            fileNodes[i].className = selectItemClass;
                            _this.selectList.push(fileNodes[i]);
                        }
                    }
                    console.log(_this.selectList);

                    // 创建选框
                    _this.selectBox = _this._createSelectBox();

                    // 选中目标元素
                    _this._targetSelect();

                } else {

                    // 已选中元素拖动
                    _this._targetDrag(target);

                }

                // 鼠标松开
                _this._mouseup();

                // 阻止事件冒泡
                _this._clearEventBubble(_ev);

            })

        },

        // 选中目标元素
        _targetSelect: function () {

            let _this = this;

            document.addEventListener('mousemove', function (e) {

                let _ev = e || window.event;

                if (_this.isSelect) {

                    let selectBox = _this.selectBox;
                    let selectList = _this.selectList;
                    let selectItemClass = _this.def.selectItemClass;
                    let selectedClass = _this.def.selectedClass;

                    if (selectBox.style.display === "none") {
                        selectBox.style.display = "block";
                    }

                    // 鼠标指针开始点击位置相对于父文档的 x/y 像素坐标(亦即相对于当前窗口)
                    let startX = _this.startX;
                    let startY = _this.startY;
                    // 鼠标指针移动点的位置相对于父文档的 x/y 像素坐标(亦即相对于当前窗口)
                    let moveX = null;
                    let moveY = null;

                    moveX = _ev.x || _ev.clientX;
                    moveY = _ev.y || _ev.clientY;
                    _this.moveX = moveX;
                    _this.moveY = moveY;
                    console.log('startX: ' + startX, 'startY: ' + startY);
                    console.log('moveX: ' + moveX, 'moveY: ' + moveY);

                    selectBox.style.left = Math.min(moveX, startX) + "px";
                    selectBox.style.top = Math.min(moveY, startY) + "px";
                    selectBox.style.width = Math.abs(moveX - startX) + "px";
                    selectBox.style.height = Math.abs(moveY - startY) + "px";

                    // ---------------- 关键算法 ---------------------  
                    let _l = selectBox.offsetLeft,
                        _t = selectBox.offsetTop;

                    let _w = selectBox.offsetWidth,
                        _h = selectBox.offsetHeight;

                    console.log('selectBox.offsetLeft: ' + _l);
                    console.log('selectBox.offsetTop: ' + _t);
                    console.log('selectBox.offsetWidth: ' + _w);
                    console.log('selectBox.offsetHeight: ' + _h);

                    for (let i = 0; i < selectList.length; i++) {

                        let sl = selectList[i].offsetWidth + selectList[i].offsetLeft;
                        let st = selectList[i].offsetHeight + selectList[i].offsetTop;

                        if (sl > _l && st > _t && selectList[i].offsetLeft < _l + _w && selectList[i].offsetTop < _t + _h) {

                            if (selectList[i].className.indexOf(selectedClass) === -1) {
                                selectList[i].className = selectList[i].className + " " + selectedClass;
                            }

                        } else {

                            console.log('响应');

                            if (selectList[i].className.indexOf(selectedClass) !== -1) {
                                selectList[i].className = selectItemClass;
                            }

                        }

                    }

                }

                // 阻止事件冒泡
                _this._clearEventBubble(_ev);

            })

        },

        // 已选中元素拖动
        _targetDrag: function (target) {

            // let targetItems = document.getElementsByClassName(this.def.selectItemClass);
            // console.log(targetItems);

            let _this = this;

            // 鼠标距离元素左上角偏离值
            let mOffsetX = _this.startX - target.offsetLeft;
            let mOffsetY = _this.startY - target.offsetTop;

            // console.log(target);
            target.addEventListener('mousemove', function (e) {

                let _ev = e || window.event;
                let curTarget = _ev.target || _ev.srcElement;

                let mMoveX = _ev.pageX || _ev.clientX;
                let mMoveY = _ev.pageY || _ev.clientY;
                // let fileNodes = document.getElementsByClassName(selectItemClass);

                // console.log(fileNodes);
                console.log(_ev);
                // console.log(curTarget);
                if (_this.isSelect) {
                    curTarget.style.position = 'absolute';
                    curTarget.style.left = mMoveX - mOffsetX + 'px';
                    curTarget.style.top = mMoveY - mOffsetY + 'px';
                }

            })
        },

        // 鼠标松开事件
        _mouseup: function () {

            let _this = this;

            document.addEventListener('mouseup', function (e) {

                _this.isSelect = false;

                let _ev = e || window.event;
                let target = _ev.target || _ev.srcElement;
                let selectItemClass = _this.def.selectItemClass;
                if (target.className === selectItemClass) {
                    target.className = selectItemClass + " " + _this.def.selectedClass;
                }
                // console.log(_this.selectList);

                if (_this.selectBox) {
                    _this._removeELe(_this.selectBox);
                    _this._showSelDiv(_this.selectList);
                }
                _this.selectList = null,
                    _this.selectBox = null,
                    _this.startX = null,
                    _this.startY = null,
                    _this.moveX = null,
                    _this.moveY = null,
                    e = null;
            })

        },

        // 创建选框
        _createSelectBox: function () {
            let selectBox = document.createElement("div");
            selectBox.id = this.def.selectBoxId;
            selectBox.style.cssText = "display:none;position:absolute;width:0px;height:0px;font-size:0px;margin:0px;padding:0px;border:1px dashed #0099FF;background-color:#C3D5ED;z-index:1000;filter:alpha(opacity:60);opacity:0.6;";
            document.body.appendChild(selectBox);
            return selectBox;
        },

        // 阻止事件冒泡
        _clearEventBubble: function (e) {

            if (e.stopPropagation)
                e.stopPropagation();
            else
                e.cancelBubble = true;

            if (e.preventDefault)
                e.preventDefault();
            else
                e.returnValue = false;

        },

        _showSelDiv: function (arr) {
            let count = 0;
            let selInfo = "";
            for (let i = 0; i < arr.length; i++) {
                if (arr[i].className.indexOf("selected") !== -1) {
                    count++;
                    selInfo += arr[i].innerHTML + "\n";
                }
            }
            console.log("共选择 " + count + " 个文件，分别是：\n" + selInfo);
        },

        // 删除元素节点
        _removeELe: function (ele) {
            if (ele) {
                ele.remove();
            }
        },

        // 类数组对象转化为数组
        _toArray: function (s) {
            let result = [];
            try {
                result = Array.prototype.slice.call(s);
            } catch (error) {
                for (let i = 0; i < s.length; i++) {
                    result.push(fileNodes[i]);
                }
            }
            return result;
        }

    };

    // 将插件对象暴露给全局对象（考虑兼容性）
    _global = (function () {
        return this || (0, eval)('this');
    }());

    if (typeof module !== "undefined" && module.exports) {
        // 兼容CommonJs规范
        module.exports = Eledrag;
    } else if (typeof define === "function" && define.amd) {
        // 兼容AMD/CMD规范
        define(function () {
            return Eledrag;
        });
    } else {
        // 注册全局变量，兼容直接使用script标签引入插件
        !('Eledrag' in _global) && (_global.Eledrag = Eledrag);
    }

}());