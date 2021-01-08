<template>
  <div role="group" class="form-row form-group">
    <label class="col-sm-2 col-form-label">{{fieldName}}</label>
    <div class="col">
      <div class="panel panel-primary" :class="required?'required':''">
        <div class="panel-body">
          <p class="text-on-pannel" :class="required?'required':''"><strong>object definition: </strong>{{definition}}{{required?' (required)':''}} </p>
          <h6>{{definitions[definition].description}}</h6>
          <strong v-if="level > 10" class="text-danger">Warning! Possible recursion in {{definition}}</strong>
          <div v-else>
            <div v-for="(prop,propk) in definitions[definition].properties"
                 :key="'param_' + propk + '_' + level">
              <b-row v-if="typeof prop.items !== 'undefined' && typeof prop.items.$ref !== 'undefined' && prop.items.$ref.substr(14) === definition" class="text-danger">
                <b-col sm="2">
                  {{propk}}
                </b-col>
                <b-col sm="10">
                  <strong >Warning! Recursion in {{definition}}</strong>
                </b-col>
              </b-row>
              <object-param
                  v-else-if="typeof prop.$ref !== 'undefined'"
                  :definitions="definitions"
                  :definition="prop.$ref.substr(14)"
                  :field-name="propk"
                  :value.sync="dynModel[propk]"
                  :level="level + 1"
                  :path="path + '_' + propk"
                  :required="typeof definitions[definition].required !== 'undefined' && definitions[definition].required.indexOf(propk) >= 0"
                  @change="calculatePayload(propk)"/>
              <array-param
                  v-else-if="prop.type==='array'"
                  :definitions="definitions"
                  :items="prop.items"
                  :field-name="propk"
                  :value.sync="dynModel[propk]"
                  :level="level + 1"
                  :path="path + '_' + propk"
                  :required="typeof definitions[definition].required !== 'undefined' && definitions[definition].required.indexOf(propk) >= 0"
                  @change="calculatePayload(propk)"/>
              <basic-param
                  v-else
                  :param="prop"
                  :field-name="propk"
                  :value.sync="dynModel[propk]"
                  :level="level + 1"
                  :path="path + '_' + propk"
                  :required="typeof definitions[definition].required !== 'undefined' && definitions[definition].required.indexOf(propk) >= 0"
                  @change="calculatePayload(propk)"
              />
            </div>
          </div>
        </div>
      </div>
      <small v-if="description" tabindex="-1" class="form-text text-muted">{{ description }}</small>
    </div>
  </div>
</template>

<script>
export default {

  props: ['definitions', 'definition','fieldName', 'value', 'required', 'level', 'path', 'description'],

  data() {
    return {
      dynModel: {},
      request: {}
    }
  },
  watch: {
    value(v) {
      this.dynModel = v
    }
  },
  methods: {
    calculatePayload(propName) {
      for (const propk of Object.keys(this.definitions[this.definition].properties)) {
        if (typeof this.dynModel[propk] !== 'undefined' && this.dynModel[propk] !== '') this.request[propk] = this.dynModel[propk]
        //force empty
        if (propName===propk && this.dynModel[propk] === '') delete this.request[propk]
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