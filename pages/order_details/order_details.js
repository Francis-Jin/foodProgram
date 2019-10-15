// pages/order_details/order_details.js
var app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        urlBefore: app.globalData.urlBefore,
        detailsInfo: '' 
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let orderId = options.orderId
        this.getOrderDetailsFn(orderId)
        this.getSysConfFn()
    },

    /** 获取配置信息. */
    getSysConfFn() {
        let that = this
        let cartLists = wx.getStorageSync('cartLists')
        let quantityAll = 0
        let deliveryCost = 0
        app.appRequest({
            url: '/app/sysConf/getSysConf.action',
            method: 'get',
            success(res) {
               that.setData({
                    systemInfo: res.data
                })
            }
        })
    },

    /** 获取订单详情. */
    getOrderDetailsFn(orderId){
        let that = this
        app.appRequest({
            url: "/app/orderInfo/orderInfoDetail.action",
            method: "get",
            getParams: {
                orderId: orderId
            },
            success(res){
                that.setData({
                    detailsInfo: res.data
                })
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