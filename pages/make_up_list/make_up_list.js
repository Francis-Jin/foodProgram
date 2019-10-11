// pages/make_up_list/make_up_list.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        isPopping: false,
        buyNumber: 0,
        isShowOverTime: false
    },

    /** 弹出收回. */
    plus() {
        if (!this.data.isPopping) {
            //弹出
            this.setData({
                isPopping: true
            })
        }
        else {
            //缩回
            this.setData({
                isPopping: false
            });
            // console.log("弹出")
        }
    },

    /** 隐藏弹框 */
    hideOverTime(){
        this.setData({
            isShowOverTime: false
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

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