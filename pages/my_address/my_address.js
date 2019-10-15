// pages/my_address/my_address.js
var app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        addressLists: [],

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {

    },

    /** 跳转到添加地址页面. */
    addAddressFn(e) {
        console.log(e)
        let type = e.currentTarget.dataset.type
        if (type == 'edit') {
            let addressId = e.currentTarget.dataset.item.id
            let userName = e.currentTarget.dataset.item.name
            let userPhone = e.currentTarget.dataset.item.phone
            let addressSelectedText = e.currentTarget.dataset.item.address
            let doorpValue = e.currentTarget.dataset.item.doorplate
            wx.navigateTo({
                url: '/pages/add_address/add_address?type=' + type + "&addressId=" + addressId + "&userName=" + userName + "&userPhone=" + userPhone + "&addressSelectedText=" + addressSelectedText + "&doorpValue=" + doorpValue,
            })
        } else {
            wx.navigateTo({
                url: '/pages/add_address/add_address?type=' + type,
            })
        }

    },

    /** 获取用户地址列表. */
    getUserAddressFn() {
        let that = this
        app.appRequest({
            url: "/app/userAddress/list.action",
            method: 'get',
            getParams: {
                userId: wx.getStorageSync("userInfo").id
            },
            success(res) {
                if (res.data != null) {
                    that.setData({
                        addressLists: res.data
                    })
                }else{
                    that.setData({
                        addressLists: []
                    })
                }
            }
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
        this.getUserAddressFn()
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