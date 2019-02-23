const HEIGHT = 500 //图片高度
const WIDTH = 700 //图片宽度
const REFRESH_TIME = 0.1 //从video获取图片的刷新间隔，单位秒 s

let video, canvas;

//在页面加载完成之后调用
window.addEventListener("load", async () => {

    //初始化video，canvas的长宽
    initMediaSize()

    //获取视频流的blob url（该过程是异步的）
    const stream = await getVideoStream()

    //将blob url作用到video中并播放，最后返回video 的dom元素
    const video = initVideo(stream)

    //设置定时器获取灰度图片
    refreshCanvas(video)
})

/**
 * 用js文件开头的常量初始化video和canvas,
 * 若没有找到video或者canvas则创建一下
 */
function initMediaSize() {
    video = document.querySelector("#video")
    if (!video) {
        video = document.createElement("video")
        video.id = "video"
    }
    video.width = WIDTH
    video.height = HEIGHT
    //设置video中视频默认铺满整个元素，若去掉视频则会按原比例显示
    video.style.objectFit = 'fill'

    canvas = document.querySelector("#canvas")
    if (!canvas) {
        canvas = document.createElement("canvas")
        canvas.id = "canvas"
    }
    canvas.width = WIDTH
    canvas.height = HEIGHT
}

/**
 * 用浏览器的api获取视频流（异步的），并返回
 */
async function getVideoStream() {
    const streamConfig = {
        audio: false,
        video: {
            facingMode: 'user'
        }
    }
    let stream = await navigator.mediaDevices.getUserMedia(streamConfig)
    return stream
}

/**
 * 将视频流作为video的信号源，并将video返回
 * @param {MediaStream} stream 
 */
function initVideo(stream) {
    video.src = window.URL.createObjectURL(stream)
    video.play()
    return video
}

/**
 * 设置定时器定时获取视频当前的图片并处理成灰度图
 * @param {videoDOM} video 
 */
function refreshCanvas(video) {
    const ctx = canvas.getContext("2d")

    //定时器每次调用的函数
    const printCanvas = () => {

        //先将当前视频流的画面画进canvas
        ctx.drawImage(video, 0, 0, WIDTH, HEIGHT)

        //获取当前canvas每个像素的颜色信息
        let colorData = ctx.getImageData(0, 0, WIDTH, HEIGHT).data

        //新建一个画板，灰度的数据都将画到这个画板上
        let grayImg = ctx.createImageData(WIDTH, HEIGHT)

        //遍历每个像素的rgba值，分别对应关系是 i->R i+1->B i+2->A i+3->alpha（透明度）
        for (let i = 0; i < colorData.length; i += 4) {

            //获取每个像素点的灰度值
            let gray = parseInt(colorData[i] * 0.3 + colorData[i + 1] * 0.59 + colorData[i + 2] * 0.11);

            //将灰度值渲染到灰度画板上
            grayImg.data[i] = gray
            grayImg.data[i + 1] = gray
            grayImg.data[i + 2] = gray
            grayImg.data[i + 3] = 255
        }

        //将灰度画板画进canvas
        ctx.putImageData(grayImg, 0, 0);
    }

    //设置定时器并在页面关闭时将其销毁
    let interval = setInterval(printCanvas, REFRESH_TIME * 1000)
    window.addEventListener("close", () => {
        clearInterval(interval)
    })

}