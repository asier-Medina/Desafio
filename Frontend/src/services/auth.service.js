import * as mock from './auth.mock'
import * as api from './auth.api'

const useMock = !import.meta.env.VITE_API_BASE_URL
const impl = useMock ? mock : api

export const login = impl.login
export const register = impl.register
export const logout = impl.logout
export const refresh = impl.refresh
