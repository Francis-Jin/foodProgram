// pages/cart/cart.js
var app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        urlBefore: app.globalData.urlBefore,
        administrationType: 1, //点击管理type,
        checkedAll: false,
        buyNumber: 1, //购买数量
        cartLists: [],
        page: 1,
        pageSize: 10,
        totalPrice: 0, //选择商品结算的总价
    },


    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        this.setData({
            cartLists: [],
            checkedAll: false,
            totalPrice: 0,
            administrationType: 1
        })
        this.getCartListsFn()
    },

    /** 获取购物车列表 */
    getCartListsFn() {
        let that = this
        app.appRequest({
            url: '/app/shoppingCart/listShoppingCartByApp.action',
            method: "post",
            getParams: {
                "userId": wx.getStorageSync("userInfo").id,
                "page": that.data.page,
                "rows": that.data.pageSize
            },
            success(res) {
                res.data.forEach(item => {
                    item.checked = false
                })
                that.setData({
                    cartLists: that.data.cartLists.concat(res.data)
                })
            }
        })
    },

    /** 选择商品时. */
    checkGoodsChange(e) {
        let that = this
        let itemId = e.currentTarget.dataset.itemid
        let cartLists = that.data.cartLists
        let checkedAll
        cartLists.forEach(item => {
            if (item.id == itemId) item.checked = !item.checked
        })
        let arr = cartLists.filter(item => item.checked == true)
        // 计算总价
        let totalPrice = 0
        arr.forEach(item => {
            totalPrice += item.price * item.quantity
        })
        arr.length == that.data.cartLists.length ? checkedAll = true : checkedAll = false
        that.setData({
            totalPrice: totalPrice,
            checkedAll: checkedAll,
            cartLists: cartLists
        })

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
    checkboxChange() {
        let that = this
        let checkedAll = this.data.checkedAll
        let cartLists = that.data.cartLists
        if (checkedAll) {
            cartLists.forEach(item => item.checked = false)
            let arr = cartLists.filter(item => item.checked == true)
            // 计算总价
            let totalPrice = 0
            arr.forEach(item => {
                totalPrice += item.price * item.quantity
            })
            this.setData({
                totalPrice,
                totalPrice,
                cartLists: cartLists,
                checkedAll: false
            })
        } else {
            cartLists.forEach(item => item.checked = true)
            let arr = cartLists.filter(item => item.checked == true)
            // 计算总价
            let totalPrice = 0
            arr.forEach(item => {
                totalPrice += item.price * item.quantity
            })
            this.setData({
                totalPrice: totalPrice,
                cartLists: cartLists,
                checkedAll: true
            })
        }
    },

    /** 数量加减. */
    addReduceFn(e) {
        let that = this
        let _type = e.currentTarget.dataset.type
        let itemId = e.currentTarget.dataset.itemid
        let cartLists = that.data.cartLists
        let thisItem = cartLists.filter(item => item.id == itemId)[0]
        let arr = cartLists.filter(item => item.checked == true)
        let totalPrice = 0
        let productId
        if (_type == 1) {
            // 减
            if (thisItem.quantity == 1) {
                wx.showToast({
                    title: '不可以在减少了哟',
                    icon: 'none'
                })
            } else {
                thisItem.quantity--
                    cartLists.forEach(item => {
                        if (item.id == itemId) {
                            item.quantity = thisItem.quantity
                            productId = item.productId
                        }
                    })
                // 调用函数更新数量
                that.updateQuantityFn(productId, thisItem.quantity)
                // 计算总价
                arr.forEach(item => {
                    totalPrice += item.price * item.quantity
                })
                this.setData({
                    totalPrice: totalPrice,
                    cartLists: cartLists
                })
            }
        } else {
            // 加
            thisItem.quantity++
                cartLists.forEach(item => {
                    if (item.id == itemId) {
                        item.quantity = thisItem.quantity
                        productId = item.productId
                    }
                })
            // 调用函数更新数量
            that.updateQuantityFn(productId, thisItem.quantity)
            // 计算总价
            arr.forEach(item => {
                totalPrice += item.price * item.quantity
            })
            this.setData({
                totalPrice: totalPrice,
                cartLists: cartLists
            })
        }
    },

    /** 加减数量，更新数据库数量 */
    updateQuantityFn(id, num) {
        let that = this
        app.appRequest({
            url: '/app/shoppingCart/updateQuantity.action',
            method: "post",
            getParams: {
                "productId": id,
                "quantity": num,
                "userId": wx.getStorageSync('userInfo').id
            },
            success(res) {

            }
        })
    },

    /** 跳转到商品详情页面. */
    toDetailsFn(e) {
        let itemId = e.currentTarget.dataset.itemid
        wx.navigateTo({
            url: '/pages/food_details/food_details?itemId=' + itemId,
        })
    },

    /** 跳转结算页面 */
    toPageFn() {
        let that = this
        let cartLists = that.data.cartLists
        let arr = cartLists.filter(item => item.checked == true)
        if (arr.length == 0) {
            wx.showToast({
                title: '请选择商品',
                icon: 'none'
            })
            return false
        }

        wx.setStorageSync("cartLists", arr)

        wx.navigateTo({
            url: '/pages/settlement/settlement?totalPrice=' + that.data.totalPrice,
        })
    },

    /** 删除购物车列表. */
    delCartListsFn() {
        let that = this
        let arr = that.data.cartLists.filter(item => item.checked == true)
        if (arr.length == 0) {
            wx.showToast({
                title: '请选择商品',
                icon: 'none'
            })
            return false
        }
        let productId = []
        arr.forEach(item => {
            productId.push(item.productId)
        })
        console.log(productId)
        app.appRequest({
            url: "/app/shoppingCart/deleteShoppingCarts.action",
            method: "GET",
            getParams: {
                "productId": productId.join(),
                "userId": wx.getStorageSync("userInfo").id
            },
            success(res) {
                that.setData({
                    cartLists: [],
                    checkedAll: false,
                    totalPrice: 0,
                    administrationType: 1
                })
                that.getCartListsFn()
            }
        })
    },


    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {

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