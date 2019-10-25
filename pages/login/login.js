// pages/login/login.js
var app = getApp()
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

    },

    getUserInfo: function(e) {
        let that = this
        console.log(e)
        let encryptedData = e.detail.encryptedData
        let iv = e.detail.iv
        if (e.detail.errMsg == 'getUserInfo:ok') {
            /** 登录 */
            wx.showLoading({
                title: '授权登录中',
            })
            wx.login({
                success: function(res) {
                    let code = res.code
                    app.appRequest({
                        url: '/app/userInfo/login.action',
                        method: "post",
                        postData: {
                            "code": code,
                            "encryptedData": encryptedData,
                            "iv": iv
                        },
                        success(res) {
                            wx.hideLoading()
                            if (res.code == 200) {
                                if (res.data.homeplace){
                                    wx.redirectTo({
                                        url: '/pages/solar_terms/solar_terms',
                                    })
                                }else{
                                    wx.redirectTo({
                                        url: '/pages/author/author',
                                    })
                                }
                            } else {
                                wx.showModal({
                                    title: '提示',
                                    content: '授权登录失败,账户异常',
                                    showCancel: false,
                                    confirmColor: "#5bcbc8"
                                })
                            }
                            app.globalData.userInfo = res.data
                            wx.setStorageSync('userInfo', res.data)
                        }
                    })
                }
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