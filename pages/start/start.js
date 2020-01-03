// pages/start/start.js
var app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        userInfo: wx.getStorageSync("userInfo"),
        text: '',
        isLogin: ''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        console.log(options)
        let that = this
        this.setData({
            paySuccessType: options.paySuccessType,
            index: options.index,
            isLogin: options.isLogin
        })
        this.getMessageFn()
    },

    /** 获取信息 */
    getMessageFn() {
        let that = this
        app.appRequest({
            url: '/app/sysConf/getSysConf.action',
            method: 'get',
            success(res) {
                that.setData({
                    text: res.data.welcome.split(',')
                })
                wx.setStorageSync('systemParamInfo', res.data)
                setTimeout(function() {
                    that.bindload();
                }, 100)
            }
        })
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {

    },
    /** 获取用户信息. */

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {},

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
            wx.redirectTo({
                url: '/pages/index/index'
            })
        } else {
            if (wx.getStorageSync("userInfo")) {
                if (!wx.getStorageSync("userInfo").homeplace) {
                    wx.redirectTo({
                        url: '/pages/author/author',
                    })
                } else {
                    let paySuccessType = this.data.paySuccessType
                    wx.redirectTo({
                        url: '/pages/solar_terms/solar_terms?paySuccessType=' + paySuccessType,
                    })
                }
            } else {
                console.log(this.data.isLogin)
                if (!this.data.isLogin){
                    wx.redirectTo({
                        url: '/pages/index/index',
                    })
                }else{
                    wx.redirectTo({
                        url: '/pages/login/login',
                    }) 
                }
                
            }
        }

    }
})