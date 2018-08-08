<template>
  <div id="app">
    <el-steps :active="active" align-center>
      <el-step v-for="(step, stepIndex) in steps" :key="stepIndex" :title="step.title" :icon="step.icon" :description="step.description"></el-step>
    </el-steps>
    <el-button type="warning" class="next-step-btn" @click="toPreStep" v-if="active > 0 && active < steps.length">上一步</el-button>
    <el-button type="primary" class="next-step-btn" @click="toNextStep" v-if="active < steps.length - 1">下一步</el-button>
    <router-view class="router-view-wrap"/>
  </div>
</template>

<script>
export default {
  name: 'App',
  data () {
    return {
      steps: [
        {
          title: '选择文件',
          icon: 'el-icon-upload2',
          description: '请选择至少两个excel文件，注意：文件必须包含标题栏，并且数据必须是一行一条'
        },
        {
          title: '设定规则',
          icon: 'el-icon-setting',
          description: '设定excel文件之间合并的规则'
        },
        {
          title: '输出文件',
          icon: 'el-icon-printer',
          description: '按照合并规则输出文件'
        }
      ],
      active: 0
    }
  },
  mounted () {
    this.$root.eventHub.$on('toPreStepPage', () => {
      this.active -= 1
    })
    this.$root.eventHub.$on('toNextStepPage', () => {
      this.active += 1
    })
  },
  methods: {
    toPreStep () {
      this.$root.eventHub.$emit('toPreStep', this.active)
    },
    toNextStep () {
      this.$root.eventHub.$emit('toNextStep', this.active)
    }
  }
}
</script>

<style>
html, body {
  padding: 0;
  margin: 0;
}

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #202020;
  font-size: 1rem;
  text-align: center;
  user-select: none;
}

.el-steps {
  margin-top: 2.8rem;
}

.router-view-wrap {
  position: relative;
  padding: 0.6rem 0.8rem;
  margin-top: 1.8rem;
}

.next-step-btn {
  margin-top: 1.4rem;
}
</style>
