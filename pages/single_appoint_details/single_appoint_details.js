// pages/single_appoint_details/single_appoint_details.js
var app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        page: 1,
        pageSize: 10,
        username: '',
        lists: [],
        appointName: '',
        appointShow: false,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        let userid = options.userid
        let username = options.username
        this.setData({
            userId: userid,
            username: username
        })
        this.listDeliveryGroupOrderByPerson()
    },

    /** 获取个人接单数据. */
    listDeliveryGroupOrderByPerson() {
        let that = this
        app.appRequest({
            url: '/app/deliveryGroupOrder/listDeliveryGroupOrderByPerson.action',
            method: "GET",
            getParams: {
                userId: that.data.userId,
                page: that.data.page,
                rows: that.data.pageSize
            },
            success(res) {
                // 隐藏导航栏加载框
                wx.hideNavigationBarLoading();
                // 停止下拉动作
                wx.stopPullDownRefresh();
                if (res.data) {
                    that.setData({
                        lists: that.data.lists.concat(res.data)
                    })
                }
            }
        })
    },

    /** 隐藏当日收益上拉狂. */
    onClose() {
        this.setData({
            appointShow: false,
            todayProfitShow: false
        })
    },

    /** 个人订单点击 */
    personAppointFn(e) {
        let userId = this.data.userId
        if(userId == wx.getStorageSync("userInfo").id){
            let name = e.currentTarget.dataset.item
            let orderid = e.currentTarget.dataset.orderid
            this.setData({
                orderId: orderid,
                appointName: name,
                appointShow: true
            })
        }else{
            wx.showToast({
                title: '只能操作自己的订单',
                icon: 'none'
            })
        }
    },

    /** 确认指派. */
    confirmAppointFn() {
        let that = this
        let orderId = this.data.orderId
        let appointName = this.data.appointName
        let reportErrorText = this.data.reportErrorText
        if (appointName == '取餐') {
            app.appRequest({
                url: '/app/deliveryGroupOrder/updateOrderInfoTakeTime.action',
                method: 'post',
                postData: {
                    orderId: orderId
                },
                success(res) {
                    that.setData({
                        lists: [],
                        page: 1,
                        appointShow: false
                    })
                    that.listDeliveryGroupOrderByPersonFn()
                }
            })
        } else if (appointName == '送达') {
            app.appRequest({
                url: '/app/deliveryGroupOrder/updateOrderInfoDeliveryTime.action',
                method: 'post',
                postData: {
                    orderId: orderId
                },
                success(res) {
                    that.setData({
                        lists: [],
                        page: 1,
                        appointShow: false
                    })
                    that.listDeliveryGroupOrderByPersonFn()
                }
            })
        } else if (appointName == '出错') {
            app.appRequest({
                url: '/app/deliveryGroupOrder/updateOrderInfoProblem.action',
                method: 'POST',
                postData: {
                    orderId: orderId,
                    userId: wx.getStorageSync("userInfo").id,
                    problem: reportErrorText
                },
                success(res) {
                    that.setData({
                        lists: [],
                        page: 1,
                        appointShow: false
                    })
                    that.listDeliveryGroupOrderByPersonFn()
                }
            })
        } else if (appointName == '处理') {
            app.appRequest({
                url: '/app/deliveryGroupOrder/updateOrderInfoProblemDeal.action',
                method: 'post',
                postData: {
                    orderId: orderId,
                    userId: wx.getStorageSync("userInfo").id,
                    problemDeal: reportErrorText
                },
                success(res) {
                    that.setData({
                        lists: [],
                        page: 1,
                        appointShow: false,
                        groupLeaderProblemLists: []
                    })
                    that.getGroupLeaderProblemLists()
                }
            })
        } else {
            this.setData({
                appointShow: false
            })
        }
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {

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
            lists: []
        })
        this.listDeliveryGroupOrderByPerson()
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {
        let that = this
        let page = that.data.page
        page++
        that.setData({
            page: page
        })
        that.listDeliveryGroupOrderByPerson()
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {

    }
})