//index.js

const app = getApp()
var timer = null
Page({

    /**
     * 页面的初始数据
     */
    data: {
        hourDeg: 0,
        minuteDeg: 0,
        secondDeg: 0,
        value: 4.5,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.clockFn()
        timer = setInterval(this.clockFn,1000);
    },

    /** 时钟 */
    clockFn(){
        let that = this;
        //(b-1)拿到时间对象
        var oDate = new Date();
        //(b-2)拿到此时的时间
        var iSec = oDate.getSeconds();
        var iMin = oDate.getMinutes() + iSec / 60;
        var iHour = oDate.getHours() + iMin / 60;
        that.setData({
            hourDeg: iHour * 30,
            minuteDeg: iMin * 6,
            secondDeg: iSec * 6
        })
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {
        // clearInterval(timer)
    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})