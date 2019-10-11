// pages/settlement/settlement.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        buyNumber:1
    },

    /** 数量加减. */
    addReduceFn(e) {
        let _type = e.currentTarget.dataset.type
        let buyNumber = this.data.buyNumber
        if (_type == 1) {
            // 减
            if (buyNumber == 1) {
                wx.showToast({
                    title: '不可以在减少了哟',
                    icon: 'none'
                })
            } else {
                let reduceNumber = this.data.buyNumber
                reduceNumber--
                this.setData({
                    buyNumber: reduceNumber
                })
            }
        } else {
            // 加
            let addNumber = this.data.buyNumber
            addNumber++
            this.setData({
                buyNumber: addNumber
            })
        }
    },

    /** 页面跳转. */
    toPageFn(){
        wx.navigateTo({
            url: '/pages/order_details/order_details',
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

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