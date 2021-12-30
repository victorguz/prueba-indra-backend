// Use export const to declare global variables here
// try to don't use environment variables or secret keys here

export enum STATUS {
    DISABLED = 0,
    ENABLED = 1,
    BLOCKED = 2,
    DELETED = 3,
    BANNED = 4,
}


export enum ROLES {
    SUPPORT = 0, //Usuario de soporte: Quien tiene permiso sobre toda la configuración del framework, así como de acceso a los módulos.
    ADMIN = 1, //Usuario administrador: Quien tiene los permisos de los módulos que se hayan desarrollado.
    GENERAL = 2, //Usuario general: Quien tiene permiso de acceso a los módulos que el product owner decida.
}

export enum ROLES_NAMES {
    SUPPORT = "SUPPORT",
    ADMIN = "ADMIN",
    GENERAL = "GENERAL",
}
export enum COMPLETED {
    NO = 0,
    YES = 1,
}

export const MAX_RECORDS_TO_TAKE = 100