import { UserRole } from '@/hooks/useAuth';

/**
 * Check if a user has permission to create content
 * Contributors and admins can create content
 */
export const canCreateContent = (role: UserRole | null): boolean => {
  return role === 'contributor' || role === 'admin';
};

/**
 * Check if a user has permission to edit content they own
 * Contributors and admins can edit their own content
 * Admins can edit any content
 */
export const canEditContent = (role: UserRole | null, isOwner: boolean): boolean => {
  if (role === 'admin') return true;
  return isOwner && (role === 'contributor');
};

/**
 * Check if a user has permission to delete content they own
 * Contributors can delete their own content
 * Admins can delete any content
 */
export const canDeleteContent = (role: UserRole | null, isOwner: boolean): boolean => {
  if (role === 'admin') return true;
  return isOwner && (role === 'contributor');
};

/**
 * Check if a user has admin privileges
 */
export const isAdmin = (role: UserRole | null): boolean => {
  return role === 'admin';
};

/**
 * Check if a user can read content
 * Readers, contributors and admins can read content
 */
export const canReadContent = (role: UserRole | null): boolean => {
  return role === 'reader' || role === 'contributor' || role === 'admin';
};

/**
 * Get the minimum role required for an action
 */
export const getMinimumRoleForAction = (action: 'read' | 'create' | 'edit' | 'delete' | 'admin'): UserRole[] => {
  switch (action) {
    case 'read':
      return ['reader', 'contributor', 'admin'];
    case 'create':
    case 'edit':
    case 'delete':
      return ['contributor', 'admin'];
    case 'admin':
      return ['admin'];
    default:
      return [];
  }
};