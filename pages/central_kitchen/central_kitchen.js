// pages/central_kitchen/central_kitchen.js
// pages/take_meals/take_meals.js
// pages/daren/daren.js
// pages/delinvery_indent/delinvery_indent.js
var app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        urlBefore: app.globalData.urlBefore,
        userInfo: '',
        thisDayDate: '', //今日日期
        selectedActive: 1,
        locationId: 0, // 取餐点id默认0
        lists: [],
        topBarLists: [{
            id: 1,
            type: true,
            text: "警示单",
        }, {
            id: 2,
            type: true,
            text: "备货单",
        }, {
            id: 3,
            type: true,
            text: "预约单",
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
        this.getTakeMealsListsFn()
    },

    /** 获取取餐点. */
    getTakeMealsListsFn() {
        let that = this
        app.appRequest({
            url: '/app/centralKitchen/listLocationByCentralKitchen.action',
            method: 'get',
            success(res) {
                if (res.code == 200) {
                    res.data.forEach(item => { item.checked = false })
                    that.setData({
                        lists: res.data
                    })
                }
                // 隐藏导航栏加载框
                wx.hideNavigationBarLoading();
                // 停止下拉动作
                wx.stopPullDownRefresh();
            }
        })
    },

    /** 获取备货单. */
    getTakeMealReplenishmentOrderFn() {
        let that = this
        app.appRequest({
            url: '/app/centralKitchen/listSupplementOrderByKitchen.action',
            method: 'get',
            getParams: {
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

    /** 获取预约单. */
    getAppointmentData(){
        let that = this
        app.appRequest({
            url: '/app/centralKitchen/listBookOrderByCentralKitchen.action',
            method: 'get',
            success(res){
                if (res.code == 200) {
                    that.setData({
                        lists: res.data
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
    toTakeOrderDetailsFn(e) {
        let that = this
        let itemId = e.currentTarget.dataset.itemid
        wx.navigateTo({
            url: '/pages/take_order_details/take_order_details?itemId=' + itemId,
        })
    },

    /** 处理备货单. */
    solveTakeOrderFn(e){
        let that = this
        let Item = e.currentTarget.dataset.item
        if(Item.status == 0){
            that.setData({
                lists: []
            })
            app.appRequest({
                url: '/app/centralKitchen/updateSupplementOrderByDeal.action',
                method: 'post',
                postData: {
                    id: Item.id,
                    dealUser: wx.getStorageSync("userInfo").id
                },
                success(res){
                    wx.showToast({
                        title: res.message,
                        icon: 'none'
                    })
                    that.getTakeMealReplenishmentOrderFn()
                }
            })
        }
    },

    /** 警告取餐点点击. */
    warningClickFn(e){
        let that = this
        let num = e.currentTarget.dataset.num
        let locationId = e.currentTarget.dataset.locationid
        that.setData({
            selectedActive: 2,
            lists: []
        })
        if(num > 0){
            that.getTakeMealReplenishmentOrderFn()
        }
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
        if (id == 1) {
            this.getTakeMealsListsFn()
        } else if (id == 2) {
            this.getTakeMealReplenishmentOrderFn()
        } else if (id == 3) {
            this.getAppointmentData()
        } else if (id == 4) {

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
        let that = this
        let id = that.data.selectedActive
        // 重置数据列表
        that.setData({
            page: 1,
            lists: [],
        })
        if (id == 1) {
            this.getTakeMealsListsFn()
        } else if (id == 2) {
            this.getTakeMealReplenishmentOrderFn()
        } else if (id == 3){
            this.getAppointmentData()
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
        if (id == 1) {
            that.getTakeMealsOrderFn()
        } else if (id == 2) {
            that.getTakeMealReplenishmentOrderFn()
        } else if (id == 3) {

        }

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {

    }
})