export default {
  install: function (Vue, options) {
    var ComFun = {
      http_get: function (context, url) {
        context.$http.options.headers = {
          'Content-Type': 'application/json;charset=utf-8'
        }
        if (context && url) {
          var http = new Promise((resolve, reject) => {
            var callUrl = context.$moment.server() + url
            if (url.indexOf('http://') === 0 || url.indexOf('https://') === 0) {
              callUrl = url
            }
            context.$http.get(callUrl).then(response => {
              if (this.isAndroidIos().isMobile) {
                console.log(JSON.stringify({
                  '请求结果': '接口访问完成：url【' + url + '】',
                  '链接': callUrl,
                  '请求返回': response
                }))
              } else {
                console.log({
                  '请求结果': '接口访问完成：url【' + url + '】',
                  '链接': callUrl,
                  '请求返回': response
                })
              }
              context.$dialog_close_loading()
              resolve(response)
            }, response => {
              if (this.isAndroidIos().isMobile) {
                console.log(JSON.stringify({
                  '请求结果': '接口访问出错：url【' + url + '】',
                  '链接': callUrl,
                  '请求返回': response
                }))
              } else {
                console.log({
                  '请求结果': '接口访问出错：url【' + url + '】',
                  '链接': callUrl,
                  '请求返回': response
                })
              }
              context.$dialog_close_loading()
              reject(response)
            })
          })
          return http
        } else {
          console.error('上下文对象或请求地址不能为空', 'http_get(context, url)')
        }
      },
      http_post: function (context, url, params) {
        context.$http.options.headers = {
          'Content-Type': 'application/json;charset=utf-8'
        }
        if (context && url) {
          var paramsData = params || {}
          var http = new Promise((resolve, reject) => {
            var callUrl = context.$moment.server() + url
            if (url.indexOf('http://') === 0 || url.indexOf('https://') === 0) {
              callUrl = url
            }
            context.$http.post(callUrl, paramsData).then(response => {
              if (this.isAndroidIos().isMobile) {
                console.log(JSON.stringify({
                  '请求结果': '接口访问完成：url【' + url + '】',
                  '链接': callUrl,
                  '请求返回': response,
                  '相关参数': paramsData
                }))
              } else {
                console.log({
                  '请求结果': '接口访问完成：url【' + url + '】',
                  '链接': callUrl,
                  '请求返回': response,
                  '相关参数': paramsData
                })
              }
              context.$dialog_close_loading()
              resolve(response)
            }, response => {
              if (this.isAndroidIos().isMobile) {
                console.log(JSON.stringify({
                  '请求结果': '接口访问出错：url【' + url + '】',
                  '链接': callUrl,
                  '请求返回': response,
                  '相关参数': paramsData
                }))
              } else {
                console.log({
                  '请求结果': '接口访问出错：url【' + url + '】',
                  '链接': callUrl,
                  '请求返回': response,
                  '相关参数': paramsData
                })
              }
              context.$dialog_close_loading()
              reject(response)
            })
          })
          return http
        } else {
          console.error('上下文对象或请求地址不能为空', 'http_post(context, url)')
        }
      },
      http_file: function (context, url, aboutKey, file, args, progressFn) {
        context.$http.options.headers = {
          'Content-Type': 'multipart/form-data'
        }
        if (context && url && file) {
          console.log('要上传的视频对象', file)
          const formData = new FormData()
          formData.append(aboutKey, file)
          if (args) {
            formData.append('args', JSON.stringify(args))
          }
          var http = new Promise((resolve, reject) => {
            var callUrl = context.$moment.server() + url
            if (url.indexOf('http://') === 0 || url.indexOf('https://') === 0) {
              callUrl = url
            }
            context.$http.post(callUrl, formData, {
              progress (event) {
                console.log('视频上传进度', parseFloat(event.loaded / event.total * 100))
                if (progressFn && typeof progressFn === 'function' && Object.prototype.toString.call(progressFn).toLowerCase() === '[object function]') {
                  progressFn(parseFloat(event.loaded / event.total))
                }
              }
            }).then(response => {
              console.log('接口访问完成：url【' + url + '】', {
                '链接': callUrl,
                '请求返回': response,
                '要上传的视频对象': file
              })
              context.$dialog_close_loading()
              resolve(response)
            }, response => {
              console.log('接口访问出错：url【' + url + '】', {
                '链接': callUrl,
                '请求返回': response,
                '要上传的视频对象': file
              })
              context.$dialog_close_loading()
              reject(response)
            })
          })
          return http
        } else {
          console.error('上下文对象或请求地址不能为空', 'http_file(context, url)')
        }
      },
      // 判断字符串是否为空
      isNotNull: function (str) {
        if (!this.isJsonOrArr(str) && !this.isNumber(str)) {
          if (!str || str === '' || str === null || str.toLowerCase() === 'null' || typeof str === 'undefined') {
            return false
          }
        }
        return true
      },
      // 判断obj是否为json对象或数组
      isJsonOrArr (obj) {
        var isjson = typeof obj === 'object' && (Object.prototype.toString.call(obj).toLowerCase() === '[object object]' || Object.prototype.toString.call(obj).toLowerCase() === '[object array]' || Object.prototype.toString.call(obj).toLowerCase() === '[object file]')
        return isjson
      },
      // 判断obj是否为数组
      isArr (obj) {
        var isArr = typeof obj === 'object' && Object.prototype.toString.call(obj).toLowerCase() === '[object array]'
        return isArr
      },
      // 判断obj是否为数字
      isNumber (obj) {
        if (obj === '' || obj === null || obj === undefined) {
          return false
        }
        if (!isNaN(obj)) {
          return true
        } else {
          return false
        }
      },
      // 日期格式转字符串，指定格式
      // 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符
      // 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
      // 例子：
      // (new Date()).format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
      // (new Date()).format("yyyy-M-d h:m:s.S") ==> 2006-7-2 8:9:4.18
      formatDate: function (date, fmt) {
        if (date) {
          var o = {
            'M+': date.getMonth() + 1, // 月份
            'd+': date.getDate(), // 日
            'h+': date.getHours(), // 小时
            'm+': date.getMinutes(), // 分
            's+': date.getSeconds(), // 秒
            'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
            'S': date.getMilliseconds() // 毫秒
          }
          if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
          }
          for (var k in o) {
            if (new RegExp('(' + k + ')').test(fmt)) {
              fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)))
            }
          }
          return fmt
        }
        return null
      },
      // 获取指定日期几天前或几天后的日期，未指定日期按照当前日期计算
      getTargetDate (diff, date) {
        var today = new Date()
        if (date !== undefined) {
          today = date
        }
        var targetdayMilliseconds = today.getTime() + 1000 * 60 * 60 * 24 * Number(diff)
        var targetday = new Date()
        targetday.setTime(targetdayMilliseconds)
        return targetday
      },
      // 获取指定周的起止日期
      getWeekStartEnd (addWeekCount) {
        if (!addWeekCount) {
          addWeekCount = 0
        }
        var startEnd = []
        var milliSecond = 1000 * 60 * 60 * 24
        var currentDate = new Date()
        currentDate = new Date(currentDate.getTime() + (milliSecond * 7 * addWeekCount))
        var week = currentDate.getDay()
        var minusDay = week !== 0 ? week - 1 : 6
        var currentWeekFirstDay = new Date(currentDate.getTime() - (milliSecond * minusDay))
        var currentWeekLastDay = new Date(currentWeekFirstDay.getTime() + (milliSecond * 6))
        startEnd.push(currentWeekFirstDay)
        startEnd.push(currentWeekLastDay)
        return startEnd
      },
      // 获取指定月的起止日期
      getMonthStartEnd (addMonthCount) {
        if (!addMonthCount) {
          addMonthCount = 0
        }
        var startEnd = []
        var currentDate = new Date()
        currentDate.setDate(1)
        currentDate.setMonth(currentDate.getMonth() + addMonthCount)
        var year = currentDate.getFullYear()
        var month = currentDate.getMonth()
        var currentMonthLastDay = null
        if (year === new Date().getFullYear() && month === new Date().getMonth()) {
          currentMonthLastDay = new Date()
        } else {
          currentMonthLastDay = this.getLastDay(year, month + 1)
        }
        startEnd.push(currentDate)
        startEnd.push(currentMonthLastDay)
        return startEnd
      },
      // 获取指定年的起止日期
      getYearStartEnd (addYearCount) {
        if (!addYearCount) {
          addYearCount = 0
        }
        var startEnd = []
        var currentDate = new Date()
        currentDate.setDate(1)
        currentDate.setFullYear(currentDate.getFullYear() + addYearCount)
        var year = currentDate.getFullYear()
        var currentYearLastDay = null
        if (year === new Date().getFullYear()) {
          currentYearLastDay = new Date()
        } else {
          currentYearLastDay = this.getLastDay(year, 12)
        }
        startEnd.push(currentDate)
        startEnd.push(currentYearLastDay)
        return startEnd
      },
      // 获取某月最后一天日期
      getLastDay (year, month) {
        var newYear = year
        var newMonth = month++
        if (newMonth > 12) {
          newMonth -= 12
          newYear++
        }
        var newDate = new Date(newYear, newMonth, 1)
        return new Date(newDate.getTime() - 1000 * 60 * 60 * 24)
      },
      // 将相差的毫秒数转为时间
      formatDiffMilliseconds (diffMilliseconds) {
        let dayMill = 24 * 60 * 60 * 1000
        let hourMill = 60 * 60 * 1000
        let minuteMill = 60 * 1000
        let secondMill = 1000
        let day = Math.floor(diffMilliseconds / dayMill)
        let dayResidue = diffMilliseconds % dayMill
        let hour = Math.floor(dayResidue / hourMill)
        let hourResidue = dayResidue % hourMill
        let minute = Math.floor(hourResidue / minuteMill)
        let minuteResidue = hourResidue % minuteMill
        let second = Math.floor(minuteResidue / secondMill)
        let returnVal = ''
        if (day > 0) {
          returnVal += day + ' 天 '
        }
        if (hour > 0) {
          returnVal += hour + ' 小时 '
        }
        if (minute > 0) {
          returnVal += minute + ' 分钟 '
        }
        if (day === 0 && hour === 0 && minute === 0) {
          returnVal = second + ' 秒 '
        }
        return returnVal
      },
      // 判断设备类型
      isAndroidIos: function () {
        var p = navigator.platform
        var u = navigator.userAgent
        var app = navigator.appVersion
        var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Linux') > -1 // android终端或者uc浏览器
        var isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/) // ios终端
        return {
          isAndroid: isAndroid,
          isiOS: isiOS,
          platform: p,
          isMobile: !(p.toLowerCase().indexOf('win') >= 0 || p.toLowerCase().indexOf('mac') >= 0),
          deviceInfo: app
        }
      },
      // 获取网址中的参数
      getRequest: function (key) {
        var url = location.href
        var theRequest = {}
        if (url.indexOf('?') !== -1) {
          var str = url.split('?')[1]
          var strs = str.split('&')
          for (var i = 0; i < strs.length; i++) {
            theRequest[strs[i].split('=')[0]] = strs[i].split('=')[1]
          }
        }
        if (key) {
          return theRequest[key]
        }
        return theRequest
      },
      // 生成uuid
      guid () {
        return ((((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1) +
        (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1) + '-' +
        (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1) + '-' +
        (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1) + '-' +
        (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1) + '-' +
        (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1) +
        (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1) +
        (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1))
      },
      // 根据指定键返回json的数组中与所查找的值相同的数据位置
      getIndexInJsonArr (jsonArr, key, search) {
        var index = -1
        for (let i = 0; i < jsonArr.length; i++) {
          if (jsonArr[i][key] === search) {
            index = i
            break
          }
        }
        return index
      }
    }

    Object.defineProperty(Vue.prototype, '$comfun', { value: ComFun })
  }
}
