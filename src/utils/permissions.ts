import type { Role, User } from '../types'

export function canSee(roles: Role[], user: User | null, section: string): boolean {
  const role = roles.find(r => r.id === user?.role)
  return role?.perms.includes(section) || role?.perms.includes(section + '_view') || false
}

export function isAdmin(user: User | null): boolean {
  return user?.role === 'admin' || user?.role === 'program_manager'
}

export function uid(): number {
  return Date.now() + Math.random()
}
