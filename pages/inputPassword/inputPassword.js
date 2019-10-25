// pages/inputPassword/inputPassword.js
var app = getApp()
let timer = null
Page({

    /**
     * 页面的初始数据
     */
    data: {
        Length: 6, //输入框个数
        isFocus: true, //聚焦
        Value: "", //密码输入的内容
        ispassword: true, //是否密文显示 true为密文， false为明文。
        disabled: true,
        safePassword: '', // 用户是否设置过支付密码
        phone: '', //手机号
        showUpdateType: false, // 是否显示更新密码或忘记密码发送验证码模块
        isPhoneError: false, //手机号是否错误
        code: '', //验证码
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        let safePassword = wx.getStorageSync('userInfo').safePassword
        let phone = wx.getStorageSync('userInfo').phone
        this.setData({
            safePassword: safePassword,
            phone: phone,
            orderId: options.orderId
        })
        wx.setNavigationBarTitle({
            title: safePassword == '' ? '设置安全密码' : '输入安全密码',
        })
    },

    /** 输入密码。 */
    Focus(e) {
        var that = this;
        var inputValue = e.detail.value;
        var ilen = inputValue.length;
        if (ilen == 6) {
            that.setData({
                disabled: false,
            })
        } else {
            that.setData({
                disabled: true,
            })
        }
        that.setData({
            Value: inputValue,
        })
    },

    Tap() {
        var that = this;
        that.setData({
            isFocus: true,
        })
    },

    /** 输入手机号改变时. */
    phoneChange(e) {
        let phone = e.detail
        let r = /^1[3456789]\d{9}$/
        if (!(r.test(phone))) {
            this.setData({
                isPhoneError: true
            })
            return false
        } else {
            this.setData({
                isPhoneError: false,
                phone: phone
            })
        }
    },

    /** 验证码输入改变时设置输入的值  */
    codeChange(e) {
        console.log(e)
        let code = e.detail
        this.setData({
            code: code
        })
    },

    /** 手机号失去焦点时. */
    phoneBlur(e) {
        let phone = e.detail.value
        let r = /^1[3456789]\d{9}$/
        if (!(r.test(phone))) {
            this.setData({
                phone: '',
                isPhoneError: true
            })
            return false
        } else {
            this.setData({
                isPhoneError: false,
                phone: phone
            })
        }
    },

    /** 显示更新密码或忘记密码发送验证码模块 */
    showUpdatePasswordFn() {
        this.setData({
            showUpdateType: true
        })
    },

    /** 点击获取验证码时. */
    getCode() {
        if (!this.data.phone) {
            wx.showToast({
                title: '请输入手机号',
                icon: 'none'
            })
            return false
        }
        const TIME_COUNT = 60

        if (!timer) {
            this.setData({
                count: TIME_COUNT,
                show: true
            })

            timer = setInterval(() => {
                let count = this.data.count
                if (count > 0 && count <= TIME_COUNT) {
                    if (count == 60) {
                        // 调用发送验证码请求
                        this.getCodeRequest()
                    }
                    count--
                    this.setData({
                        count: count
                    })
                } else {
                    this.setData({
                        show: false,
                    })
                    timer = null
                    clearInterval(this.timer)
                }
            }, 1000)
        }
    },

    /** 获取手机验证码 */
    getCodeRequest() {
        let that = this
        let phone = that.data.phone
        app.appRequest({
            url: "/app/smsCode/sendSmsCode.action",
            method: "post",
            postData: {
                type: 3,
                phone: phone
            },
            success(res) {
                console.log(res)
            }
        })
    },

    /** 点击确认支付或设置或更新密码. */
    confirmFn() {
        let that = this
        let safePassword = that.data.safePassword
        let showUpdateType = that.data.showUpdateType
        let phone = that.data.phone
        let code = that.data.code
        let orderId = that.data.orderId
        let Value = that.data.Value
        if (Value == '') {
            wx.showToast({
                title: '请输入安全密码',
                icon: 'none'
            })
            return false
        }
        if (phone == '') {
            wx.showToast({
                title: '请输入手机号',
                icon: 'none'
            })
            return false
        }
        if (safePassword == '') {
            app.appRequest({
                url: '/app/userInfo/saveUserInfoSafePassword.action',
                method: 'post',
                postData: {
                    userId: wx.getStorageSync('userInfo').id,
                    phone: phone,
                    code: code,
                    safePassword: Value
                },
                success(res) {
                    if (res.code == 200) {
                        that.setData({
                            safePassword: Value,
                        })
                        that.getUserInfoFn()
                    } else {
                        wx.showToast({
                            title: res.message,
                            icon: 'none'
                        })
                    }
                }
            })
        } else if (safePassword != '' && showUpdateType) {
            // 重置密码
            app.appRequest({
                url: '/app/userInfo/updateUserInfoSafePassword.action',
                method: 'post',
                postData: {
                    userId: wx.getStorageSync("userInfo").id,
                    code: code,
                    safePassword: Value
                },
                success(res) {
                    if (res.code == 200) {
                        that.setData({
                            showUpdateType: false,
                        })
                        wx.showToast({
                            title: res.message,
                            icon: 'none'
                        })
                        that.getUserInfoFn()
                    } else {
                        wx.showToast({
                            title: res.message,
                            icon: 'none'
                        })
                    }
                }
            })
        } else if (safePassword != '' && !showUpdateType) {
            wx.showLoading({
                title: '支付中',
            })
            // 余额支付
            setTimeout(function() {
                app.appRequest({
                    url: '/app/userInfo/updateUserBalancePay.action',
                    method: 'post',
                    postData: {
                        userId: wx.getStorageSync('userInfo').id,
                        safePassword: Value,
                        orderId: orderId
                    },
                    success(res) {
                        wx.hideLoading()
                        if (res.code == 200) {
                            wx.setStorageSync("balancePaySuccess", true)
                            wx.navigateBack({
                                detal: 1
                            })
                        } else {
                            wx.showToast({
                                title: res.message,
                                icon: 'none'
                            })
                        }
                    }
                })
            }, 1000)
        }
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