// pages/take_order_details/take_order_details.js
var app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        info: '',
        urlBefore: app.globalData.urlBefore,
        lists: []
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.setData({
            itemId: options.itemId
        })
        this.getDataFn()
    },

    /** 获取补货单详情. */
    getDataFn(){
        let that = this
        app.appRequest({
            url:'/app/orderInfo/getSupplementOrderById.action',
            method: 'get',
            getParams: {
                id: that.data.itemId
            },
            success(res){
                if(res.code == 200){
                    if (res.data.detail){
                        that.setData({
                            info:res.data,
                            lists: res.data.detail
                        })
                    }
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