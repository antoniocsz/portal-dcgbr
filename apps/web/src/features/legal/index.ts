// Path: apps/web/src/features/legal/index.ts
// Barrel da feature legal: agregador de model + views.
export * from './model/types'
export {
  LEGAL_CONTACT_EMAIL,
  LEGAL_LAST_UPDATED,
  LEGAL_DISCLAIMER,
  LEGAL_DOCUMENTS,
  getLegalDocument
} from './model/content'
export * from './views'
