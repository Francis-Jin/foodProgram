//index.js

const app = getApp()
var timer = null
Page({

    /**
     * 页面的初始数据
     */
    data: {
        isShowMenu: false,
        menuLists: [],
        countTime:'2019-11-04 12:59:00',
        userInfo: '',
        hourDeg: 0,
        minuteDeg: 0,
        secondDeg: 0,
        urlBefore: app.globalData.urlBefore,
        listsLeft: [],
        listsRight: [],
        listsAll: [],
        page: 1, //默认从第一页开始
        pageSize: 20, //每页获取数量
        buyNumber: 0, //购物车数量
        directionValue: [],
        show: false,
        columns: [],
        isShowDiscountModal: false, //新用户首次进入弹出
        otherShow: false, //选择其他时弹框
        otherValue: '', // 选择其他输入的关键字
        selectedCode: '', //膳食方向code
        isClickMenu: false, // 是否点击了菜单

        guideMongoliaShowStatus: false, //是否显示引导蒙层
        // 加入购物车动画小球
        hide_good_box: true,
        bus_x: 0,
        bus_y: 0,
        // 今日时蔬图片
        toDaySSInfo: '',
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        console.log(wx.getStorageSync('userInfo'))
        var _windowHeight = wx.getSystemInfoSync().windowHeight;

        // 目标终点元素 - 购物车的位置坐标
        this.busPos = {};
        this.busPos['x'] = 10; // x坐标暂写死，自己可根据UI来修改
        this.busPos['y'] = _windowHeight - 60; // y坐标，也可以根据自己需要来修改


        let that = this
        wx.getSystemInfo({
            success: function(res) {
                //model中包含着设备信息
                var model = res.model
                console.log(model.search('iPhone X') != -1)
                if (model.search('iPhone X') != -1) {
                    that.setData({
                        isIpx: true
                    })
                } else {
                    that.setData({
                        isIpx: false
                    })
                }
            }
        })
        this.setData({
            userInfo: wx.getStorageSync('userInfo'),
            selectedCode: wx.getStorageSync('selectedCode')
        })
        let newUser = wx.getStorageSync('userInfo').newUser
        let voucherAmount = wx.getStorageSync('userInfo').voucherAmount
        if (newUser == 1 && voucherAmount > 0) {
            this.setData({
                isShowDiscountModal: true
            })
        }
        if (newUser == 1 && voucherAmount == 0) {
            this.setData({
                guideMongoliaShowStatus: true
            })
        }
        setInterval(function() {
            that.clockFn()
        }, 100);
        this.getTwelveHourByNow()
        this.getDataLists()
        this.getDietOrientationFn()
        this.getDishCategoryFn()
        this.getToDaySSData()
        this.getListIndexRecommendFn()
    },

    /** 获取首页菜品推荐. */
    getListIndexRecommendFn(){
        let that = this
        app.appRequest({
            url: '/app/recommend/listIndexRecommend.action',
            method: 'get',
            success(res){
                if(res.code == 200){
                    if(res.data){
                        that.setData({
                            ListIndexRecommendArr: res.data 
                        })
                    }
                }
            }
        })
    },

    /** 获取今日时蔬数据. */
    getToDaySSData(){
        let that = this
        app.appRequest({
            url: '/app/recommend/toDayVegetables.action',
            method: 'get',
            success(res){
                if(res.code==200){
                    if(res.data){
                        that.setData({
                            toDaySSInfo: res.data 
                        })
                    }
                }else{
                    wx.showToast({
                        title: res.message,
                        icon: 'none'
                    })
                }
            }
        })
    },

    /** 获取菜单分类列表. */
    getDishCategoryFn(){
        let that = this
        app.appRequest({
            url: '/app/recommend/dishCategory.action',
            method: 'get',
            success(res) {
                if(res.code == 200){
                    if(res.data){
                        res.data.forEach(item=>item.checked = false)
                        that.setData({
                            menuLists: res.data
                        })
                    }
                }else{
                    wx.showToast({
                        title: res.message,
                        icon: 'none'
                    })
                }
            }
        })
    },

    /** 点击菜单列表. */
    clickMenuListsElementFn(e){
        let that = this
        let itemId = e.currentTarget.dataset.itemid
        let menuLists = that.data.menuLists
        menuLists.forEach(item=>{
            if(itemId == item.id){
                item.checked = true
            }else{
                item.checked = false
            }
        })
        that.setData({
            page: 1,
            isClickMenu: true,
            listsAll: [],
            listsLeft: [],
            listsRight: [],
            menuClassId: itemId,
            isShowMenu:false,
            menuLists: menuLists
        })
        that.getClassShopDataFn()
    },

    /** 根据菜单分类获取商品数据. */
    getClassShopDataFn(){
        let that = this
        app.appRequest({
            url: '/app/recommend/listByCategory.action',
            method: 'get',
            getParams: {
                'dishCategory': that.data.menuClassId,
                'page': that.data.page,
                'rows': that.data.pageSize
            },
            success(res) {
                if (res.data) {
                    let listsAll = that.data.listsAll.concat(res.data)
                    let listsLeft = listsAll.filter((item, index) => (index + 1) % 2 == 1)
                    let listsRight = listsAll.filter((item, index) => (index + 1) % 2 == 0)
                    that.setData({
                        listsAll: listsAll,
                        listsLeft: listsLeft,
                        listsRight: listsRight
                    })
                }
            }
        })
    },



    /** 点击显示菜单 */
    showMenuFn(){
        this.setData({
            isShowMenu: true
        })
    },

    /** 隐藏菜单. */
    closeMenuFn(){
        this.setData({
            isShowMenu: false
        })
    },

    /** 关闭引导蒙层. */
    closeGuideMongoliaFn() {
        this.setData({
            guideMongoliaShowStatus: false
        })
        // this.getUserInfoFn()
    },

    /** 获取用户信息. */
    getUserInfoFn() {
        let that = this
        app.appRequest({
            url: '/app/userInfo/getUserInfo.action',
            method: 'get',
            getParams: {
                id: wx.getStorageSync('userInfo').id,
                newUser: wx.getStorageSync('userInfo').newUser
            },
            success(res) {
                wx.setStorageSync('userInfo', res.data)
            }
        })
    },


    /** 获取膳食方向. */
    getDietOrientationFn() {
        let that = this
        app.appRequest({
            url: "/app/sysConf/getDietOrientation.action",
            method: 'get',
            success(res) {
                let lists = res.data
                let selectedCode = []
                if (wx.getStorageSync("userInfo").userDietOrientation) {
                    let value = []
                    wx.getStorageSync("userInfo").userDietOrientation.forEach(item => {
                        value.push(item.dietOrientationName)
                        selectedCode.push(item.dietOrientationId)
                    })
                    selectedCode.sort()
                    that.setData({
                        directionValue: value,
                        selectedCode: selectedCode.join()
                    })
                    wx.setStorageSync('selectedCode', selectedCode.join())
                }
                res.data.forEach(item => {
                    selectedCode.forEach(subItem => {
                        if(item.code == subItem){
                            item.checked = true
                        }else{
                            item.checked = false
                        }
                    })
                })
                that.setData({
                    columns: lists,
                    dietOrientationLists: res.data
                })
            }
        })
    },

    /** 获取输入其他关键字. */
    reportInputFn(e) {
        this.setData({
            otherValue: e.detail.value
        })
    },

    /** 输入其他关键字确认. */
    confirmAppointFn() {
        let that = this
        let userInfo = wx.getStorageSync("userInfo")
        if (!userInfo) {
            wx.redirectTo({
                url: '/pages/login/login?isLogin=true',
            })
            return false
        }
        app.appRequest({
            url: '/app/userInfo/saveSearchKeyword.action',
            method: 'post',
            postData: {
                userId: wx.getStorageSync("userInfo").id,
                keyword: that.data.otherValue
            },
            success(res) {
                if (res.code == 200) {
                    app.appRequest({
                        url: '/app/userInfo/updateUserDietOrientation.action',
                        method: 'post',
                        getParams: {
                            dietOrientation: that.data.selectedCode,
                            unionId: wx.getStorageSync("userInfo").unionId
                        },
                        success(res) {
                            if (res.code == 200) {
                                that.setData({
                                    otherShow: false,
                                    show: false,
                                    listsLeft: [],
                                    listsRight: [],
                                    directionValue: that.data.directionValue,
                                })

                                that.getDataLists()
                                wx.setStorageSync('selectedCode', that.data.selectedCode)
                            }
                        }
                    })
                }
            }
        })
    },

    /** 选择膳食方向. */
    selectedFn(e) {
        let that = this
        let code = e.currentTarget.dataset.code
        let columns = that.data.columns
        let len = columns.filter(item => item.checked == true).length
        let directionValue = []
        if (code == 2) {
            columns.forEach(item => {
                if (item.code == code) {
                    directionValue.push(item.name)
                }
            })
            that.setData({
                directionValue: directionValue,
                selectedCode: code,
                otherShow: true
            })
            return false
        }
        columns.forEach(item => {
            if (item.code == code) {
                if (item.checked) {
                    item.checked = false
                } else {
                    if (len != 2) {
                        item.checked = true
                    } else {
                        wx.showToast({
                            title: '最多选择两个哦!',
                            icon: 'none'
                        })
                    }
                }
            }
        })
        that.setData({
            columns: columns
        })
    },

    /** 确定选择选择膳食方向并更新膳食方向. */
    onConfirm() {
        let that = this
        let userInfo = wx.getStorageSync("userInfo")
        if (!userInfo) {
            wx.redirectTo({
                url: '/pages/login/login?isLogin=true',
            })
            return false
        }
        let columns = that.data.columns
        let arr = columns.filter(item => item.checked == true)
        let str = []
        let directionValueArr = []
        arr.forEach(item => {
            str.push(item.code)
            directionValueArr.push(item.name)
        })
        str.sort()
        app.appRequest({
            url: '/app/userInfo/updateUserDietOrientation.action',
            method: 'post',
            getParams: {
                dietOrientation: str.join(),
                unionId: wx.getStorageSync("userInfo").unionId
            },
            success(res) {
                that.setData({
                    listsAll: [],
                    listsLeft: [],
                    listsRight: [],
                    page: 1,
                    show: false,
                    selectedCode: str.join(),
                    directionValue: directionValueArr,
                })
                that.getDataLists()
                wx.setStorageSync('selectedCode', str.join())
            }
        })
    },

    /** 显示选择膳食方向. */
    showDirectionFn() {
        console.log(123213)
        this.setData({
            show: true
        })
    },

    /** 隐藏选择膳食方向 */
    onClose() {
        this.setData({
            otherShow: false,
            show: false
        })
    },

    /** 关闭领优惠弹框. */
    closeDiscountModal() {
        this.setData({
            guideMongoliaShowStatus: true,
            isShowDiscountModal: false
        })
    },

    /** 添加购物车 */
    addCart(e) {
        let that = this
        let itemId = e.currentTarget.dataset.itemid
        let stock = e.currentTarget.dataset.stock
        let addPic = e.currentTarget.dataset.pic
        that.setData({
            addPic: addPic,
            itemId: itemId
        })
        let userInfo = wx.getStorageSync("userInfo")
        if (!userInfo) {
            wx.redirectTo({
                url: '/pages/login/login?isLogin=true',
            })
            return false
        }

        if (stock < 1) return false

        that.requestAddCart()

        return false;
        // 如果good_box正在运动，不能重复点击
        if (!this.data.hide_good_box) return;
        this.finger = {};
        var topPoint = {};
        //点击点的坐标
        this.finger['x'] = e.touches["0"].clientX;
        this.finger['y'] = e.touches["0"].clientY;

        //控制点的y值定在低的点的上方150处
        if (this.finger['y'] < this.busPos['y']) {
            topPoint['y'] = this.finger['y'] - 200;
        } else {
            topPoint['y'] = this.busPos['y'] - 200;
        }

        //控制点的x值在点击点和购物车之间
        if (this.finger['x' > this.busPos['x']]) {
            topPoint['x'] = (this.finger['x'] - this.busPos['x']) / 2 + this.busPos['x'];
        } else {
            topPoint['x'] = (this.busPos['x'] - this.finger['x']) / 2 + this.finger['x'];
        }

        this.linePos = app.bezier([this.busPos, topPoint, this.finger], 30);
        this.startAnimation();

    },

    /** 加入购物车动画. */
    startAnimation: function() {
        var index = 0,
            that = this,
            bezier_points = that.linePos['bezier_points'];
        this.setData({
            hide_good_box: false,
            bus_x: that.finger['x'],
            bus_y: that.finger['y']
        })
        index = bezier_points.length;
        this.timer = setInterval(function() {
            index--;
            // 设置球的位置
            that.setData({
                bus_x: bezier_points[index]['x'],
                bus_y: bezier_points[index]['y']
            })
            // 到最后一个点的时候，开始购物车的一系列变化，并清除定时器，隐藏小球
            if (index < 1) {
                clearInterval(that.timer);
                that.requestAddCart()
                that.setData({
                    hide_good_box: true
                })
            }
        }, 33);
    },

    /** 请求加入购物车. */
    requestAddCart() {
        let that = this
        app.appRequest({
            url: "/app/shoppingCart/saveShoppingCart.action",
            method: 'post',
            getParams: {
                productId: that.data.itemId,
                quantity: 1,
                createUser: wx.getStorageSync("userInfo").id
            },
            success(res) {
                wx.showToast({
                    title: '已加入',
                    icon: 'none'
                })
                that.getCartBuyNumberFn()
            }
        })
    },

    /** 获取购物车数量 */
    getCartBuyNumberFn() {
        let that = this
        if (wx.getStorageSync("userInfo")) {
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
        }

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
        let _type = e.currentTarget.dataset.type
        let _itemId = e.currentTarget.dataset.itemid
        let dishCategory = e.currentTarget.dataset.dishcategory
        if (_type === '1') {
            wx.navigateTo({
                url: '/pages/cook_details/cook_details?itemId=' + _itemId,
            })
        } else if (_type === '2') {
            if (dishCategory != 2){
                wx.navigateTo({
                    url: '/pages/food_details/food_details?itemId=' + _itemId,
                })
            }else{
                wx.navigateTo({
                    url: '/pages/advertisement_details/advertisement_details?itemId=' + _itemId,
                })
            }
            
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
                rows: that.data.pageSize,
                dietOrientation: that.data.selectedCode
            },
            success(res) {
                if (res.data) {
                    let listsAll = that.data.listsAll.concat(res.data)
                    let listsLeft = listsAll.filter((item, index) => (index + 1) % 2 == 1)
                    let listsRight = listsAll.filter((item, index) => (index + 1) % 2 == 0)
                    that.setData({
                        listsAll: listsAll,
                        listsLeft: listsLeft,
                        listsRight: listsRight
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
            isClickMenu: false,
            listsAll: [],
            listsLeft: [],
            listsRight: [],
            page: 1
        })
        this.getToDaySSData()
        this.getDataLists()
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {
        let that = this
        // let selectedCode = that.data.selectedCode
        // if (selectedCode){
        let isClickMenu = that.data.isClickMenu
        let page = that.data.page
        page++
        this.setData({
            page: page
        })
        if (!isClickMenu){
            that.getDataLists()
        }else{
            that.getClassShopDataFn()
        }
        // }
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {

    }
})