//index.js

const app = getApp()
var timer = null
Page({

    /**
     * 页面的初始数据
     */
    data: {
        hourDeg: 0,
        minuteDeg: 0,
        secondDeg: 0,
        urlBefore: app.globalData.urlBefore,
        listsLeft: [],
        listsRight: [],
        page: 1, //默认从第一页开始
        pageSize: 10, //每页获取数量
        buyNumber: 0, //购物车数量
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        let that = this
        setInterval(function() {
            that.clockFn()
        }, 100);
        this.getTwelveHourByNow()
        this.getDataLists()
    },

    addCart(e) {
        let that = this
        let itemId = e.currentTarget.dataset.itemid
        app.appRequest({
            url: "/app/shoppingCart/saveShoppingCart.action",
            method: 'post',
            getParams: {
                productId: itemId,
                quantity: 1,
                createUser: wx.getStorageSync("userInfo").id
            },
            success(res) {
                // wx.showToast({
                //     title: res.message,
                //     icon: 'none'
                // })
                that.getCartBuyNumberFn()
            }
        })
    },

    /** 获取购物车数量 */
    getCartBuyNumberFn() {
        let that = this
        app.appRequest({
            url: "/app/shoppingCart/countTotal.action",
            method: 'get',
            getParams: {
                userId: wx.getStorageSync("userInfo").id
            },
            success(res) {
                that.setData({
                    buyNumber: res.data
                })
            }
        })

    },

    /** 获取当前时辰 */
    getTwelveHourByNow() {
        let that = this
        app.appRequest({
            url: "/app/recommend/getTwelveHourByNow.action",
            method: 'get',
            success(res) {
                that.setData({
                    hourByNow: res.data
                })
            }
        })
    },

    /** 时钟 */
    clockFn() {
        let that = this;
        var oDate = new Date();
        var ms = oDate.getMilliseconds()
        var iSec = oDate.getSeconds() + ms / 1000;
        var iMin = oDate.getMinutes() + iSec / 60;
        var iHour = oDate.getHours() % 12 + iMin / 60;
        that.setData({
            hourDeg: iHour * 30,
            minuteDeg: iMin * 6,
            secondDeg: iSec * 6
        })
    },

    /** 页面跳转. */
    topPageDetails(e) {
        console.log(e)
        let _type = e.currentTarget.dataset.type
        let _itemId = e.currentTarget.dataset.itemid
        console.log(_type)
        if (_type === '1') {
            wx.navigateTo({
                url: '/pages/cook_details/cook_details?itemId=' + _itemId,
            })
        } else if (_type === '2') {
            wx.navigateTo({
                url: '/pages/food_details/food_details?itemId=' + _itemId,
            })
        } else if (_type === '3') {
            wx.navigateTo({
                url: '/pages/solar_terms_details/solar_terms_details?itemId=' + _itemId,
            })
        } else if (_type === '4') {
            wx.navigateTo({
                url: '/pages/dietary_knowledge/dietary_knowledge?itemId=' + _itemId,
            })
        } else if (_type === 'pay') {
            // 跳转购物车
            wx.navigateTo({
                url: '/pages/cart/cart',
            })
        }
    },

    /** 获取数据列表 */
    getDataLists() {
        let that = this
        app.appRequest({
            url: "/app/recommend/list.action",
            method: "get",
            getParams: {
                page: that.data.page,
                rows: that.data.pageSize
            },
            success(res) {
                if (res.data) {
                    let listsLeft = res.data.filter((item, index) => (index + 1) % 2 == 1)
                    let listsRight = res.data.filter((item, index) => (index + 1) % 2 == 0)
                    that.setData({
                        listsLeft: that.data.listsLeft.concat(listsLeft),
                        listsRight: that.data.listsLeft.concat(listsRight)
                    })
                }
                // 隐藏导航栏加载框
                wx.hideNavigationBarLoading();
                // 停止下拉动作
                wx.stopPullDownRefresh();
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
        this.getCartBuyNumberFn()
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {
        // clearInterval(timer)
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
        // 显示顶部刷新图标
        wx.showNavigationBarLoading();
        this.setData({
            listsLeft: [],
            listsRight: [],
            page: 1
        })
        this.getDataLists()
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {
        let that = this
        let page = that.data.page
        page++
        this.setData({
            page: page
        })
        that.getDataLists()
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {

    }
})