import Vue from 'vue'
import Router from 'vue-router'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import ComFun from '@/utils/comfun'
import Moment from '@/utils/moment'
import PageIndex from '@/components/PageIndex'

Vue.use(Router)
Vue.use(ElementUI)
Vue.use(ComFun)
Vue.use(Moment)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'page-index',
      component: PageIndex
    }
  ]
})
