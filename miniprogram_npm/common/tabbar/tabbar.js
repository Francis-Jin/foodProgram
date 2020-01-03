// miniprogram_npm/common/tabbar/tabbar.js

let h = []
for (let i = 0; i <= 23; i++) {
    if (i < 10) {
        i = '0' + i
    }
    i = i + ''
    h.push(i)
}

let m = []
for (let i = 0; i <= 59; i++) {
    if (i < 10) {
        i = '0' + i
    }
    i = i + ''
    m.push(i)
}

var app = getApp();
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        // 当前选项下标
        current: Number,
        buyNumber: Number
    },

    /**
     * 组件的初始数据
     */
    data: {
        // 是否显示日期时间选择
        isShowSelectedDateAndTime: false,
        // 是否是iPhone X
        isIpx: false,
        //购物车数量显示
        buyNumber: 0,
        
        // 时间
        selectedTime: null,
        columns: [{
                values: h,
                className: 'column1'
            },
            {
                values: m,
                className: 'column2'
            },
            {
                values: ['该时段已约满', '可预约'],
                className: 'column3',
                defaultIndex: 1
            }
        ],
        // 选项
        list: [{
                "pagePath": "../../pages/index/index",
                "text": "推荐",
                "iconPath": "../../../images/icon/recommend.png",
                "selectedIconPath": "../../../images/icon/recommend_active.png"
            },
            {
                "pagePath": "../../pages/order/order",
                "text": "订单",
                "iconPath": "../../../images/icon/cart.png",
                "selectedIconPath": "../../../images/icon/cart_active.png"
            },
            {
                "pagePath": "../../pages/start/start?paySuccessType=true",
                "text": "",
                "iconPath": "../../../images/icon/cart.png",
                "selectedIconPath": "../../../images/icon/cart_active.png"
            },
            {
                "pagePath": "../../pages/cart/cart",
                "text": "购物车",
                "iconPath": "../../../images/icon/cart_icon.png",
                "selectedIconPath": "../../../images/icon/cart_icon_act.png"
            },
            {
                "pagePath": "../../pages/my/my",
                "text": "我的",
                "iconPath": "../../../images/icon/me.png",
                "selectedIconPath": "../../../images/icon/me_active.png"
            }
        ]
    },

    /**
     * 组件的方法列表
     */
    methods: {
        // 跳转页面
        jump(e) {
            let that = this
            let index = e.currentTarget.dataset.index;
            if (index == this.data.current) {
                return;
            }
            if (index == 2) {
                console.log('点了')
                that.setData({
                    isShowDate: true
                })
            } else {
                wx.redirectTo({
                    url: this.data.list[index].pagePath
                })
            }
        },

        /** 选择时间改变时. */
        timeChangeFn(e) {
            const {
                picker,
                value,
                index
            } = e.detail;
            let that = this
            let arr1 = ['可预约']
            let arr2 = ['该时段已约满']
            let time = value[0] + ':' + value[1] + ':00'
            picker.setColumnValues(2, arr1);
            that.setData({
                selectedTime: time
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

        /** 获取默认地址，全局存储. */
        getDefaultAddress(){
            if (wx.getStorageSync("userInfo").id){
                app.appRequest({
                    url: "/app/userAddress/getDefaultAddress.action",
                    method: 'get',
                    getParams: {
                        userId: wx.getStorageSync("userInfo").id
                    },
                    success(res) {
                        if (res.code == 200) {
                            wx.setStorageSync('addressItem', res.data)
                        }
                    }
                })
            }
        },

        /** 判断是否是iPhoneX. */
        isIpxFn(){
            let that = this
            wx.getSystemInfo({
                success: function (res) {
                    //model中包含着设备信息
                    console.log(res)
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
        }
    },

    ready() {
        this.setData({
            selectedTime: null,
            selectedDate: null
        })
        this.isIpxFn()
        this.getCartBuyNumberFn()
        this.getDefaultAddress()
    }
})