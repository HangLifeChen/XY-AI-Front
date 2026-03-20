import type { MockMethod } from 'vite-plugin-mock'

export default [
  {
    url: '/api/auth/login',
    method: 'post',
    timeout: 500,
    response: ({ body }) => {
      const { username, password } = body
      if (username === 'admin' && password === '123456') {
        return {
          code: 200,
          message: '登录成功',
          data: {
            token: 'mock-token',
            user: {
              id: '1',
              username: 'admin',
              avatar: 'https://example.com/avatar.png',
            },
          },
        }
      } else {
        return {
          code: 401,
          message: '用户名或密码错误',
          data: null,
        }
      }
    },
  },
  {
    url: '/api/auth/register',
    method: 'post',
    timeout: 500,
    response: ({ body }) => {
      const { username, password } = body
      if (username && password) {
        return {
          code: 200,
          message: '注册成功',
          data: {
            token: 'mock-token',
            user: {
              id: '2',
              username,
              avatar: 'https://example.com/avatar.png',
            },
          },
        }
      } else {
        return {
          code: 400,
          message: '用户名或密码不能为空',
          data: null,
        }
      }
    },
  },
  {
    url: '/api/auth/logout',
    method: 'post',
    timeout: 200,
    response: () => {
      return {
        code: 200,
        message: '登出成功',
        data: null,
      }
    },
  },
] as MockMethod[]
