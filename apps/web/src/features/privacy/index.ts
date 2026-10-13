// Path: apps/web/src/features/privacy/index.ts
// Barrel da feature privacy: agrega Model + ViewModels + Views do canal de
// solicitações do titular (LGPD). A página importa a View direto de `views`.
export * from './model/types'
export { privacyApi } from './model/privacy-api'
export { useDataRequest, initialDataRequestValues } from './viewmodels'
export type { DataRequestFormValues } from './viewmodels'
export { DataRequestFormView } from './views'
