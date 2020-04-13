//用闭包形式来写，前面加; 是防止跟其他js压缩时报错
//undefined  防止出现undefined问题
;
(function (undefined) {

    //开启严格模式
    "use strict";

    var _global;

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
            for (var key in n) {
                if (n.hasOwnProperty(key) && (!o.hasOwnProperty(key) || override)) {
                    o[key] = n[key];
                }
            }
            return o;
        },

        // 初始化配置
        _init: function (opt) {

            var _this = this;

            // 默认参数 和 初始化 暴露的内部方法
            var def = {
                selectBoxId: 'selectBox',
                itemIndex: 'index',
                itemCLass: 'fileDiv',
                itemSelectedCLass: 'selected'
            };

            // 配置参数
            _this.def = _this._extend(def, opt, true);

            // 鼠标按下
            _this._addEvent(document, 'mousedown', function (e) {

                _this.isSelect = true;

                var _ev = e || window.event;
                var target = _ev.target || _ev.srcElement;
                _this.target = target;

                // var selectBoxId = _this.def.selectBoxId;
                var itemCLass = _this.def.itemCLass;
                var itemSelectedCLass = _this.def.itemSelectedCLass;

                // 浏览器可视区域宽高
                var clientSize = _this._clientSize();
                // console.log(clientSize);

                // 当元素被选中时，鼠标在页面上可拖动范围边界限制
                _this.minOffsetLeft = 0;
                _this.maxOffsetLeft = clientSize.width - target.offsetWidth;
                _this.minOffsetTop = 0;
                _this.maxOffsetTop = clientSize.height - target.offsetHeight;

                // 鼠标指针开始点击位置相对于父文档的 x/y 像素坐标(亦即相对于当前窗口)
                _this.startX = _ev.x || _ev.clientX;
                _this.startY = _ev.y || _ev.clientY;

                // 只有在被选中的元素之外点击和拖动才有效
                if (target.className.indexOf(itemSelectedCLass) === -1) {

                    // 如果存在旧的选框元素节点，则先清除
                    // _this._removeELe(document.getElementById(selectBoxId));

                    _this.selectList = [];
                    var fileNodes = document.querySelectorAll('.' + itemCLass);
                    // console.log(fileNodes);
                    for (var i = 0; i < fileNodes.length; i++) {
                        if (fileNodes[i].className.indexOf(itemCLass) !== -1) {
                            fileNodes[i].className = itemCLass;
                            _this.selectList.push(fileNodes[i]);
                        }
                    }

                    _this.selectBox = _this._createSelectBox(); // 创建选框元素

                    _this._targetSelect(); // 选中目标元素

                } else {

                    _this._targetDrag(); // 已选中元素拖拽

                }

                _this._mouseup(); // 鼠标松开

                _this._clearEventBubble(_ev); // 阻止事件冒泡

            })

        },

        // 选中目标元素
        _targetSelect: function () {

            var _this = this;

            _this._addEvent(document, 'mousemove', function (e) {

                var _ev = e || window.event;

                if (_this.isSelect) {

                    var selectBox = _this.selectBox; // 选框元素
                    var selectList = _this.selectList; // 可拖拽元素数组集合
                    var itemCLass = _this.def.itemCLass; // 可拖拽元素class标识
                    var itemSelectedCLass = _this.def.itemSelectedCLass; // 被选中元素附加样式

                    (selectBox.style.display === "none") && (selectBox.style.display = "block");

                    // 鼠标开始点击位置相对于父文档的 x/y 像素坐标(亦即相对于当前窗口)
                    var startX = _this.startX;
                    var startY = _this.startY;

                    // 鼠标当前的位置相对于父文档的 x/y 像素坐标(亦即相对于当前窗口)
                    var moveX = null;
                    var moveY = null;

                    moveX = _ev.pageX || _ev.clientX;
                    moveY = _ev.pageY || _ev.clientY;
                    _this.moveX = moveX;
                    _this.moveY = moveY;
                    // console.log('startX: ' + startX, 'startY: ' + startY);
                    // console.log('moveX: ' + moveX, 'moveY: ' + moveY);

                    selectBox.style.left = Math.min(moveX, startX) + "px";
                    selectBox.style.top = Math.min(moveY, startY) + "px";
                    selectBox.style.width = Math.abs(moveX - startX) + "px";
                    selectBox.style.height = Math.abs(moveY - startY) + "px";

                    // ---------------- 关键算法 ---------------------  
                    var _l = selectBox.offsetLeft,
                        _t = selectBox.offsetTop;

                    var _w = selectBox.offsetWidth,
                        _h = selectBox.offsetHeight;

                    for (var i = 0; i < selectList.length; i++) {

                        var sl = selectList[i].offsetWidth + selectList[i].offsetLeft;
                        var st = selectList[i].offsetHeight + selectList[i].offsetTop;

                        if (sl > _l && st > _t && selectList[i].offsetLeft < _l + _w && selectList[i].offsetTop < _t + _h) {

                            if (selectList[i].className.indexOf(itemSelectedCLass) === -1) {
                                selectList[i].className = selectList[i].className + " " + itemSelectedCLass;
                            }

                        } else {

                            if (selectList[i].className.indexOf(itemSelectedCLass) !== -1) {
                                selectList[i].className = itemCLass;
                            }

                        }

                    }

                }

                _this._clearEventBubble(_ev);

            })

        },

        // 已选中元素拖动
        _targetDrag: function () {

            var _this = this;
            var target = _this.target;

            var itemIndex = _this.def.itemIndex; // 页面可拖拽元素的index索引，可自定义属性名
            var itemSelectedCLass = _this.def.itemSelectedCLass; // 被选中元素附加样式
            var selectedItemList = _this.selectedItemList; // 被选中元素数组集合
            // console.log(selectedItemList);

            // 鼠标距离当前被拖动元素左上角的偏离值
            var mItemOffsetX = _this.startX - target.offsetLeft;
            var mItemOffsetY = _this.startY - target.offsetTop;


            _this._addEvent(target, 'mousemove', function (e) {

                var _ev = e || window.event;
                // console.log(_ev);

                // 鼠标当前的位置相对于父文档的 x/y 像素坐标(亦即相对于当前窗口)
                var mMoveX = _ev.pageX || _ev.clientX;
                var mMoveY = _ev.pageY || _ev.clientY;

                if (_this.isSelect && (target.className.indexOf(itemSelectedCLass) !== -1)) {

                    target.style.position = 'absolute';

                    // 鼠标指针所在元素相对于父文档的 x/y 像素坐标
                    var itemOffsetX = mMoveX - mItemOffsetX;
                    var itemOffsetY = mMoveY - mItemOffsetY;
                    
                    // 元素拖动边界限制
                    if(itemOffsetX < _this.minOffsetLeft){
                        itemOffsetX = _this.minOffsetLeft;
                    } else if (itemOffsetX > _this.maxOffsetLeft) {
                        itemOffsetX = _this.maxOffsetLeft;
                    }
    
                    if(itemOffsetY < _this.minOffsetTop){
                        itemOffsetY = _this.minOffsetTop;
                    } else if (itemOffsetY > _this.maxOffsetTop) {
                        itemOffsetY = _this.maxOffsetTop;
                    }
                    
                    target.style.left = itemOffsetX + 'px';
                    target.style.top = itemOffsetY + 'px';

                    if (selectedItemList.length > 0) {
                        for (var i = 0; i < selectedItemList.length; i++) {

                            var item = selectedItemList[i];

                            // 当前鼠标不在其上的其它被拖动元素
                            if ((item.index !== target.getAttribute(itemIndex)) && (item.className.indexOf(itemSelectedCLass) !== -1)) {

                                // 鼠标距离当前其它被拖动元素左上角的偏离值
                                // startOffsetLeft：未拖拽前，元素相对于父文档的 x 像素坐标
                                // startOffsetTop：未拖拽前，元素相对于父文档的 y 像素坐标
                                var mOtherItemOffsetX = _this.startX - item.startOffsetLeft;
                                var mOtherItemOffsetY = _this.startY - item.startOffsetTop;

                                // 其他被拖动元素相对于父文档的 x/y 像素坐标
                                var otherItemOffsetX = mMoveX - mOtherItemOffsetX;
                                var otherItemOffsetY = mMoveY - mOtherItemOffsetY;

                                item.style.position = 'absolute';
                                item.style.left = otherItemOffsetX + 'px';
                                item.style.top = otherItemOffsetY + 'px';
                            }
                        }
                    }
                }

                _this._clearEventBubble(_ev);

            })

        },

        // 鼠标松开事件
        _mouseup: function () {

            var _this = this;

            _this._addEvent(document, 'mouseup', function (e) {

                _this.isSelect = false;

                var target = _this.target;

                var itemCLass = _this.def.itemCLass;
                (target.className === itemCLass) && (target.className = itemCLass + " " + _this.def.itemSelectedCLass);

                if (_this.selectBox) {
                    _this._removeNode(_this.selectBox);
                    _this.selectedItemList = _this._getSelectedItemList();
                    console.log(_this.selectedItemList);
                }

                // _this.selectList = null,
                // _this.selectBox = null,
                // _this.startX = null,
                // _this.startY = null,
                // _this.moveX = null,
                // _this.moveY = null,
                // e = null;

            })

        },

        // 创建选框
        _createSelectBox: function () {

            var selectBox = document.createElement("div");
            selectBox.id = this.def.selectBoxId;
            selectBox.style.cssText = "display:none;position:absolute;width:0px;height:0px;font-size:0px;margin:0px;padding:0px;border:1px dashed #0099FF;background-color:#C3D5ED;z-index:1000;filter:alpha(opacity:60);opacity:0.6;";
            document.body.appendChild(selectBox);
            return selectBox;

        },

        // 获取已选中目标元素
        _getSelectedItemList: function () {

            var itemIndex = this.def.itemIndex;
            var selectList = this.selectList;
            var selectedItemList = [];

            if (selectList.length > 0) {
                for (var i = 0; i < selectList.length; i++) {
                    if (selectList[i].className.indexOf(this.def.itemSelectedCLass) !== -1) {
                        selectList[i][itemIndex] = selectList[i].getAttribute(itemIndex);
                        // 保存元素在页面上的初始偏离页面左上角坐标，在拖拽时会用到这些值
                        selectList[i]['startOffsetLeft'] = selectList[i].offsetLeft;
                        selectList[i]['startOffsetTop'] = selectList[i].offsetTop;
                        selectedItemList.push(selectList[i]);
                    }
                }
            }

            return selectedItemList;

        },

        // 事件监听兼容性写法，兼容IE6、7、8
        _addEvent: function (ele, ev, fn) {

            // 判断浏览器是否支持该方法，如果支持那么调用，如果不支持换其他方法
            if (ele.addEventListener) {
                ele.addEventListener(ev, fn);
            } else if (ele.attachEvent) {
                ele.attachEvent("on" + ev, fn);
            } else {
                ele["on" + ev] = fn;
            }

        },

        _removeEvent: function (ele, ev, fn) {

            if (ele.removeEventListener) {
                ele.removeEventListener(ev, fn);
            } else if (ele.detachEvent) {
                ele.detachEvent("on" + ev, fn);
            } else {
                ele["on" + ev] = null;
            }

        },

        // 阻止事件冒泡
        _clearEventBubble: function (e) {

            // if (e.stopPropagation) // 非IE 
            //     e.stopPropagation();
            // else
            //     e.cancelBubble = true;

            // if (e.preventDefault)
            //     e.preventDefault();
            // else
            //     e.returnValue = false;

            e.stopPropagation && e.stopPropagation() || (e.cancelBubble = true);

            e.preventDefault && e.preventDefault() || (e.returnValue = false);

        },

        // 删除元素节点
        _removeNode: function (ele) {

            if (!this._isIE()) {
                ele && ele.remove()
            } else {
                ele && ele.parentNode.removeChild(ele);
            }

        },

        _isIE: function () {

            return ((window.ActiveXObject || "ActiveXObject" in window) || (/Trident\/7\./).test(navigator.userAgent)) && true || false;

        },

        // 获取浏览器可视区域宽高
        _clientSize() {

            return {
                width: window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
                height: window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
            }

        },

        // 获取元素宽高
        _elementSize(ele) {

            return {
                width: ele.clientWidth || parseInt(getComputedStyle(ele)['width']),
                height: ele.clientHeight || parseInt(getComputedStyle(ele)['height'])
            }

        },


        // 类数组对象转化为数组
        _toArray: function (s) {

            var result = [];

            try {
                result = Array.prototype.slice.call(s);
            } catch (error) {
                for (var i = 0; i < s.length; i++) {
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