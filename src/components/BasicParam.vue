<template>
  <div>
    <b-form-group
        label-cols-sm="2"
        :label="fieldName"
        :label-for="'param_' + path"
        :description="((typeof param.description !== 'undefined')?param.description:'') + ((typeof required !== 'undefined' && required)?' (required)':'')"
    >
      <b-form-checkbox
          v-if="param.type === 'boolean'"
          :id="'param_' + path"
          v-model="model"
          @change="changed"
          :name="'param_' + path"
      />
      <b-form-input
          v-else
          :type="inputType(param.type)"
          :id="'param_' +  path"
          v-model="model"
          @keyup="changed"
          :state="!required || model.length > 0"/>
    </b-form-group>
  </div>
</template>

<script>
export default {
  name: "BasicParam",
  props: ['param','fieldName','value','required','level', 'path'],
  data() {
    return {
      model: ''
    }
  },
  watch: {
    value(v) {
      this.model = v
    }
  },
  methods: {
    inputType(t) {
      switch (t) {
        case 'number':
        case 'integer':
          return 'number'
        case 'text':
        case 'string':
          return 'text'
        default:
          return 'text'
      }
    },
    changed() {
      this.$emit('update:value', this.model)
      this.$emit('change')
    }
  }
}
</script>

<style scoped>

</style>