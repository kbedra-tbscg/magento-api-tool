<template>
  <div id="app">
    <header-nav :shopUrl.sync="shopUrl" :user="user" @userChange="setUser"></header-nav>
    <div class="p-4 bg-light">
      <b-row>
        <b-col>
          <b-form-group
              id="apiPath"
              label-cols-sm="3"
              :label="'API path (' + (schemaLoading?' loading... ':((schema.paths &&  Object.keys(schema.paths).length) || '<span>0')) +')'"
              label-for="input-horizontal"
              placeholder="API path"
          >
            <b-form-select id="apiPath" v-model="endpoint" :disabled="schemaLoading" :options="(schema.paths && Object.keys(schema.paths)) || {}"></b-form-select>
          </b-form-group>
        </b-col>
        <b-col sm="auto">
          <b-btn variant="primary" @click="getSchema" :disabled="schemaLoading">Get schema</b-btn>
        </b-col>
      </b-row>

      <pre v-if="schemaError">
        {{schemaError}}
      </pre>
      <div v-if="endpoint">
        <div class="accordion" role="tablist" >
          <b-card no-body class="mb-1" v-for="(o,k,i) in schema.paths[endpoint]" :key="'method' + k">
            <b-card-header header-tag="header" class="p-1" role="tab">
              <b-button block v-b-toggle="k" variant="primary" class="text-left">Method: <span class="text-uppercase">{{k}}</span></b-button>
            </b-card-header>
            <b-collapse :id="k" :visible="i===0" accordion="properties-accordion" role="tabpanel">
              <b-card-body :ref="'panel' + k">
                <b-card-text><h4>{{o.description}}</h4></b-card-text>
                <div v-for="(param,pi) in o.parameters"
                     :key="'param' + pi">
                  <div v-if="param.in === 'body'">
                    <div v-for="(prop,propk) in param.schema.properties"
                         :key="'param_' + propk + '_0'">
                        <object-param
                            v-if="typeof prop.$ref !== 'undefined'"
                            :definitions="schema.definitions"
                            :definition="prop.$ref.substr(14)"
                            :field-name="propk"
                            :value.sync="dynModel[param.in][propk]"
                            :level="1"
                            :path="k + '_' + propk"
                            :required="typeof param.schema.required !=='undefined' && param.schema.required.indexOf(propk)>=0"
                            @change="calculatePayload(propk)"/>
                        <array-param
                            v-else-if="prop.type==='array'"
                            :definitions="schema.definitions"
                            :items="prop.items"
                            :field-name="propk"
                            :value.sync="dynModel[param.in][propk]"
                            :level="1"
                            :path="k + '_' + propk"
                            :required="typeof param.schema.required !=='undefined' && param.schema.required.indexOf(propk)>=0"
                            @change="calculatePayload(propk)"/>
                        <basic-param
                            v-else
                            :param="prop"
                            :field-name="propk"
                            :value.sync="dynModel[param.in][propk]"
                            :level="1"
                            :path="k + '_' + propk"
                            :required="typeof param.schema.required !=='undefined' && param.schema.required.indexOf(propk)>=0"
                            @change="calculatePayload(propk)"
                        />
                    </div>
                  </div>
                    <array-param
                        v-else-if="param.type==='array'"
                        :definitions="schema.definitions"
                        :items="param.items"
                        :field-name="param.name"
                        :value.sync="dynModel[param.in][param.name]"
                        :required="typeof param.required !=='undefined' && param.required"
                        :level="1"
                        :path="k + '_' + param.name"
                        @change="calculatePayload(param.name)"/>
                    <basic-param
                        v-else
                        :param="param"
                        :field-name="param.name"
                        :value.sync="dynModel[param.in][param.name]"
                        :level="1"
                        :path="k + '_' + param.name"
                        :required="typeof param.required !== 'undefined' && param.required"
                        @change="calculatePayload(param.name)"
                    />
                </div>
                <hr>
                <h4>Request:</h4>
                <strong class="text-danger">url:</strong> {{shopUrl + 'rest/default' + endpointReplaced + (queryCalculated.length>0?'?':'') + decodeURI(queryCalculated)}}<br/>
                <strong class="text-danger">method:</strong> <span class="text-uppercase">{{method}}</span><br/>
                <strong class="text-danger">body:</strong> <json-view :data="request.body" /><br/>
                <b-form-textarea
                    id="textarea"
                    class="mb-2"
                    v-model="bodyString"
                    placeholder="Request body"
                    rows="3"
                    max-rows="6"
                ></b-form-textarea>
                <b-button variant="primary" @click="sendRequest(k)">SEND</b-button><br/>
                <div v-if="sending || response !== null">
                  <hr>
                  <h4>Response:</h4>
                  <div v-if="sending" class="spinner-border" role="status">
                    <span class="sr-only">Loading...</span>
                  </div>
                  <div v-else>
                    <strong class="text-danger">response:</strong> <json-view :data="response" />
                  </div>
                </div>
              </b-card-body >
            </b-collapse>
          </b-card>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import HeaderNav from './components/HeaderNav'
