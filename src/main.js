import Vue from 'vue'
import App from './App.vue'
import { BootstrapVue } from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

Vue.use(BootstrapVue)

import ArrayParam from "@/components/ArrayParam"
import ObjectParam from "@/components/ObjectParam"
import BasicParam from "@/components/BasicParam"
Vue.component('array-param', ArrayParam)
Vue.component('object-param', ObjectParam)
Vue.component('basic-param', BasicParam)

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
