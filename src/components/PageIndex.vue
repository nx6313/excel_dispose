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
      <el-row>
        <el-button v-for="(rule, ruleIndex) in rules" :key="ruleIndex" :type="rule.select ? 'success' : 'info'" size="mini" :plain="!rule.select" :loading="rule.select" @click="selectRule(ruleIndex)">{{rule.txt}}</el-button>
      </el-row>
      <div class="tip" v-if="selectRuleData !== null && selectRuleData.des">
        <p>{{selectRuleData.des}}</p>
      </div>
      <!-- <el-transfer v-model="value1" :data="data"></el-transfer> -->
    </template>
    <template v-if="curStep === 2">
      <el-tooltip class="item" effect="light" content="点击下载文件" placement="bottom">
        <el-button type="primary" icon="el-icon-download" circle @click="exportExcel"></el-button>
      </el-tooltip>
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
      excelDatas: [],
      rules: [
        {
          key: 'rule-1',
          txt: '规则一',
          select: false,
          des: '规则一规则一规则一规则一规则一规则一规则一规则一规则一规则一规则一'
        },
        {
          key: 'rule-2',
          txt: '规则二',
          select: false,
          des: '规则二规则二规则二规则二规则二规则二规则二规则二规则二规则二'
        },
        {
          key: 'rule-3',
          txt: '规则三',
          select: false,
          des: '规则三规则三规则三规则三规则三规则三规则三规则三规则三规则三规则三规则三规则三规则三规则三规则三规则三规则三规则三规则三规则三规则三规则三规则三规则三规则三规则三'
        },
        {
          key: 'rule-4',
          txt: '规则四',
          select: false,
          des: '规则四规则四规则四规则四规则四规则四规则四规则四规则四规则四规则四规则四规则四规则四规则四规则四规则四规则四规则四规则四规则四'
        },
        {
          key: 'rule-5',
          txt: '规则五',
          select: false,
          des: '规则五规则五规则五规则五规则五规则五规则五规则五规则五规则五规则五规则五规则五规则五规则五规则五规则五规则五规则五规则五规则五规则五规则五规则五规则五规则五规则五规则五规则五规则五规则五规则五规则五'
        }
      ],
      selectRuleData: null
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
          background: 'rgba(0, 0, 0, 0.4)'
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
    },
    selectRule (ruleIndex) {
      for (let i in this.rules) {
        this.rules[i].select = false
      }
      this.rules[ruleIndex].select = true
      this.selectRuleData = this.rules[ruleIndex]
    }
  }
}
</script>

<style lang="scss" scoped>
.data-tables {
  position: relative;
  margin-top: 0.9rem;
}

.tip {
  position: relative;
  background-color: #dcebff;
  color: #313131;
  border-radius: 4px;
  overflow: hidden;
  margin: 0.6rem 14rem;
  text-align: left;
  padding: 0 0.2rem 0 0.8rem;
  font-size: 0.8rem;
}

.tip::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 0.3rem;
  background-color: #0a92bb;
}
</style>
