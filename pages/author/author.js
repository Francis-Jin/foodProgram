// pages/author/author.js
var app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        address: '', //家乡
        ageValue: '', //年龄
        sexValue: '', //性别value
        sexCode: 0, //性别code
        constellationValue: '', //星座value
        constellationCode: 0, //星座code
        show: false, //是否显示上拉选择
        showModalLists: [], //显示弹窗的数据
        sexArr: [{
                code: 1,
                name: '男'
            },
            {
                code: 2,
                name: '女'
            }
        ],
        selectedType: '', //选择星座还是性别 1: 性别 2：星座
        constellationArr: [], //星座列表
    },

    /** 隐藏上拉框 */
    onClose(e){
        this.setData({
            show: false
        })
    },

    /** 确认选择. */
    onConfirm(e){
        //选择星座还是性别 1: 性别 2：星座
        let that = this 
        let code = e.detail.value.code
        let name = e.detail.value.name
        let selectedType = that.data.selectedType
        if(selectedType == 1){
            that.setData({
                sexCode: code,
                sexValue: name,
                show: false
            })
        }
        if(selectedType == 2){
            that.setData({
                constellationCode: code,
                constellationValue: name,
                show: false
            })
        }
    },

    /**
     * 输入家乡变化时
     */
    onChange(e) {
        this.setData({
            address: e.detail
        })
    },
    /**
     * 输入年龄变化时
     */
    ageChange(e) {
        this.setData({
            ageValue: e.detail
        })
    },


    /** 显示性别星座. */
    showDirectionFn(e) {
        let that = this
        let type = e.currentTarget.dataset.type
        if (type == 1) {
            this.setData({
                show: true,
                selectedType: type,
                showModalLists: this.data.sexArr
            })
        } else {
            this.setData({
                show: true,
                selectedType: type,
                showModalLists: this.data.constellationArr
            })
        }
    },

    /** 隐藏性别星座 */
    onClose() {
        this.setData({
            show: false
        })
    },

    /** 下一步 */
    nextFn() {
        let that = this
        if (that.data.address == '') {
            wx.showToast({
                title: '请输入家乡地址',
                icon: 'none'
            })
            return false
        }
        if (that.data.ageValue == '') {
            wx.showToast({
                title: '请输入年龄',
                icon: 'none'
            })
            return false
        }
        if (that.data.sexValue == '') {
            wx.showToast({
                title: '请选择性别',
                icon: 'none'
            })
            return false
        }

        let sexCode = that.data.sexCode
        let constellationCode = that.data.constellationCode

        app.appRequest({
            url: "/app/userInfo/updateUserInfo.action",
            method: 'post',
            getParams: {
                "homeplace": that.data.address,
                "age": that.data.ageValue,
                "sex": sexCode,
                "constellation": constellationCode,
                "unionId": wx.getStorageSync("userInfo").unionId
            },
            success(res) {
                if (res.code == 200) {
                    wx.redirectTo({
                        url: '/pages/solar_terms/solar_terms',
                    })
                } else {
                    wx.showToast({
                        title: '服务器出错了,稍后再试',
                        icon: 'none'
                    })
                }
            }
        })
    },

    /** 获取星座. */
    getConstellationFn() {
        let that = this
        app.appRequest({
            url: "/app/sysConf/getConstellation.action",
            method: 'get',
            success(res) {
                console.log(res)
                let lists = []
                res.data.forEach(item => {
                    lists.push(item.name)
                })
                that.setData({
                    array2: lists,
                    constellationArr: res.data
                })
            }
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.getConstellationFn()
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