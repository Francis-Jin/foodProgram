// pages/take_add_order/take_add_order.js
var app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        selectedLists: []
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

    },

    /** 跳转选择菜品. */
    selectedReplenishmentFoodFn(){
        wx.navigateTo({
            url: '/pages/take_selected_good/take_selected_good',
        })
    },

    // /** 内容输入. */
    bindInputNumberFn(e){
        let that = this
        let ItemId = e.currentTarget.dataset.itemid
        let selectedLists = that.data.selectedLists
        let number = e.detail
        selectedLists.forEach(item=>{
            if(item.id == ItemId){
                item.quantity = number
            }
        })
        that.setData({
            selectedLists: selectedLists
        })
    },

    /** 确认添加补货单. */
    confirmAddTakeOrderFn(){
        let that = this
        let selectedLists = that.data.selectedLists
        let newArr = selectedLists.filter(item=>item.quantity>0)
        if(selectedLists.length == 0){
            wx.showToast({
                title: '请选择补货菜品',
                icon: 'none'
            })
            return false
        }

        if(newArr.length != selectedLists.length){
            wx.showToast({
                title: '请输入补货数量',
                icon: 'none'
            })
            return false
        }
        let dishInfoArr = []
        newArr.forEach(item=>{
            dishInfoArr.push({
                dishId: item.id,
                quantity: item.quantity
            })
        })
        console.log(dishInfoArr)
        wx.showLoading({
            title: '正在提交',
        })
        app.appRequest({
            url: '/app/orderInfo/saveSupplementOrder.action',
            method: 'post',
            postData: {
                locationId: wx.getStorageSync('userInfo').locationId,
                createUser: wx.getStorageSync('userInfo').id,
                dishInfoArr: JSON.stringify(dishInfoArr)
            },
            success(res){
                wx.hideLoading()
                if(res.code == 200){
                    setTimeout(()=>{
                        wx.showToast({
                            title: '新增成功',
                        })
                        wx.navigateBack({
                            delta:1
                        })
                    },2000)
                }else{
                    wx.showToast({
                        title: res.message,
                        icon: 'none'
                    })
                }
            }
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