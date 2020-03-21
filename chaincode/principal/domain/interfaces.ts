export interface IPrincipal {
    id?: string
    name: string
    roles: string[]
}

export interface IResource {
    id?: string
    name: string
    tags: string[]
}

export interface IEmployee extends IPrincipal {
    badgeNumber: number
    title: string
    department: string
}
// {"name": "Joe Boudreau", "roles": ["Employee"], "badgeNumber": 123456789, "title": "Boss",
// "department": "Engineering"}

export interface IVisitor extends IEmployee {
    expiry: Date
}

export interface IArea extends IResource {
    ingress: string[] // entry points
    egress: string[] // exit points
}