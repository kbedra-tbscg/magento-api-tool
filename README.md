# apipoc

## Project setup
```
yarn install
```

### Compiles and hot-reloads for development
```
yarn serve
```

### Compiles and minifies for production
```
yarn build
```

### Lints and fixes files
```
yarn lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

###CORS issue
By default, Magento API doesn't support Cross-Origin Resource Sharing in modern browsers. In that case, a module can be installed for Magento shop: https://github.com/splashlab/magento-2-cors-requests, or the request need to be passed through reverse-proxy. An example of the apache2 configuration for the proxy is in the file proxy.local.conf