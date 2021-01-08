<template>
  <div role="group" class="form-row form-group">
    <label class="col-sm-2 col-form-label">{{fieldName}}</label>
    <div class="col">
      <div class="panel panel-primary" :class="required?'required':''">
        <div class="panel-body">
          <div v-if="typeof items.$ref !== 'undefined'">
            <p class="text-on-pannel" :class="required?'required':''"><strong>array definition: </strong>{{items.$ref.substr(14)}}{{required?' (required)':''}} </p>
            <div v-for="(n,index) in elements" :key="n">
              <h6 class="text-center"><strong>item index:</strong> {{index}}</h6>
              <div v-for="(prop,propk) in definitions[items.$ref.substr(14)].properties"
                   :key="'param_' + propk + '_' + level">
                <b-row v-if="typeof prop.$ref !== 'undefined' && prop.$ref.substr(14) === items.$ref.substr(14)" class="text-danger">
                  <b-col sm="2">
                    {{propk}}
                  </b-col>
                  <b-col sm="10">
                    <strong >Warning! Recursion in {{items.$ref.substr(14)}}</strong>
                  </b-col>
                </b-row>
                <object-param
                    v-else-if="typeof prop.$ref !== 'undefined'"
                    :definitions="definitions"
                    :definition="prop.$ref.substr(14)"
                    :field-name="propk"
                    :value.sync="dynModel[index][propk]"
                    :level="level + 1"
                    :path="path + '_' + propk"
                    :required="typeof definitions[items.$ref.substr(14)].required !== 'undefined' && definitions[items.$ref.substr(14)].required.indexOf(propk) >= 0"
                    @change="calculatePayload(propk)"/>
                <array-param
                    v-else-if="prop.type==='array'"
                    :definitions="definitions"
                    :items="prop.items"
                    :field-name="propk"
                    :value.sync="dynModel[index][propk]"
                    :level="level + 1"
                    :path="path + '_' + propk"
                    :required="typeof definitions[items.$ref.substr(14)].required !== 'undefined' && definitions[items.$ref.substr(14)].required.indexOf(propk) >= 0"
                    @change="calculatePayload(propk)"/>
                <basic-param
                    v-else
                    :param="prop"
                    :field-name="propk"
                    :value.sync="dynModel[index][propk]"
                    :level="level + 1"
                    :path="path + '_' + propk"
                    :required="typeof definitions[items.$ref.substr(14)].required !== 'undefined' && definitions[items.$ref.substr(14)].required.indexOf(propk) >= 0"
                    @change="calculatePayload(propk)"
                />
              </div>
              <div class="text-center"><b-btn variant="danger" @click="removeItem(index)">remove this item</b-btn></div>
              <hr>
            </div>
          </div>
          <div v-else>
            <p class="text-on-pannel" :class="required?'required':''"><strong>array of</strong> {{fieldName}}{{required?' (required)':''}} </p>
            <div v-for="(n,index) in elements" :key="level + fieldName + n">
              <h6 class="text-center"><strong>item index:</strong> {{index}}</h6>
                <basic-param
                    :param="items"
                    :field-name="fieldName"
                    :value.sync="dynModel[index]"
                    :level="level + 1"
                    :path="path + '_' + fieldName"
                    @change="calculatePayload(fieldName)"
                />
              <div class="text-center"><b-btn variant="danger" @click="removeItem(index)">remove this item</b-btn></div>
              <hr>
            </div>
          </div>
          <div class="text-center"><b-btn variant="primary" @click="addItem">add item {{fieldName}}</b-btn></div>
        </div>
      </div>
      <small v-if="description" tabindex="-1" class="form-text text-muted">{{ description }}</small>
    </div>
  </div>

</template>

<script>


export default {
  name: "ArrayParam",
  props: ['definitions', 'items','fieldName', 'value', 'required', 'level', 'path', 'description'],

  data() {
    return {
      dynModel: [],
      request: [],
      elements: 1
    }
  },
  watch: {
    value(v) {
      this.dynModel = v
    }
  },
  beforeMount() {
    if (typeof this.items.$ref !== 'undefined') {
      this.request.push({})
      this.dynModel.push({})
    }
  },
  methods: {
    addItem() {
      this.elements++;
      if (typeof this.items.$ref !== 'undefined') {
        this.request.push({})
        this.dynModel.push({})
      }
    },
    removeItem(index) {
      this.elements--
      this.request.splice(index,1)
      this.dynModel.splice(index,1)
    },
    calculatePayload(propName) {
      if (typeof this.items.$ref !== 'undefined') {
        for(var i=0; i < this.elements; i++) {
          for (const propk of Object.keys(this.definitions[this.items.$ref.substr(14)].properties)) {
            if (typeof this.dynModel[i][propk] !== 'undefined' && this.dynModel[i][propk] !== '') this.request[i][propk] = this.dynModel[i][propk]
            //force empty
            if (propName === propk && this.dynModel[i][propk] === '') delete this.request[i][propk]
          }
        }
      } else {
        this.request = []
        for(var x=0; x < this.elements; x++) {
          if (typeof this.dynModel[x] !== 'undefined' && this.dynModel[x] !== '') this.request.push(this.dynModel[x])
        }
      }
      this.$emit('update:value', this.request)
      this.$emit('change')
    }
  }
}
</script>

<style scoped>
.text-on-pannel {
  background: #fff none repeat scroll 0 0;
  height: auto;
  margin-left: 20px;
  padding: 3px 5px;
  position: absolute;
  margin-top: -47px;
  border: 1px solid #28a745;
  border-radius: 6px;
}

.panel {
  margin-top: 27px !important;
  border: 1px solid #28a745;
  border-radius: 6px;
}

.required {
  border: 1px solid #dc3545;
}

.panel-body {
  padding-top: 30px !important;
  padding: 10px;
}
</style>