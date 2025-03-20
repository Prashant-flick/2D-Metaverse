import axios2 from "axios"

export const axios = {
  post: async (...args) => {
      try {
          const res = await axios2.post(...args)
          return res
      } catch (error) {
          return error.response
      }
  },
  delete: async (...args) => {
      try {
          const res = await axios2.delete(...args)
          return res
      } catch (error) {
          return error.response
      }
  },
  put: async (...args) => {
      try {
          const res = await axios2.put(...args)
          return res
      } catch (error) {
          return error.response
      }
  },
  get: async (...args) => {
      try {
          const res = await axios2.get(...args)
          return res
      } catch (error) {
          return error.response
      }
  },
}