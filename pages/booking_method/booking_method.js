// pages/booking_method/booking_method.js
var app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        isShowDate: false,
        firstBookWordLists: [],
        moreBookWordLists: [],
        isShowMore: false, //是否显示更多数据
        selectedElNum: 0, // 选中个数
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        console.log(options)
        let that = this
        that.setData({
            selectedDateValue: options.date
        })
        that.getBookWordfn()
    },

    /** 跳转到取快递. */
    toDeliveryFn() {
        this.setData({
            isShowDate: true
        })
    },

    /** 跳转预约早餐. */
    toAppointmentTodayFn(e) {
        let that = this
        let selectedDateValue = that.data.selectedDateValue
        let ThisDateValue = new Date()
        let y = ThisDateValue.getFullYear()
        let m = ThisDateValue.getMonth() + 1
        let d = ThisDateValue.getDate()
        let h = ThisDateValue.getHours()
        let mm = ThisDateValue.getMinutes()
        let s = ThisDateValue.getSeconds()
        let ThisDateValueStr = y + '-' + that.isZeroFn(m) + '-' + that.isZeroFn(d)
        let ThisTimeValueStr = that.isZeroFn(h) + ':' + that.isZeroFn(mm) + ':' + that.isZeroFn(s)
        let isThisDay = new Date(selectedDateValue).getTime() - new Date(ThisDateValueStr).getTime()
        isThisDay = isThisDay == 0 ? true : false
        wx.navigateTo({
            url: '/pages/appointment_today/appointment_today?isToDay=false&selectedDate=' + this.data.selectedDateValue + '&category=1' + '&isThisDay=' + isThisDay + '&thisTime=' + ThisTimeValueStr,
        })
    },

    /** 页面跳转下一步. */
    toPageFn(e) {
        let that = this
        let type = e.currentTarget.dataset.type
        let selectedDateValue = that.data.selectedDateValue
        let firstBookWordLists = that.data.firstBookWordLists
        let moreBookWordLists = that.data.moreBookWordLists
        let arr1 = firstBookWordLists.filter(item => item.active)
        let selectedArrId = []
        let symptomId = []
        let ThisDateValue = new Date()
        let y = ThisDateValue.getFullYear()
        let m = ThisDateValue.getMonth() + 1
        let d = ThisDateValue.getDate()
        let h = ThisDateValue.getHours()
        let mm = ThisDateValue.getMinutes()
        let s = ThisDateValue.getSeconds()
        let ThisDateValueStr = y + '-' + that.isZeroFn(m) + '-' + that.isZeroFn(d)
        let ThisTimeValueStr = that.isZeroFn(h) + ':' + that.isZeroFn(mm) + ':' + that.isZeroFn(s)
        let isThisDay = new Date(selectedDateValue).getTime() - new Date(ThisDateValueStr).getTime()
        isThisDay = isThisDay == 0 ? true : false
        arr1.forEach(item=>{
            selectedArrId.push(item.fiveInternalOrgansId)
            symptomId.push(item.id)
        })
        moreBookWordLists.forEach(item=>{
            item.fiveInternalOrgansSymptoms.forEach(subitem => {
                if(subitem.active){
                    selectedArrId.push(subitem.fiveInternalOrgansId),
                    symptomId.push(subitem.id)
                }
            })
        })
        if(selectedArrId.length == 0) {
            wx.showToast({
                title: "请选择功能",
                icon: 'none'
            })
            return false
        }
        wx.navigateTo({
            url: '/pages/make_an_appointment/make_an_appointment?selectedDateValue=' + selectedDateValue + '&selectedWordId=' + selectedArrId.join() + '&symptomId=' + symptomId.join() + '&isThisDay=' + isThisDay + '&thisTime=' + ThisTimeValueStr,
        })
    },

    isZeroFn(str){
        if(str < 10) str = '0' + str
        return str
    },


    /** 获取预约词语. */
    getBookWordfn() {
        // /app/dishInfo/bookWord.action
        let that = this
        app.appRequest({
            url: "/app/dishInfo/bookWord.action",
            method: 'get',
            success(res) {
                if (res.code == 200) {
                    let colorIndex = 1
                    res.data.high.forEach(item => {
                        colorIndex++
                        if (colorIndex > 6) {
                            colorIndex = 1
                        }
                        item.colorIndex = colorIndex
                        item.fiveInternalOrgansSymptoms.forEach(subitem => {
                            subitem.active = false
                        })
                    })
                    res.data.base.forEach(item => {
                        item.active = false
                    })
                    that.setData({
                        firstBookWordLists: res.data.base,
                        moreBookWordLists: res.data.high
                    })
                } else {
                    wx.showToast({
                        title: res.message,
                        icon: 'none'
                    })
                }
            }
        })
    },

    /** 点击显示更多数据. */
    showMoreFn() {
        let that = this
        let isShowMore = that.data.isShowMore
        that.setData({
            isShowMore: !isShowMore
        })
    },

    /** 点击选择元素. */
    selectedThisItem(e) {
        let that = this
        let _item = e.currentTarget.dataset.item
        let type = e.currentTarget.dataset.type
        let firstBookWordLists = that.data.firstBookWordLists
        let moreBookWordLists = that.data.moreBookWordLists
        let arrLength = firstBookWordLists.filter(item => item.active).length
        let subArrLength = 0
        moreBookWordLists.forEach(item => {
            subArrLength += item.fiveInternalOrgansSymptoms.filter(subitem => subitem.active).length
        })
        let allLength = arrLength + subArrLength
        that.setData({
            selectedElNum: allLength
        })

        let selectedElNum = that.data.selectedElNum

        if (selectedElNum > 1) {
            
            firstBookWordLists.forEach(item => {
                if (_item.id == item.id && item.active) {
                    item.active = false
                }
            })

            that.setData({
                firstBookWordLists: firstBookWordLists
            })

            moreBookWordLists.forEach(item => {
                item.fiveInternalOrgansSymptoms.forEach(subitem => {
                    if (_item.id == subitem.id && subitem.active) {
                        subitem.active = false
                    }
                })
            })

            that.setData({
                moreBookWordLists: moreBookWordLists
            })

            wx.showToast({
                title: '最多选择两个',
                icon: 'none'
            })

            return false
        } else {

            if (type == 1) {
                firstBookWordLists.forEach(item => {
                    if (_item.id == item.id) {
                        item.active = !item.active
                    }
                })

                that.setData({
                    firstBookWordLists: firstBookWordLists
                })
            }
            if (type == 2) {
                moreBookWordLists.forEach(item => {
                    item.fiveInternalOrgansSymptoms.forEach(subitem => {
                        if (_item.id == subitem.id) {
                            subitem.active = !subitem.active
                        }
                    })
                })
                that.setData({
                    moreBookWordLists: moreBookWordLists
                })

            }
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