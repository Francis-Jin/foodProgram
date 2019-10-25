// pages/authentication/authentication.js
var app = getApp()
let timer = null
Page({

    /**
     * 页面的初始数据
     */
    data: {
        selectedId: '', //1配送员、2厨师
        name: '', //姓名
        phone: '', //手机号
        show: false,
        count: '',
        isPhoneError: false, //手机号是否错误
        code: '', //验证码
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        let selectedId = options.selectedId
        this.setData({
            selectedId: selectedId
        })
        wx.setNavigationBarTitle({
            title: selectedId == 1 ? '配送员认证' : '厨师认证'
        })
    },

    /** 输入姓名改变时. */
    nameChange(e){
        this.setData({
            name: e.detail
        })
    },

    /** 输入验证码改变时. */
    codeChange(e){
        this.setData({
            code: e.detail
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
        }else{
            this.setData({
                isPhoneError: false,
                phone: phone
            })
        }
       
    },
    
    /** 手机号失去焦点时. */
    phoneBlur(e){
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
    getCodeRequest(){
        let that = this
        let selectedId = that.data.selectedId
        let phone = that.data.phone
        app.appRequest({
            url: "/app/smsCode/sendSmsCode.action",
            method: "post",
            postData: {
                type: selectedId,
                phone: phone
            },
            success(res){
                console.log(res)
            }
        })
    },

    /** 点击认证. */
    toAuthenticationFn(){
        let that = this
        let name = that.data.name
        let phone = that.data.phone
        let code = that.data.code
        let selectedId = that.data.selectedId
        if(!name){
            wx.showToast({
                title: '请输入姓名',
                icon: 'none'
            })
            return false
        }
        if (!phone) {
            wx.showToast({
                title: '请输入手机号',
                icon: 'none'
            })
            return false
        }
        if (!code) {
            wx.showToast({
                title: '请输入验证码',
                icon: 'none'
            })
            return false
        }

        app.appRequest({
            url: "/app/userInfo/userAuth.action",
            method: "post",
            postData: {
                type: selectedId,
                userId: wx.getStorageSync('userInfo').id,
                name: name,
                phone: phone,
                code: code
            },
            success(res){
                if(res.code == 200){
                    // 重新调用登录更新userInfo
                    app.loginFn()
                    wx.showToast({
                        title: '认证成功',
                        duration: 2000,
                        mask: true,
                        success: function(res) {
                            setTimeout(function(){
                                wx.switchTab({
                                    url: '/pages/my/my',
                                })
                            },2000)
                        }
                    })
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