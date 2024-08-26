import Role from '../../modules/authorization/constants/role.enum';

export {};

declare global {
  namespace Express {
    interface User {
      id: number;
      role: Role;
    }
  }
}
