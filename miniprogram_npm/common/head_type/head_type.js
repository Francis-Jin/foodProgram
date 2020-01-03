// miniprogram_npm/common/head_type/head_type.js
var app = getApp();
console.log(app)
Component({
    /**
     * 组件的属性列表
     */
    properties: {

    },

    /**
     * 组件的初始数据
     */
    data: {
        hourDeg: 0,
        minuteDeg: 0,
        secondDeg: 0,
        urlBefore: app.globalData.urlBefore,
    },

    /**
     * 组件的方法列表
     */
    methods: {
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

        /** 跳转到预约今日菜品页面. */
        toAppointmentTodayFn(e){
            let date = new Date()
            let y = date.getFullYear() , m = date.getMonth() + 1 , d = date.getDate()
            if(m<10) m = '0' + m
            if(d<10) d = '0' + d
            let str = y + '-' + m + '-' + d
            // wx.navigateTo({
            //     url: '/pages/appointment_today/appointment_today?isToDay=true&selectedDate=' + str + '&category=2',
            // })
            wx.redirectTo({
                url: '/pages/index/index',
            })
        }
    },


    ready(){
        let that = this
        this.clockFn()
        setInterval(function () {
            that.clockFn()
        }, 100);
        this.getTwelveHourByNow()
    }
})
