// pages/delinvery_indent/delinvery_indent.js
var app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        userInfo:'',
        thisDayDate: '', //今日日期
        selectedActive: '',
        topBarLists: [],
        appointShow: false, //是否显示指派配送员确认弹框。
        appointName: '', //当前指定的配送员名字
        groupLeaderType: '', //判断是组长还是组员
        todayProfitShow: false, //是否显示当日收益
        reportErrorText: '', //报备出错输出的内容
        questionBtnText: '',
        groupLeaderProblemLists: [], //问题单列表
        groupOrderList: [], //团队接单列表
        lists: [], //个人接单列表
        indentStatisticsLists:[], // 个人接单统计列表
        page: 1,
        pageSize: 10
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        let groupLeaderType = options.groupLeaderType
        let type = options.type
        let topBarLists = []
        this.getThisDayDate()
        this.setData({
            userInfo: wx.getStorageSync('userInfo')
        })
        if (groupLeaderType == 1) {
            topBarLists = [{
                id: 1,
                type: true,
                text: "团队接单",
            }, {
                id: 2,
                type: true,
                text: "个人接单",
            }, {
                id: 3,
                type: true,
                    text: "个人接单统计",
            }, {
                id: 4,
                type: true,
                text: "问题单处理",
            }]
            this.setData({
                selectedActive: type == 2 ? 4 : 1,
                groupLeaderType: groupLeaderType,
                topBarLists: topBarLists
            })
            type == 2 ? this.getGroupLeaderProblemLists() : this.groupOrderListFn()
        } else {
            topBarLists = [{
                id: 2,
                type: true,
                text: "个人接单",
            }, {
                id: 3,
                type: true,
                text: "个人接单统计",
            }, {
                id: 4,
                type: true,
                text: "问题单",
            }]
            this.listDeliveryGroupOrderByPersonFn()
            this.setData({
                selectedActive: type == 2 ? 4 : 2,
                groupLeaderType: groupLeaderType,
                topBarLists: topBarLists
            })
        }
    },

    /** 拨打配送员电话. */
    callTelFn(e) {
        console.log(e)
        let tel = e.currentTarget.dataset.tel
        wx.makePhoneCall({
            phoneNumber: tel,
        })
    },

    /** 查看订单详情. */
    toDeailsFn(e) {
        console.log(e)
        let orderId = e.currentTarget.dataset.id
        wx.navigateTo({
            url: '/pages/order_details/order_details?orderId=' + orderId,
        })
    },

    /** 获取今日日期 */
    getThisDayDate(){
        let date = new Date()
        let y = date.getFullYear()
        let m = date.getMonth() + 1
        let d = date.getDate()
        this.setData({
            thisDayDate: y + '-' + m + '-' + d  
        })
    },

    /** 获取团队接单列表. */
    groupOrderListFn() {
        let that = this
        app.appRequest({
            url: '/app/deliveryGroupOrder/groupOrderList.action',
            method: 'get',
            getParams: {
                userId: wx.getStorageSync('userInfo').id,
                page: that.data.page,
                rows: that.data.pageSize
            },
            success(res) {
                // 隐藏导航栏加载框
                wx.hideNavigationBarLoading();
                // 停止下拉动作
                wx.stopPullDownRefresh();
                if (res.data) {
                    that.setData({
                        groupOrderList: that.data.groupOrderList.concat(res.data)
                    })
                }
            }
        })
    },

    /** 获取个人接单数据. */
    listDeliveryGroupOrderByPersonFn() {
        let that = this
        app.appRequest({
            url: '/app/deliveryGroupOrder/listDeliveryGroupOrderByPerson.action',
            method: "GET",
            getParams: {
                userId: wx.getStorageSync('userInfo').id,
                page: that.data.page,
                rows: that.data.pageSize
            },
            success(res) {
                // 隐藏导航栏加载框
                wx.hideNavigationBarLoading();
                // 停止下拉动作
                wx.stopPullDownRefresh();
                if (res.data) {
                    that.setData({
                        lists: that.data.lists.concat(res.data)
                    })
                }
            }
        })
    },

    /** 获取团队成员当日单量. */
    listTodayDeliverOrderQuantity() {
        let that = this
        app.appRequest({
            url: '/app/deliveryGroupOrder/listTodayDeliverOrderQuantity.action',
            method: 'get',
            getParams: {
                userId: wx.getStorageSync('userInfo').id
            },
            success(res) {
                if (res.data) {
                    that.setData({
                        profitLists: res.data
                    })
                }
            }
        })
    },

    /** 获取个人接单统计列表. */
    getListDeliveryOrderQuantityFn(){
        let that = this
        app.appRequest({
            url: '/app/deliveryGroupOrder/listDeliveryOrderQuantity.action',
            method: 'get',
            getParams: {
                userId:wx.getStorageSync('userInfo').id,
                page:that.data.page,
                rows:that.data.pageSize
            },
            success(res){
                // 隐藏导航栏加载框
                wx.hideNavigationBarLoading();
                // 停止下拉动作
                wx.stopPullDownRefresh();
                if(res.data){
                    that.setData({
                        indentStatisticsLists: that.data.indentStatisticsLists.concat(res.data)
                    })
                }
            }
        })
    },

    /** 获取组长问题单列表. */
    getGroupLeaderProblemLists() {
        let that = this
        app.appRequest({
            url: "/app/deliveryGroupOrder/listProblemOrderByHeadman.action",
            method: 'get',
            getParams: {
                userId: wx.getStorageSync('userInfo').id,
                page: that.data.page,
                rows: that.data.pageSize
            },
            success(res) {
                // 隐藏导航栏加载框
                wx.hideNavigationBarLoading();
                // 停止下拉动作
                wx.stopPullDownRefresh();
                if (res.data) {
                    that.setData({
                        groupLeaderProblemLists: that.data.groupLeaderProblemLists.concat(res.data)
                    })
                }
            }
        })
    },

    /** 顶部tab切换. */
    onSwitchTabFn(e) {
        let that = this
        let item = e.currentTarget.dataset.item
        let id = item.id
        // 重置数据列表
        that.setData({
            page: 1,
            todayProfitShow:false,
            groupOrderList: [],
            lists: [],
            indentStatisticsLists:[],
            groupLeaderProblemLists: [],
        })
        if (id == 1) {
            that.groupOrderListFn()
        } else if (id == 2) {
            that.listDeliveryGroupOrderByPersonFn()
        } else if (id == 3) {
            that.getListDeliveryOrderQuantityFn()
        } else if (id == 4) {
            this.getGroupLeaderProblemLists()
        }
        this.setData({
            selectedActive: id
        })
    },

    /** 指定配送员. */
    appointFn(e) {
        // 判断当前订单是否指派了配送员
        let deliveryuser = e.currentTarget.dataset.deliveryuser
        let deliveryUserId = e.currentTarget.dataset.item.deliveryUserId
        let name = e.currentTarget.dataset.item.deliveryUserName
        let orderid = e.currentTarget.dataset.orderid
        this.setData({
            page: 1,
            groupOrderList: []
        })
        if (deliveryuser != 0) {
            wx.showToast({
                title: '当前订单已指派',
                icon: 'none'
            })
            return false
        }
        if (deliveryUserId == '-1') {
            wx.showToast({
                title: name + '未进行身份认证，不可指派',
                icon: 'none'
            })
            return false
        }

        this.updateOrderInfoDeliveryUser(orderid, deliveryUserId, name)
    },

    /** 指派送餐员请求接口. */
    updateOrderInfoDeliveryUser(orderId, deliveryUser, name) {
        let that = this
        app.appRequest({
            url: "/app/deliveryGroupOrder/updateOrderInfoDeliveryUser.action",
            method: 'post',
            postData: {
                orderId: orderId,
                deliveryUser: deliveryUser
            },
            success(res) {
                if (res.code == 200) {
                    that.setData({
                        appointName: name,
                        appointShow: true
                    })
                    that.groupOrderListFn()
                }
            }
        })
    },

    /** 组长点击处理问题订单. */
    goHandleProblemFn(e) {
        let that = this
        let orderId = e.currentTarget.dataset.orderid
        let problem = e.currentTarget.dataset.problem
        app.appRequest({
            url: '/app/deliveryGroupOrder/updateOrderInfoProblemDeal.action',
            method: 'post',
            postData: {
                orderId: orderId,
                userId: wx.getStorageSync("userInfo").id,
                problemDeal: problem
            },
            success(res){
                wx.showToast({
                    title: '已处理',
                    icon: 'none'
                })
                that.setData({
                    groupLeaderProblemLists: []
                })
                that.getGroupLeaderProblemLists()
            }
        })
    },

    /** 个人订单点击 */
    personAppointFn(e) {
        let name = e.currentTarget.dataset.item
        let orderid = e.currentTarget.dataset.orderid
        this.setData({
            orderId: orderid,
            appointName: name,
            appointShow: true
        })
    },

    /** 出错报备输入内容. */
    reportInputFn(e) {
        let val = e.detail.value
        this.setData({
            reportErrorText: val
        })
    },

    /** 确认指派. */
    confirmAppointFn() {
        let that = this
        let orderId = this.data.orderId
        let appointName = this.data.appointName
        let reportErrorText = this.data.reportErrorText
        if (appointName == '取餐') {
            app.appRequest({
                url: '/app/deliveryGroupOrder/updateOrderInfoTakeTime.action',
                method: 'post',
                postData: {
                    orderId: orderId
                },
                success(res) {
                    that.setData({
                        lists: [],
                        page: 1,
                        appointShow: false
                    })
                    that.listDeliveryGroupOrderByPersonFn()
                }
            })
        } else if (appointName == '送达') {
            app.appRequest({
                url: '/app/deliveryGroupOrder/updateOrderInfoDeliveryTime.action',
                method: 'post',
                postData: {
                    orderId: orderId
                },
                success(res) {
                    that.setData({
                        lists: [],
                        page: 1,
                        appointShow: false
                    })
                    that.listDeliveryGroupOrderByPersonFn()
                }
            })
        } else if (appointName == '出错') {
            app.appRequest({
                url: '/app/deliveryGroupOrder/updateOrderInfoProblem.action',
                method: 'POST',
                postData: {
                    orderId: orderId,
                    userId: wx.getStorageSync("userInfo").id,
                    problem: reportErrorText
                },
                success(res) {
                    that.setData({
                        lists: [],
                        page: 1,
                        appointShow: false
                    })
                    that.listDeliveryGroupOrderByPersonFn()
                }
            })
        } else if (appointName == '处理') {
            app.appRequest({
                url: '/app/deliveryGroupOrder/updateOrderInfoProblemDeal.action',
                method: 'post',
                postData: {
                    orderId: orderId,
                    userId: wx.getStorageSync("userInfo").id,
                    problemDeal: reportErrorText
                },
                success(res) {
                    that.setData({
                        lists: [],
                        page: 1,
                        appointShow: false,
                        groupLeaderProblemLists: []
                    })
                    that.getGroupLeaderProblemLists()
                }
            })
        }  else {
            this.setData({
                appointShow: false
            })
        }
    },


    /** 显示当日收益上拉狂. */
    todayProfitShowFn() {
        let that = this
        let selectedActive = that.data.selectedActive
        if (selectedActive == 1) {
            that.listTodayDeliverOrderQuantity()
        }
        this.setData({
            todayProfitShow: true
        })
    },

    /** 隐藏当日收益上拉狂. */
    onClose() {
        this.setData({
            appointShow: false,
            todayProfitShow: false
        })
    },

    /** 页面跳转 */
    toPageFn(e) {
        let type = e.currentTarget.dataset.type
        let itemid = e.currentTarget.dataset.itemid
        if (type == 1) {

        } else if (type == 2) {
            // 团队当日单量，点击成员跳转
            let userid = e.currentTarget.dataset.userid
            let username = e.currentTarget.dataset.username
            wx.navigateTo({
                url: '/pages/single_appoint_details/single_appoint_details?userid=' + userid + "&username=" + username,
            })
        } else if (type == 3) {

        } else if (type == 4) {

        } else if (type == 5) {

        } else if (type == 6) {

        } else if (type == 7) {

        }
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
        // 显示顶部刷新图标
        wx.showNavigationBarLoading();
        let that = this
        let id = that.data.selectedActive
        // 重置数据列表
        that.setData({
            page: 1,
            todayProfitShow: false,
            groupOrderList: [],
            lists: [],
            indentStatisticsLists: [],
            groupLeaderProblemLists: [],
        })
        if (id == 1) {
            that.groupOrderListFn()
        } else if (id == 2) {
            that.listDeliveryGroupOrderByPersonFn()
        } else if (id == 3) {
            that.getListDeliveryOrderQuantityFn()
        } else if (id == 4) {
            this.getGroupLeaderProblemLists()
        }
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {
        let that = this
        let id = that.data.selectedActive
        let page = that.data.page
        page++
        this.setData({
            page: page
        })
        if (id == 1) {
            that.groupOrderListFn()
        } else if (id == 2) {
            that.listDeliveryGroupOrderByPersonFn()
        } else if (id == 3) {
            that.getListDeliveryOrderQuantityFn()
        } else if (id == 4) {
            this.getGroupLeaderProblemLists()
        }
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {

    }
})