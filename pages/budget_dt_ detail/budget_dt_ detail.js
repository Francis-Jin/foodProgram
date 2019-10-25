// pages/budget_dt_ detail/budget_dt_ detail.js
var app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        info: ''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        console.log(options)
        let that = this
        let itemId = options.itemId
        that.setData({
            itemId: itemId
        })
        that.getDetailsFn()
    },
    
    /** 获取单条收支详细信息. */
    getDetailsFn(){
        let that = this
        app.appRequest({
            url: '/app/userInfo/getUserAccount.action',
            method: 'get',
            getParams: {
                id: that.data.itemId
            },
            success(res){
                if(res.code == 200){
                    that.setData({
                        info: res.data
                    })
                }else{
                    wx.showToast({
                        title: res.message,
                        icon: 'none'
                    })
                }
            }
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