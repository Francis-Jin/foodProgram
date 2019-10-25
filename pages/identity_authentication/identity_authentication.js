// pages/identity_authentication/identity_authentication.js
var app = getApp()
var userInfo = wx.getStorageSync("userInfo")
Page({

    /**
     * 页面的初始数据
     */
    data: {
        userInfo: wx.getStorageSync("userInfo"),
        selectedId: '' ,//1 配送员 2厨师
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        console.log(wx.getStorageSync("userInfo"))
    },

    /** 身份选择. */
    selectedFn(e){
        let type = e.currentTarget.dataset.type
        this.setData({
            selectedId: type 
        })
    },

    /** 跳转到身份认证. */
    goAuthenticationFn(){
        if(this.data.selectedId){
            wx.navigateTo({
                url: '/pages/authentication/authentication?selectedId=' + this.data.selectedId,
            })
        }else{
            wx.showToast({
                title: '请选择身份',
                icon: 'none'
            })
        }
        
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