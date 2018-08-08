export default {
  install: function (Vue, options) {
    var Moment = {
      XLSX: require('xlsx')
    }

    Object.defineProperty(Vue.prototype, '$moment', { value: Moment })
  }
}
