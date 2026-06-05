import * as mock from './user.mock'
import * as api  from './user.api'

const useMock = !import.meta.env.VITE_API_BASE_URL
const impl = useMock ? mock : api

export const getInterestsCatalog = impl.getInterestsCatalog
export const updateInterests     = impl.updateInterests
export const updatePreferences   = impl.updatePreferences
