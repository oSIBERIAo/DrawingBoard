var canvas = document.getElementById('board');
var ctx = canvas.getContext('2d')


let canvasHistory = [];
let step = -1;
let currentStep = -1

function setCanvasSize() {
    canvas.height = document.documentElement.clientHeight
    canvas.width = document.documentElement.clientWidth
}
setCanvasSize()

window.onresize = function () {
    setCanvasSize()
    canvasUndo()
    canvasRedo()
}


let preX
let preY
var using = false
var eraserEnabled = false

pen.onclick = function () {
    eraserEnabled = false
    actions.className = "actions"
}
eraser.onclick = function () {
    eraserEnabled = true
    actions.className = "actions x"
}
undo.onclick = function () {
    canvasUndo()
}
redo.onclick = function () {
    canvasRedo()
}
clean.onclick = function () {
    canvasHistory = [];
    step = -1;
    currentStep = -1
    ctx.clearRect(0, 0, canvas.width, canvas.height)
}
save.onclick = function () {
    canvas.toDataURL()
    let link = document.createElement('a');
    link.href = canvas.toDataURL("image/png")
    link.download = getDate()
    document.body.appendChild(link);
    if (document.body.ontouchstart !== undefined) {
      alert('PWA请截图保存')
      window.location.assign(link.href)
    } else {
      link.click();
    }
    document.body.removeChild(link)
}


if(document.body.ontouchstart !== undefined){
    // console.log("移动设备");
    canvas.ontouchstart = function (e) {
        let x = e.touches[0].clientX
        let y = e.touches[0].clientY
        start(x, y)
    }
    canvas.ontouchmove = function (e) {
        let x = e.touches[0].clientX
        let y = e.touches[0].clientY
        move(x, y)
    }
    canvas.ontouchend = function (e) {
        using = false
        canvasDraw()
    } 
} else {
    // console.log("PC");
    canvas.onmousedown = function (e) {
        let x = e.clientX
        let y = e.clientY
        start(x, y)
    }
    canvas.onmousemove = function (e) {
        let x = e.clientX
        let y = e.clientY
        move(x, y)
    }
    canvas.onmouseup = function () {
        end() 
    }
}
////
function start(x, y) {
    using = true
    if (eraserEnabled) {
        ctx.clearRect(x, y, 10, 10)
    } else {
        preX = x
        preY = y
        draw(preX, preY, preX, preY);
    }
}
function move(x, y) {
    if (!using) { return }
    if (eraserEnabled) {
        ctx.clearRect(x, y, 10, 10)
    } else {
        draw(preX, preY, x, y);
        preX = x
        preY = y
    }
}
function end() {
    using = false
    canvasDraw()
}

//工具函数
function draw(preX, preY, x, y) {
    ctx.beginPath();
    ctx.lineWidth = 6
    if (size.value != undefined) {
        ctx.lineWidth = size.value
    }
    ctx.moveTo(preX, preY);
    ctx.lineTo(x, y);
    ctx.closePath();

    let color
    color = document.querySelector(".color")
    try {
        console.log(color.value);
    } catch (e) {
        color = document.querySelector(".jscolor")
    }
    ctx.strokeStyle = color.value;
    ctx.stroke();
}
function canvasDraw() {
    step++;
    currentStep++
    console.log('currentStep', currentStep);
    if (step < canvasHistory.length) {
        canvasHistory.length = step; // 截断数组
    }
    canvasHistory.push(canvas.toDataURL());
    console.log('canvasDraw', canvasHistory)
}
function canvasUndo() {
    if (step >= 0) {
        // step--;
        currentStep--
        console.log('currentStep', currentStep);
        step = currentStep
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        let canvasPic = new Image();
        canvasPic.src = canvasHistory[currentStep];
        canvasPic.addEventListener('load', () => {
            ctx.drawImage(canvasPic, 0, 0);
        });
    } else {
        console.log('不能再继续撤销了');
    }
}
function canvasRedo() {
    if (currentStep + 2 > canvasHistory.length) {
        return
    }
    if (currentStep + 1 == canvasHistory.length && currentStep != 0 && currentStep != -1) {
        console.log('已经是最后一步');
        return
    }
    if (step >= 0 || currentStep == 0 || currentStep == -1) {
        currentStep++
        step = currentStep
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let canvasPic = new Image();
        canvasPic.src = canvasHistory[currentStep];
        canvasPic.addEventListener('load', () => {
            ctx.drawImage(canvasPic, 0, 0);
        });
    }
}

function getDate(params) {
    var date = new Date();
    Y = date.getFullYear() + '-';
    M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
    D = date.getDate() + ' ';
    h = date.getHours() + ':';
    m = date.getMinutes() + ':';
    s = date.getSeconds();
    console.log(Y + M + D + h + m + s);
    return Y + M + D + h + m + s
}






// 初始化
function isBrowser() {
    var explorer = window.navigator.userAgent;
    if (explorer.indexOf("Chrome") >= 0) {
        return
    }
    //判断是否为Safari浏览器
    else if (explorer.indexOf("Safari") >= 0){
        var parent = document.getElementById("actions");
        var child = document.getElementById("color");
        // var WidthSet = document.getElementById("size");
        // WidthSet.setAttribute('class', "WidthSet")
        parent.removeChild(child)
        var jscolor = document.createElement("input");
        jscolor.setAttribute('class', "jscolor")
        jscolor.setAttribute('value', "000000")
        parent.appendChild(jscolor)
        let script = document.createElement('script');
        script.src = "jscolor.js" //加载Safari色盘
        document.body.appendChild(script)
        return 'Safari';
    }
}
isBrowser() 

window.onload = function () {
    //阻止缩放
    document.addEventListener('touchstart', function (event) {
        if (event.touches.length > 1) {
            event.preventDefault();
        }
    });
    var lastTouchEnd = 0;
    document.addEventListener('touchend', function (event) {
        var now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
    document.addEventListener('gesturestart', function (event) {
        event.preventDefault();
    });
    //阻止默认的处理方式(阻止下拉滑动的效果)
    document.body.addEventListener('touchmove', function (e) {
        e.preventDefault();
    }, { passive: false });
}
