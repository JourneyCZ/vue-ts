import axios from 'axios'
import store from '@/store'
import { Message } from 'element-ui'
import router from '@/router'
import qs from 'qs'

const request = axios.create({
  // 配置选项
})

function redirectLogin () {
  router.push({
    name: 'login',
    query: {
      redirect: router.currentRoute.fullPath
    }
  })
}

// 请求拦截器
request.interceptors.request.use(function (config) {
  const { user } = store.state
  if (user && user.access_token) {
    config.headers.Authorization = user.access_token
  }
  return config
}, function (error) {
  return Promise.reject(error)
})

// 响应拦截器
request.interceptors.response.use(function (response) { // 状态码为 2xx 执行这里
  return response
}, async function (error) { // 状态码超出 2xx 执行这里
  if (error.response) { // 请求收到响应，但是状态码超出 2xx
    const { status } = error.response
    if (status === 400) {
      Message.error('请求参数错误')
    } else if (status === 401) { // 请求 token 无效
      // 用户未登录则跳转到登录页
      if (!store.state.user) {
        redirectLogin()
        return Promise.reject(error)
      }

      // 尝试获取新的 token
      try {
        const { data } = await axios.create()({
          method: 'POST',
          url: '/front/user/refresh_token',
          data: qs.stringify({
            refreshtoken: store.state.user.refresh_token
          })
        })
        // 获取成功，更新 token
        store.commit('setUser', data.content)
        // 重发本次失败的请求
        return request(error.config)
      } catch (error) {
        // 获取失败，跳转到登录页
        redirectLogin()
        return Promise.reject(error)
      }
    } else if (status === 403) {
      Message.error('没有权限，请联系管理员')
    } else if (status === 404) {
      Message.error('请求资源不存在')
    } else if (status >= 500) {
      Message.error('服务端错误，请联系管理员')
    }
  } else if (error.request) { // 请求已发出，但是没有收到响应
    Message.error('请求超时，请刷新重试')
  } else { // 设置请求时，触发了一个错误
    Message.error(`请求失败：${error.message}`)
  }

  // 继续抛出错误对象，扔给上一个调用者
  return Promise.reject(error)
})

export default request
