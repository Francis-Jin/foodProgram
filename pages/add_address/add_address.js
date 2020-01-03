// pages/add_address/add_address.js
var app = getApp()
let citys = []
Page({

    /**
     * 页面的初始数据
     */
    data: {
        userName: '',
        userPhone: '',
        doorpValue: '',
        addressSelectedText: '',
        isAddAndEdit: false,
        isPhoneError: false,
        objectMultiArray: [],
        selectedIndex: [0,0,0,0],
        addressId: '',
        // 地址选择数据
        showAddress: false,
        columns: "",
        isdefaultAddress: false, //是否设置为默认地址
    },

    /** 地址联动. */
    vantAddressChange(e) {
        const {
            picker,
            value,
            index
        } = e.detail;
        if (index == 0) {
            if (value[0].child) picker.setColumnValues(1, value[0].child);
            if (value[0].child[0].child) picker.setColumnValues(2, value[0].child[0].child);
            if (value[0].child[0].child[0].child) picker.setColumnValues(3, value[0].child[0].child[0].child);
        }
        if (index == 1) {
            if (value[1].child) picker.setColumnValues(2, value[1].child);
            if (value[1].child[0].childd) picker.setColumnValues(3, value[1].child[0].child);
        }
        if(index == 2){
            if (value[2].child) picker.setColumnValues(3, value[2].child);
        }
    },

    /** 默认地址设置改变时 */
    switch1Change(e){
        let isdefaultAddress = e.detail.value
        this.setData({
            isdefaultAddress: isdefaultAddress
        })
    },

    /** 确认选择地址. */
    onConfirm(e) {
        let that = this
        let d = e.detail.value
        let selectedIndex = e.detail.index
        console.log(selectedIndex)
        let code = []
        let addressSelectedText = ''
        d.forEach(item => {
            if(item) {
                code.push(item.code)
                addressSelectedText += item.name
            }
        })
       if(code.length<3){
           wx.showModal({
               title: '提示',
               showCancel:false,
               content: addressSelectedText + "下无可选单元，请联系管理员",
               confirmColor: "#5bcbc8",
               success() {
                   that.setData({
                       code: code,
                       showAddress: false,
                       addressSelectedText: ""
                   })
               }
           })
       }else{
           that.setData({
               code: code,
               selectedIndex: selectedIndex,
               showAddress: false,
               addressSelectedText: addressSelectedText
           })
       }

    },

    /** 获取默认地址，全局存储. */
    getDefaultAddress() {
        if (wx.getStorageSync("userInfo").id) {
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

    /** 显示上拉框. */
    showAddressPickerFn() {
        let that = this
        let selectedIndex = that.data.selectedIndex
        let citys = that.data.citys
        let arr = [{
                values: citys,
                className: 'column1',
                defaultIndex: selectedIndex[0]
            },
            {
                values: citys[selectedIndex[0]].child,
                className: 'column2',
                defaultIndex: selectedIndex[1]
            },
            {
                values: citys[selectedIndex[0]].child[selectedIndex[1]].child,
                className: 'column3',
                defaultIndex: selectedIndex[2]
            },
            {
                values: citys[selectedIndex[0]].child[selectedIndex[1]].child[selectedIndex[2]].child,
                className: 'column4',
                defaultIndex: selectedIndex[3]
            }
        ]
        that.setData({
            columns: arr,
            showAddress: true
        })
    },

    /** 隐藏上拉狂. */
    onClose() {
        this.setData({
            showAddress: false
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        let type = options.type
        let addressId = options.addressId
        if (type == 'edit') {
            // 编辑地址
            let userName = options.userName
            let userPhone = options.userPhone
            let addressSelectedText = options.addressSelectedText
            let doorpValue = options.doorpValue
            let isDefault = options.isDefault
            let code = options.code
            let selectIndex = options.selectIndex
            if(selectIndex){
                selectIndex = options.selectIndex.split(',')
                selectIndex.length < 4 ? selectIndex.push('0') : selectIndex
            }else{
                selectIndex = [0,0,0,0]
            }
            this.setData({
                type: type,
                selectedIndex: selectIndex,
                addressId: addressId,
                isAddAndEdit: true,
                userName: userName,
                userPhone: userPhone,
                isdefaultAddress: isDefault == 1 ? true : false,
                addressSelectedText: addressSelectedText,
                doorpValue: doorpValue,
                code: code.split(',')
            })
        } else {
            this.setData({
                type: type,
                addressId: '',
                isAddAndEdit: false
            })
        }
        this.getAddressListsFn()
    },

    /** 删除地址. */
    deleteAddressFn() {
        let that = this
        app.appRequest({
            url: '/app/userAddress/deleteUserAddress.action',
            method: 'post',
            postData: {
                id: that.data.addressId
            },
            success(res) {
                wx.showToast({
                    title: '已删除',
                    icon: 'none',
                    duration: 3000,
                    success() {
                        setTimeout(function() {
                            wx.navigateBack({
                                detal: 1
                            })
                        }, 1000)
                    }
                })
            }
        })
    },

    /** 获取地址选项数据 */
    getAddressListsFn() {
        let that = this
        app.appRequest({
            url: "/app/userAddress/listAddress.action",
            method: "get",
            success(res) {
                citys = res.data
                let arr = [{
                        values: citys,
                        className: 'column1',
                        defaultIndex: 0
                    },
                    {
                        values: citys[0].child,
                        className: 'column2',
                        defaultIndex: 0
                    },
                    {
                        values: citys[0].child[0].child,
                        className: 'column3',
                        defaultIndex: 0
                    }, 
                    {
                        values: citys[0].child[0].child[0].child,
                        className: 'column4',
                        defaultIndex: 0
                    }
                ]
                that.setData({
                    citys: citys,
                    columns: arr
                })

            }
        })
    },

    /** 姓名输入时。 */
    onChange(e) {
        this.setData({
            userName: e.detail
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
                userPhone: phone
            })
        }

    },

    /** 手机号失去焦点时. */
    phoneBlur(e) {
        let phone = e.detail.value
        let r = /^1[3456789]\d{9}$/
        if (!(r.test(phone))) {
            this.setData({
                userPhone: '',
                isPhoneError: true
            })
            return false
        } else {
            this.setData({
                isPhoneError: false,
                userPhone: phone
            })
        }
    },
    /** 门牌号输入时。 */
    addressChange(e) {
        this.setData({
            doorpValue: e.detail
        })
    },

    /** 点击确定添加按钮 */
    addAddressFn() {
        let that = this
        let selectedIndex = that.data.selectedIndex
        if (!that.data.userName) {
            wx.showToast({
                title: '请输入姓名',
                icon: 'none'
            })
            return false
        }
        if (!that.data.userPhone) {
            wx.showToast({
                title: '请输入电话',
                icon: 'none'
            })
            return false
        }
        if (!that.data.addressSelectedText) {
            wx.showToast({
                title: '请选择地址',
                icon: 'none'
            })
            return false
        }
        if (that.data.code.length < 3) {
            wx.showModal({
                title: '提示',
                showCancel: false,
                content: addressSelectedText + "下无可选单元，请联系管理员",
                confirmColor: "#5bcbc8",
            })
            return false
        }
        if (that.data.isAddAndEdit) {
            // 编辑更新
            app.appRequest({
                url: "/app/userAddress/updateUserAddress.action",
                method: 'post',
                postData: {
                    id: that.data.addressId,
                    name: that.data.userName,
                    phone: that.data.userPhone,
                    address: that.data.addressSelectedText,
                    doorplate: that.data.doorpValue,
                    communityId: that.data.code[0] ? that.data.code[0] : 0,
                    communitySectionId: that.data.code[1] ? that.data.code[1] : 0,
                    communityBuildingId: that.data.code[2] ? that.data.code[2] : 0,
                    communityBuildingUnitId: that.data.code[3] ? that.data.code[3] : 0,
                    createUser: wx.getStorageSync("userInfo").id,
                    selectIndex: selectedIndex.join(),
                    isDefault: that.data.isdefaultAddress ? 1 : 0
                },
                success(res) {
                    wx.showToast({
                        title: '已更新',
                        duration: 3000,
                        success() {
                            setTimeout(function() {
                                wx.navigateBack({
                                    detal: 1
                                })
                            }, 1000)
                        }
                    })
                }
            })
        } else {
            // 新添加
            app.appRequest({
                url: "/app/userAddress/saveUserAddress.action",
                method: 'post',
                postData: {
                    name: that.data.userName,
                    phone: that.data.userPhone,
                    address: that.data.addressSelectedText,
                    doorplate: that.data.doorpValue, 
                    communityId: that.data.code[0] ? that.data.code[0] : 0,
                    communitySectionId: that.data.code[1] ? that.data.code[1] : 0,
                    communityBuildingId: that.data.code[2] ? that.data.code[2] : 0,
                    communityBuildingUnitId: that.data.code[3] ? that.data.code[3] : 0,
                    createUser: wx.getStorageSync("userInfo").id,
                    selectIndex: selectedIndex.join(),
                    isDefault: that.data.isdefaultAddress ? 1 : 0
                },
                success(res) {
                    wx.showToast({
                        title: '添加成功',
                        duration: 3000,
                        success() {
                            setTimeout(function() {
                                wx.navigateBack({
                                    detal: 1
                                })
                            }, 1000)
                        }
                    })
                }
            })
        }

        this.getDefaultAddress()
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