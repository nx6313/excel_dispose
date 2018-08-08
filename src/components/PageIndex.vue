<template>
  <div class="page-index">
    <template v-if="curStep === 0">
      <el-button type="primary" icon="el-icon-document" circle @click="importExcel"></el-button>
      <input type="file" ref="excel-file-input" @change="importFile" id="imFile" style="display: none" v-if="!resetExcelFileInput" accept=".xls,.xlsx"/>
      <div class="data-tables">
        <el-table v-for="(table, tableIndex) in excelDatas" :key="tableIndex" :data="table" stripe border height="250" size="mini" tooltip-effect="light" :style="[{ 'width': '100%' }, tableIndex > 0 ? { 'margin-top': '0.8rem' } : {}]">
          <el-table-column v-for="(title, titleIndex) in excelFileTitles[tableIndex]" :key="titleIndex" :label="title" :prop="title" align="left" show-overflow-tooltip></el-table-column>
        </el-table>
      </div>
    </template>
    <template v-if="curStep === 1">
      <!-- <el-transfer v-model="value1" :data="data"></el-transfer> -->
    </template>
    <template v-if="curStep === 2">
      <el-button type="primary" icon="el-icon-download" circle @click="exportExcel"></el-button>
      <a ref="downlink" style="display: none"></a>
    </template>
  </div>
</template>

<script>
import { Loading } from 'element-ui'
import SparkMD5 from 'spark-md5'

export default {
  name: 'page-index',
  data () {
    return {
      loadingService: null,
      curStep: 0,
      resetExcelFileInput: false,
      selectFileMd5s: [],
      selectFiles: [],
      excelFileTitles: [],
      excelDatas: []
    }
  },
  mounted () {
    this.$root.eventHub.$on('toPreStep', (step) => {
      this.curStep -= 1
      this.$root.eventHub.$emit('toPreStepPage')
    })
    this.$root.eventHub.$on('toNextStep', (step) => {
      if (step === 0) {
        if (this.selectFiles.length < 2) {
          this.$message.error('请至少选择2个文件')
          return false
        }
      }
      this.curStep += 1
      this.$root.eventHub.$emit('toNextStepPage')
    })
  },
  methods: {
    importExcel () {
      this.$refs['excel-file-input'].click()
    },
    exportExcel () {
      let data = [{}]
      for (let k in this.excelDatas[0][0]) {
        data[0][k] = k
      }
      data = data.concat(this.excelDatas[0])
      this.downloadExl(data, '文件名')
    },
    importFile () {
      var f = this.$refs['excel-file-input'].files[0]
      if (f.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || f.type === 'application/vnd.ms-excel') {
        this.loadingService = Loading.service({
          fullscreen: true,
          lock: true,
          spinner: 'el-icon-loading',
          text: '文件导入中',
          background: 'rgba(240, 240, 240, 0.8)'
        })
        var spark = new SparkMD5()
        var reader = new FileReader()
        this.resetExcelFileInput = true
        reader.onload = (e) => {
          var data = e.target.result
          spark.appendBinary(data)
          if (this.rABS) {
            this.wb = this.$moment.XLSX.read(btoa(this.fixdata(data)), {
              type: 'base64'
            })
          } else {
            this.wb = this.$moment.XLSX.read(data, {
              type: 'binary'
            })
          }
          let json = this.$moment.XLSX.utils.sheet_to_json(this.wb.Sheets[this.wb.SheetNames[0]])
          this.dealFile(f, json, spark)
        }
        reader.onerror = (e) => {
          this.loadingService.close()
          this.$message.error(e)
        }
        if (this.rABS) {
          reader.readAsArrayBuffer(f)
        } else {
          reader.readAsBinaryString(f)
        }
      } else {
        this.$message({
          message: '请选择xls文件或者xlsx文件',
          type: 'warning',
          duration: 1800
        })
      }
    },
    dealFile (f, data, spark) {
      this.loadingService.close()
      this.resetExcelFileInput = false
      if (data.length <= 0) {
        this.$message({
          message: '文件为空',
          type: 'warning',
          duration: 1800
        })
      } else {
        var fileMd5 = spark.end()
        if (this.selectFileMd5s.indexOf(fileMd5) >= 0) {
          this.$message({
            message: '文件已存在',
            type: 'warning',
            duration: 1800
          })
        } else {
          this.selectFileMd5s.push(fileMd5)
          this.selectFiles.push(f)
          this.excelDatas.push(data)
          var excelTitles = []
          for (let k in data[0]) {
            excelTitles.push(k)
          }
          this.excelFileTitles.push(excelTitles)
        }
      }
    },
    downloadExl (json, downName, type) {
      let keyMap = []
      for (let k in json[0]) {
        keyMap.push(k)
      }
      let tmpData = []
      json.map((v, i) => keyMap.map((k, j) => Object.assign({}, {
        v: v[k],
        position: (j > 25 ? this.getCharCol(j) : String.fromCharCode(65 + j)) + (i + 1)
      }))).reduce((prev, next) => prev.concat(next)).forEach((v) => {
        tmpData[v.position] = {
          v: v.v
        }
      })
      let outputPos = Object.keys(tmpData)
      let tmpWB = {
        SheetNames: ['mySheet'],
        Sheets: {
          'mySheet': Object.assign({}, tmpData, {
            '!ref': outputPos[0] + ':' + outputPos[outputPos.length - 1]
          })
        }
      }
      let tmpDown = new Blob([this.s2ab(this.$moment.XLSX.write(tmpWB, {
        bookType: (type === undefined ? 'xlsx' : type), bookSST: false, type: 'binary'
      }))], {
        type: ''
      })
      var href = URL.createObjectURL(tmpDown)
      this.$refs['downlink'].download = downName + '.xlsx'
      this.$refs['downlink'].href = href
      this.$refs['downlink'].click()
      setTimeout(() => {
        URL.revokeObjectURL(tmpDown)
      }, 100)
    },
    s2ab (s) { // 字符串转字符流
      var buf = new ArrayBuffer(s.length)
      var view = new Uint8Array(buf)
      for (let i = 0; i !== s.length; ++i) {
        view[i] = s.charCodeAt(i) & 0xFF
      }
      return buf
    },
    getCharCol (n) { // 将指定的自然数转换为26进制表示。映射关系：[0-25] -> [A-Z]
      let s = ''
      let m = 0
      while (n > 0) {
        m = n % 26 + 1
        s = String.fromCharCode(m + 64) + s
        n = (n - m) / 26
      }
      return s
    },
    fixdata (data) { // 文件流转BinaryString
      var o = ''
      var l = 0
      var w = 10240
      for (; l < data.byteLength / w; ++l) {
        o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w, l * w + w)))
      }
      o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w)))
      return o
    }
  }
}
</script>

<style lang="scss" scoped>
.data-tables {
  position: relative;
  margin-top: 0.9rem;
}
</style>
