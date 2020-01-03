// pages/take_meals/take_meals.js
// pages/daren/daren.js
// pages/delinvery_indent/delinvery_indent.js
var app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        userInfo: '',
        thisDayDate: '', //今日日期
        selectedActive: 1,
        lists: [],
        searchVal: '',
        topBarLists: [{
            id: 1,
            type: true,
            text: "即时订单",
        }, {
            id: 2,
            type: true,
            text: "已完成订单",
        }, {
            id: 3,
            type: true,
            text: "备货单",
        }],
        page: 1,
        pageSize: 10
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.getThisDayDate()
        this.setData({
            userInfo: wx.getStorageSync('userInfo')
        })
        this.getTakeMealsOrderFn()
    },

    /** 获取取餐点订单. */
    getTakeMealsOrderFn(){
        let that = this
        app.appRequest({
            url: '/app/orderInfo/listOrderInfoVoByLocation.action',
            method: 'get',
            getParams: {
                type: that.data.selectedActive,
                locationId: wx.getStorageSync('userInfo').locationId,
                page: that.data.page,
                rows: that.data.pageSize,
                takeMealCode: that.data.searchVal
            },
            success(res){
                if(res.code == 200){
                    if (res.data){
                        let lists = that.data.lists
                        that.setData({
                            lists: lists.concat(res.data)
                        })
                    }
                }else{
                    wx.showToast({
                        title: res.message,
                        icon: 'none'
                    })
                }

                // 隐藏导航栏加载框
                wx.hideNavigationBarLoading();
                // 停止下拉动作
                wx.stopPullDownRefresh();
            }
        })
    },

    /** 查看取餐点补货单详情. */  
    toTakeOrderDetailsFn(e){
        let that = this
        let itemId = e.currentTarget.dataset.itemid
        wx.navigateTo({
            url: '/pages/take_order_details/take_order_details?itemId=' + itemId,
        })
    },

    /** 获取取餐点补货单. */
    getTakeMealReplenishmentOrderFn(){
        let that = this
        app.appRequest({
            url: '/app/orderInfo/listSupplementOrderByLocation.action',
            method: 'get',
            getParams: {
                locationId: wx.getStorageSync('userInfo').locationId,
                page: that.data.page,
                rows: that.data.pageSize
            },
            success(res) {
                if (res.code == 200) {
                    if (res.data) {
                        let lists = that.data.lists
                        that.setData({
                            lists: lists.concat(res.data)
                        })
                    }
                } else {
                    wx.showToast({
                        title: res.message,
                        icon: 'none'
                    })
                }

                // 隐藏导航栏加载框
                wx.hideNavigationBarLoading();
                // 停止下拉动作
                wx.stopPullDownRefresh();
            }
        })
    },

    /** 点击已备好或已取餐 */
    clickModalFn(e){
        console.log(e)
        let that = this
        let orderid = e.currentTarget.dataset.orderid
        let status = e.currentTarget.dataset.status
        let type = e.currentTarget.dataset.type
        let str = ''
        if(type == 1) str = '已备好'
        if(type == 2) str = '已取餐'
        if(status != type) return false
        wx.showModal({
            content: '确认' + str + '?',
            confirmColor: '#5FC5E0',
            success: function(){
                if(type == 1){
                    that.updateReadyFn(orderid)
                }
                if(type == 2){
                    that.updateTakeMealsFn(orderid)
                }
            }
        })
    },

    /** 调用已备好. */
    updateReadyFn(orderId){
        let that = this
        app.appRequest({
            url: '/app/orderInfo/updateOrderInfoLocationReady.action',
            method: 'post',
            postData: {
                orderId: orderId
            },
            success(res){
                if(res.code == 200){
                    that.getTakeMealsOrderFn()
                }else{
                    wx.showToast({
                        title: res.message,
                        icon: 'none'
                    })
                }
            }
        })
    },

    /** 调用已取餐. */
    updateTakeMealsFn(orderId) {
        let that = this
        app.appRequest({
            url: '/app/orderInfo/updateOrderInfoLocationTakeMeal.action',
            method: 'post',
            postData: {
                orderId: orderId
            },
            success(res) {
                if (res.code == 200) {
                    that.getTakeMealsOrderFn()
                } else {
                    wx.showToast({
                        title: res.message,
                        icon: 'none'
                    })
                }
            }
        })
    },

    /** 拨打配送员电话. */
    callTelFn(e) {
        console.log(e)
        let tel = e.currentTarget.dataset.tel
        wx.makePhoneCall({
            phoneNumber: tel,
        })
    },

    /** 获取今日日期 */
    getThisDayDate() {
        let date = new Date()
        let y = date.getFullYear()
        let m = date.getMonth() + 1
        let d = date.getDate()
        this.setData({
            thisDayDate: y + '-' + m + '-' + d
        })
    },


    /** 顶部tab切换. */
    onSwitchTabFn(e) {
        let that = this
        let item = e.currentTarget.dataset.item
        let id = item.id
        // 重置数据列表
        that.setData({
            page: 1,
            lists: [],
            selectedActive: id
        })
        if (id == 1 || id == 2) {
            that.getTakeMealsOrderFn()
        } else if (id == 3) {
            that.getTakeMealReplenishmentOrderFn()
        }
    },

    /** 搜索数据. */
    searchDataFn(e){
        console.log(e)
        let searchVal = e.detail
        this.setData({
            searchVal: searchVal,
            lists: []
        })

        this.getTakeMealsOrderFn()
    },

    /** 跳转添加补货单页面. */
    addTakeOrderFn(){
        wx.navigateTo({
            url: '/pages/take_add_order/take_add_order',
        })
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
        let selectedActive = this.data.selectedActive
        this.setData({
            lists: []
        })
        if (selectedActive == 3){
            this.getTakeMealReplenishmentOrderFn()
        }
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
        let that = this
        let id = that.data.selectedActive
        // 重置数据列表
        that.setData({
            page: 1,
            lists: [],
        })
        if (id == 1 || id == 2) {
            that.getTakeMealsOrderFn()
        }  else if (id == 3) {
            that.getTakeMealReplenishmentOrderFn()
        } 
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {
        let that = this
        let id = that.data.selectedActive
        let page = that.data.page
        page++
        this.setData({
            page: page
        })
        if (id == 1 || id == 2) {
            that.getTakeMealsOrderFn()
        }  else if (id == 3) {
            that.getTakeMealReplenishmentOrderFn()
        }
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {

    }
})