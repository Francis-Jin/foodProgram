// miniprogram_npm/common/calendar/calendar.js
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        isShowDate: Boolean
    },

    /**
     * 组件的初始数据
     */
    data: {
        // 日历部分参数
        isShowDate: false, //是否需要显示日期日历这个模块；
        isShowPrevNext: false, //是否需要显示上一月下一月按钮
        selectedDayIndex: null, // 选中的当前日期
        selectedDate: null,
    },

    /**
     * 组件的方法列表
     */
    methods: {

        /** 隐藏日期选择. */
        hideSelectedDateFn() {
            let that = this
            that.setData({
                isShowDate: false
            })
        },

        /** 确认选择的日期时间，跳转页面. */
        confirmToPageAppointment() {
            let that = this
            let date = that.data.selectedDate
            let time = that.data.selectedTime
            let userInfo = wx.getStorageSync("userInfo")
            if (!userInfo) {
                wx.redirectTo({
                    url: '/pages/login/login?isLogin=true',
                })
                return false
            }
            if (!date) {
                wx.showToast({
                    title: '请选择日期',
                    icon: 'none'
                })
                return false
            }
            console.log(date)
            // if(!time){
            //     wx.showToast({
            //         title: '请选择时间',
            //         icon: 'none'
            //     })  
            //     return false 
            // }
            wx.navigateTo({
                url: '/pages/booking_method/booking_method?date=' + date,
            })
        },

        /** 点击日历. */
        linkSuccessSituation(e) {
            console.log(e)
            let that = this
            let status = e.currentTarget.dataset.status
            let index = e.currentTarget.dataset.index
            let thisDay = e.currentTarget.dataset.thisday
            let clickDay = e.currentTarget.dataset.day
            if (clickDay < 10) {
                clickDay = '0' + clickDay
            }
            let date = e.currentTarget.dataset.date.join('-') + "-" + clickDay
            let reduce = that.datedifference(date)
            if (reduce < 1) {
                // if (!status) {
                //     wx.showToast({
                //         title: '不可选择今日之前',
                //         icon: 'none'
                //     })
                // }
                return false
            } else {
                if (!status) {
                    that.setData({
                        selectedDayIndex: index,
                        selectedDate: date,
                    })
                }
            }
        },

        /** 计算日期差. */
        datedifference(date) { //sDate1和sDate2是2006-12-18格式 
            var dateSpan,
                tempDate,
                iDays;
            let toDay = new Date()
            let y = toDay.getFullYear(), m = toDay.getMonth() + 1, d = toDay.getDate()
            if (d < 10) d = '0' + d
            let str = y + '-' + m + '-' + d
            str = Date.parse(str);
            date = Date.parse(date);
            dateSpan = date - str;
            // dateSpan = Math.abs(dateSpan);
            iDays = Math.floor(dateSpan / (24 * 3600 * 1000));
            return iDays
        },

        //日历显示 最关键方法：
        dateData: function (showYear, showMonth) {
            let dataAll = []; //总日历数据
            let prevDataAll = []; //上一个月日历总书据；
            let nextDataAll = []; //下一个月日历总书据；
            let date = new Date //当前日期
            let year = date.getFullYear() //当前年
            let month = date.getMonth() + 1 //当前月份
            let day = date.getDate() //当天
            let thisDate = [year, month, day]; //当天日期信息
            let week = date.getDay(); //当天星期几
            if (showYear) {
                year = showYear //显示年
            }
            if (showMonth) {
                month = showMonth //显示月
            }
            let showDate = [year, month]; //当前显示日期信息
            //获取显示月的天数
            let prevMonthDays = new Date(year, month - 1, 0).getDate(); //上一个月一共显示多少天
            let monthDays = new Date(year, month, 0).getDate(); //本月一共显示多少天
            let nextMonthDays = new Date(year, month + 1, 0).getDate(); //下一个月一共显示多少天
            let firstWeek = new Date(year + '/' + month + '/' + '1').getDay(); //获取当月1号对应星期几；
            // console.log('本月1号星期：' + firstWeek);
            let prevDaysCount = prevMonthDays //上月一共显示多少天
            let daysCount = monthDays //本月一共显示多少天
            let dayscNow = 0 //计数器
            //把上月的天数转为数组
            for (let i = 1; i <= prevDaysCount; i++) {
                prevDataAll.push(i)
            }
            //获取上月日历在本月应该显示几个数据
            let getPLn = 0;
            for (let i = 0; i < firstWeek; i++) {
                getPLn += 1;
            }
            //截取上一月在本月显示的数据
            let newarr1 = prevDataAll.splice(prevDaysCount - getPLn, prevDaysCount);
            for (let i = 0; i < newarr1.length; i++) {
                dataAll.push(newarr1[i]);
            }
            //把当月的天数转为数组
            for (let i = 1; i <= daysCount; i++) {
                dataAll.push(i)
            }
            //把下月的天数转为数组
            for (let i = 1; i <= nextMonthDays; i++) {
                nextDataAll.push(i)
            }
            //截取下一月在本月显示的数据
            // console.log(dataAll.length);
            var Variable = 35;
            if (getPLn < 5) Variable = 35;
            if (getPLn >= 5) Variable = 42;
            if (getPLn == 5 && daysCount == 30) Variable = 35;
            if (daysCount == 28 || daysCount == 29) Variable = 35;
            let newarr2 = nextDataAll.splice(0, Variable - dataAll.length);
            let lastLen = dataAll.length;
            for (let i = 0; i < newarr2.length; i++) {
                dataAll.push(newarr2[i]);
            }

            // console.log(dataAll);
            // console.log(nextDataAll);
            this.setData({
                date: dataAll,
                firstWeek: firstWeek,
                thisDate: thisDate,
                showDate: showDate,
                getPLn: getPLn,
                lastLen: lastLen,
            })
        },
        //跳转至上个月
        goPre: function () {
            var thisDate = this.data.showDate;
            var month = thisDate[1] - 1;
            var year = thisDate[0];
            if (month <= 0) {
                month = 12;
                year--;
            }
            this.dateData(year, month);

        },
        //跳转至下个月
        goNext: function () {
            var thisDate = this.data.showDate;
            var month = thisDate[1] + 1;
            var year = thisDate[0];
            if (month >= 13) {
                month = 1;
                year++;
            }
            this.dateData(year, month);

        },
        //跳转至今日
        goToday: function () {
            this.dateData();
        },
    },

    ready(){
        this.dateData();
    }
})
