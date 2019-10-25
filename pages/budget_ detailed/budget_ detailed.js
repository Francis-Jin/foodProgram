// pages/budget_ detailed/budget_ detailed.js
var app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        lists: [],
        page: 1,
        rows: 10
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.getDetailsFn()
    },

    /** 获取收支明细列表. */
    getDetailsFn(){
        let that = this
        wx.showLoading({
            title: '加载中',
        })
        app.appRequest({
            url: '/app/userInfo/listUserAccount.action',
            method: 'get',
            getParams: {
                userId: wx.getStorageSync('userInfo').id,
                page: that.data.page,
                rows: that.data.rows
            },
            success(res){
                wx.hideLoading()
                if(res.code == 200){
                    that.setData({
                        lists: that.data.lists.concat(res.data)
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

    /** 跳转查看收支详细. */
    toBudgetDetailsFn(e){
        let itemId = e.currentTarget.dataset.itemid
        wx.navigateTo({
            url: '/pages/budget_dt_ detail/budget_dt_ detail?itemId=' + itemId,
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
        let that = this
        let page = that.data.page
        page++
        that.setData({
            page: page
        })
        setTimeout(function(){
            that.getDetailsFn()
        },300)
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})