import { JSONView } from "vue-json-component";
import axios from "axios";

export default {
  name: 'App',
  components: {
    HeaderNav,
    "json-view": JSONView
  },
  computed: {
    queryCalculated() {
      return new URLSearchParams(this.request.query).toString()
    },
    bodyString: {
      get(){
        return JSON.stringify(this.request.body)
      },
      set(val){
        this.request.body = JSON.parse(val)
        this.$set(this.dynModel, 'body', JSON.parse(val))
      }
    }
  },
  watch: {
    endpoint: function (n, o) {
      if (n !== o) {
        this.response = null
        this.endpointReplaced = n
        if (typeof this.schema.paths[n][this.method] !== 'undefined') this.calculatePayload()
      }
    },
  },
  data() {
    return {
      response: null,
      sending: false,
      tabListKey: {},
      method: '',
      user: {
        type: 'guest',
        token: null,
        username: ''
      },
      dynModel: {query: {}, path: {}, body: {}},
      request: {query: {}, path: {}, body: {}},
      shopUrl: 'https://magento.local/',
      schema: {},
      schemaLoading: true,
      schemaError: null,
      endpoint: null,
      endpointReplaced: ''
    }
  },
  mounted() {
    this.getSchema()
    this.$root.$on('bv::collapse::state', (collapseId, isJustShown) => {
      if (isJustShown) this.method = collapseId
      this.calculatePayload()
      this.response = null
    })
  },
  methods: {
    setUser(u) {
      this.user = u
      this.getSchema()
    },
    sendRequest(method) {
      this.sending = true
      let _self = this
      axios({
        method: method,
        url: this.shopUrl + 'rest/default' + this.endpointReplaced,
        headers: {
          'Authorization': `Bearer ${this.user.token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        params: this.request.query,
        data: this.request.body
      }).then(function (response) {
        _self.response = response.data;
        _self.sending = false
      }).catch(function (error) {
        _self.sending = false
        if (error.response && error.response.data) {
          _self.response = error.response.data;
        } else if (error.response) {
          _self.response = error.response
        } else {
          _self.response = error
        }
      });
    },
    getSchema() {
      this.schemaLoading = true
      this.schemaError = null
      const _self = this
      axios({
        method: 'POST',
        url: this.shopUrl + 'rest/default/schema',
        headers: {
          'Authorization': `Bearer ${this.user.token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })
          .then(function (response) {
            _self.schema = response.data;
            _self.schemaLoading = false
          })
          .catch(function (error) {
            _self.schemaError = error
            _self.schemaLoading = false
          });
    },
    calculatePayload(propName) {
      if ((this.schema.paths && this.endpoint && this.schema.paths[this.endpoint]) || false) {
        this.request = {query: {}, path: {}, body: {}}
        if (typeof this.schema.paths[this.endpoint][this.method] !== 'undefined' && typeof this.schema.paths[this.endpoint][this.method].parameters !== 'undefined') {
          for (const prop of this.schema.paths[this.endpoint][this.method].parameters) {
            if (this.dynModel[prop.in][prop.name] && this.dynModel[prop.in][prop.name] !== '') this.request[prop.in][prop.name] = this.dynModel[prop.in][prop.name]
            //force empty
            if (propName===prop.name && this.dynModel[prop.in][prop.name] === '') delete this.request[prop.in][prop.name]

            if (typeof prop.schema !== 'undefined') {
              for (const propk of Object.keys(prop.schema.properties)) {
                if (typeof this.dynModel[prop.in][propk] !== 'undefined' && this.dynModel[prop.in][propk] !== '') this.request[prop.in][propk] = this.dynModel[prop.in][propk]
                //force empty
                if (propName===propk && this.dynModel[prop.in][propk] === '') delete this.request[prop.in][propk]
              }
            }
          }
        }
      }
      this.endpointReplaced = this.endpoint
      for (const rep in this.request.path) {
        this.endpointReplaced = this.endpointReplaced.replace('{' + rep + '}',this.request.path[rep])
      }
    }
  }
}
</script>

<style>
body {
  background-color: #f8f9fa!important;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>
