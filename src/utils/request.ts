import axios from 'axios'
import store from '@/store'

const request = axios.create({
  // 配置选项
})

// 请求拦截器
request.interceptors.request.use(function (config) {
  console.log('config', config)
  const { user } = store.state
  if (user && user.access_token) {
    config.headers.Authorization = user.access_token
  }
  return config
}, function (error) {
  return Promise.reject(error)
})

// 响应拦截器
request.interceptors.response.use(function (response) {
  console.log('response', response)
  return response
}, function (error) {
  return Promise.reject(error)
})

export default request
