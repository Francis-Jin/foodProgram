// pages/start/start.js
Page({

    /**
     * 页面的初始数据
     */
    data: {

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        let that = this
        this.setData({
            index:options.index
        })
        setTimeout(function(){
            that.bindload();
        },100)
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

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {

    },

    bindload: function() {
        setTimeout(this.goIndex, 2000)
    },
    // 跳转至首页
    goIndex: function() {
        if (this.data.index == 'true') {
            wx.switchTab({
                url: '/pages/index/index'
            })
        } else {
            wx.redirectTo({
                url: '/pages/login/login',
            })
        }

    }
})