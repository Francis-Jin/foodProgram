// pages/order/order.js
var app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        page: 1,
        pageSize: 10,
        orderLists: [],
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        this.setData({
            page: 1,
            pageSize: 10,
            orderLists: []
        })
        this.getOrderLists()
    },

    /** 获取用户订单列表. */
    getOrderLists() {
        let that = this
        app.appRequest({
            url: "/app/orderInfo/listOrderInfoByUser.action",
            method: 'get',
            getParams: {
                "userId": wx.getStorageSync("userInfo").id,
                "page": that.data.page,
                "rows": that.data.pageSize
            },
            success(res) {
                console.log(res)
                if (res.data) {
                    that.setData({
                        orderLists: that.data.orderLists.concat(res.data)
                    })
                }
                // 隐藏导航栏加载框
                wx.hideNavigationBarLoading();
                // 停止下拉动作
                wx.stopPullDownRefresh();
            }
        })
    },

    /** 查看订单详情. */
    toDeailsFn(e) {
        let orderId = e.currentTarget.dataset.id
        wx.navigateTo({
            url: '/pages/order_details/order_details?orderId=' + orderId,
        })
    },

    /** 去支付 */
    payOrder(e) {
        let orderId = e.currentTarget.dataset.id
        app.appRequest({
            url: "/app/orderInfo/payFee.action",
            method: "post",
            postData: {
                orderId: orderId,
                unionId: wx.getStorageSync("userInfo").unionId
            },
            success(res) {
                console.log(res)
                let str = JSON.parse(res.data)
                console.log(str)
                wx.requestPayment({
                    timeStamp: str.timeStamp,
                    nonceStr: str.nonceStr,
                    package: str.package,
                    signType: str.signType,
                    paySign: str.paySign,
                    success(res) {
                        wx.navigateTo({
                            url: '/pages/order_details/order_details?orderId=' + orderId,
                        })
                    },
                    fail(err) {
                        console.log(err)
                        wx.showModal({
                            title: '提示',
                            content: '支付失败',
                            showCancel: false,
                            confirmColor: "#5bcbc8"
                        })
                    }
                })
            }
        })
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {
        // 显示顶部刷新图标
        wx.showNavigationBarLoading();
        this.setData({
            page: 1,
            pageSize: 10,
            orderLists: []
        })
        this.getOrderLists()
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {
        let that = this
        let page = that.data.page
        page++
        this.setData({
            page: page
        })
        that.getOrderLists()
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {

    }
})