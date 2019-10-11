// pages/cart/cart.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        allPrice: 0, //结算总价
        administrationType: 1, //点击管理type,
        checkedAll: false,
        buyNumber:1, //购买数量
    },

    /** 点击管理切换状态. */
    tapStatusFn() {
        let _type = this.data.administrationType
        if (_type == 1) {
            this.setData({
                administrationType: 2
            })
        } else {
            this.setData({
                administrationType: 1
            })
        }
    },

    /** 点击全选按钮改变时. */
    checkboxChange(){
        let checkedAll = this.data.checkedAll
        if (checkedAll){
            this.setData({
                checkedAll: false
            })
        }else{
            this.setData({
                checkedAll: true
            })
        }
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

    /** 跳转到商品详情页面. */
    toDetailsFn(e){
        console.log(e)
        wx.navigateTo({
            url: '/pages/food_details/food_details',
        })
    },

    /** 跳转结算页面 */
    toPageFn(){
        wx.navigateTo({
            url: '/pages/settlement/settlement',
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {

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