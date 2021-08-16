<template>
  <div class="login">
    <el-form
      label-position="top"
      :model="form"
      :rules="rules"
      ref="form"
      class="login-form"
    >
      <el-form-item label="手机号" prop="phone">
        <el-input v-model="form.phone"></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input v-model="form.password" type="password"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          class="login-btn"
          :loading="isLoginLoading"
          @click="submitForm()"
          >登录</el-button
        >
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { login } from '@/services/user'
import { Form } from 'element-ui'

export default Vue.extend({
  name: 'LoginIndex',
  data () {
    return {
      form: {
        phone: '18201288771',
        password: '111111'
      },
      rules: {
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { pattern: /^1\d{10}$/, message: '请输入正确的手机号', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 18, message: '长度为 6 到 18 位字符', trigger: 'blur' }
        ]
      },
      isLoginLoading: false
    }
  },
  methods: {
    async submitForm () {
      try {
        // 表单验证
        await (this.$refs.form as Form).validate()

        // 表单提交
        this.isLoginLoading = true
        const { data } = await login(this.form)

        // 处理结果
        if (data.state !== 1) {
          // 登录失败
          this.$message.error(data.message)
        } else {
          // 登录成功
          this.$message.success('登录成功')
          // 记录登录状态，保存在 Vuex 中
          this.$store.commit('setUser', data.content)
          // 跳转到查询参数中重定向页面 或者 首页
          this.$router.push(this.$route.query.redirect as string || '/')
        }
      } catch (error) {
        console.log('登录失败', error)
      }
      this.isLoginLoading = false
    }
  }
})
</script>

<style lang="scss" scoped>
.login {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  .login-form {
    width: 400px;
    background: #fff;
    border-radius: 5px;
    padding: 20px;
  }
  .login-btn {
    width: 100%;
  }
}
</style>
