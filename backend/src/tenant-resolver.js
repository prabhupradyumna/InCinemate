export function createTenantResolver({ strategy, header }) {
  return function resolveTenant(req) {
    if (strategy === 'header') {
      return req.get(header)
    }
    if (strategy === 'param') {
      return req.params?.tenant
    }
    const host = req.hostname || ''
    const [sub] = host.split('.')
    return sub && sub !== 'www' ? sub : null
  }
}
