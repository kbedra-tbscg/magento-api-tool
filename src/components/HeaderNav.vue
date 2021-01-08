<template>
  <div class="p-4 bg-info">
    <h1 class="text-white font-weight-bold">Magento API POC</h1>
    <b-row>
      <b-col sm="4">
        <b-form-group
            id="shopUrl"
            label-cols-sm="3"
            label="Shop url"
            label-for="input-horizontal"
            class="text-white"
        >
          <b-form-input id="shopUrl" v-model="shopUrlModel" @keyup="$emit('update:shopUrl', shopUrlModel);" placeholder="Shop Url"></b-form-input>
        </b-form-group>
      </b-col>
      <b-col sm="4">
        <b-form-group
            id="user"
            label-cols-sm="3"
            label="User type"
            label-for="input-horizontal"
            class="text-white"
        >
          <b-form-select id="user" v-model="type" :options="options" @change="login"></b-form-select>
        </b-form-group>
      </b-col>
      <b-col sm="4">
        <small class="text-white">Token: {{user.token}}</small><br/>
        <small v-if="user.username!==''" class="text-white">Username: {{user.username}}</small>
      </b-col>
    </b-row>

    <b-modal ref="login" title="Login" @ok="sendLogin" @hidden="hideLogin">
      <b-form-input v-model="payload.username" placeholder="Username"></b-form-input>
      <b-form-input v-model="payload.password" placeholder="Password"></b-form-input>
      <small><strong class="text-danger">method:</strong> POST</small><br/>
      <small><strong class="text-danger">endpoint:</strong> {{endpoint}}</small><br/>
      <small><strong class="text-danger">payload:</strong> <pre>{{payload}}</pre></small><br/>
      <small><strong class="text-danger">response:</strong> <pre>{{response}}</pre></small>
    </b-modal>

    <b-modal ref="token" title="API Token" @ok="okToken" @hidden="hideLogin">
      <b-form-input v-model="token" placeholder="Token"></b-form-input>
    </b-modal>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: "HeaderNav",
  props: ['user', 'shopUrl'],
  data() {
    return {
      type: 'guest',
      shopUrlModel: 'https://magento.local/',
      token: '',
      loggedIn: false,
      payload: {username:'',password:''},
      endpoint: '',
      response: '',
      options: [
        { value: 'guest', text: 'Guest (anonymous)' },
        { value: 'customer', text: 'Customer' },
        { value: 'admin', text: 'Admin'},
        { value: 'integration', text: 'Integration'},
      ]
    }
  },
  methods: {
    login(u) {
      this.type= u
      if (u === 'guest') {
        this.$emit('userChange', {type: 'guest', token: '', username: ''})
      } else if (u === 'integration') {
        this.token = ''
        this.loggedIn = false
        this.$refs['token'].show()
      } else {
        this.endpoint = 'rest/default/V1/integration/' + u + '/token'
        this.response = ''
        this.loggedIn = false
        this.payload = {username:'',password:''}
        this.$refs['login'].show()
      }
    },
    sendLogin(e) {
      e.preventDefault()
      let _self = this
      axios({
        method: 'POST',
        url: this.shopUrl + this.endpoint,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        data: this.payload
      })
          .then(function (response) {
            _self.response = response.data;
            _self.$emit('userChange', {type:_self.type, 'token': response.data, 'username': _self.payload.username})
            _self.loggedIn = true
            _self.$refs['login'].hide()
          })
          .catch(function (error) {
            if (error.response && error.response.data) {
              _self.response = error.response.data;
            } else if (error.response) {
              _self.response = error.response
            } else {
              _self.response = error
            }
          });
    },
    hideLogin() {
      if (!this.loggedIn) this.type = this.user.type
    },
    okToken() {
      if (this.token!=='') {
        this.$emit('userChange', {type: this.type, 'token': this.token, 'username': ''})
        this.loggedIn = true
      }
    }
  }
}
</script>

<style scoped>

</style>