// pages/take_meals_address/take_meals_address.js

var app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        lists: []
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let that = this
        that.getTakeMealsListsFn()
    },

    /** 获取取餐点. */
    getTakeMealsListsFn(){
        let that = this
        app.appRequest({
            url: '/app/sysConf/listGetMealsLocation.action',
            method: 'get',
            success(res){
                if(res.code == 200){
                    console.log(res)
                    res.data.forEach(item=>{item.checked = false})
                    that.setData({
                        lists: res.data
                    })
                }
            }
        })
    },

    /** 点击取餐地址时. */
    checkGoodsChange(e){
        console.log(e)
        let itemId = e.currentTarget.dataset.itemid
        let lists = this.data.lists
        lists.forEach(item=>{
            if(itemId == item.id){
                item.checked = true
            } else{
                 item.checked = false
            }
        })
        this.setData({
            lists: lists
        })
    },

    /** 确认选择取餐点. */
    confirmSelectedFn(){
        
        let arr = this.data.lists.filter(item=>item.checked)
        if(arr.length == 0){
            wx.showToast({
                title: '请选择取餐点',
                icon: 'none'
            })
            return false
        }
        let pages = getCurrentPages(); //获取当前页面js里面的pages里的所有信息。
        let prevPage = pages[pages.length - 2];
        //prevPage 是获取上一个页面的js里面的pages的所有信息。 -2 是上一个页面，-3是上上个页面以此类推。
        prevPage.setData({  // 将我们想要传递的参数在这里直接setData。上个页面就会执行这里的操作。
            takeMealsAddressId: arr[0].id,
            takeMealsAddress: arr[0].name + arr[0].address
        })

        wx.navigateBack({
            delta: 1
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

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})