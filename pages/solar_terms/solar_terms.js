// pages/solar_terms/solar_terms.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        modalShow:true,
        actions: [
            {
                id: 1,
                name: '护肝'
            },
            {
                id: 2,
                name: '减肥'
            },
            {
                id: 3,
                name: '美容'
            }
        ],
        modalTitle: '您的膳食方向',
        directionValue: '',
        directionId: ''
    },
    /** 取消选择. */
    onClose() {
        this.setData({ modalShow: false });
    },

    /** 选择. */
    onSelect(e) {
        this.setData({
            directionValue: e.detail.name,
            directionId: e.detail.id
        })
        wx.redirectTo({
            url: '/pages/start/start?index=true',
        })
    },
    onLoad: function () {
        
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

    }
})