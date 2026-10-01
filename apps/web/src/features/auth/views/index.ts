// Path: apps/web/src/features/auth/views/index.ts
// Barrel das Views de auth (MVVM: só JSX, estado vem dos ViewModels).
export { LoginView } from './login-view'
export { RegisterView } from './register-view'
export { ForgotPasswordView } from './forgot-password-view'
export { ResetPasswordView } from './reset-password-view'

export { AuthField, AuthFormError } from './auth-field'
export type { AuthFieldProps } from './auth-field'
export { AuthBenefits } from './auth-benefits'
export { AuthDivider, AuthHeader, AuthShell } from './auth-shell'
