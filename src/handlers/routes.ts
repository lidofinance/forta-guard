export type Routes = {
  health: string
  home: string
  secret: string
  metrics: string
}

export const Routes: Routes = {
  health: '/health',
  home: '/',
  secret: '/secret/:urlKey',
  metrics: '/metrics/',
}
