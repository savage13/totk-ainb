
export class AINB {
    constructor() {

    }
    static async from_file(filename: string) {
        const res = await fetch(filename)
        let data = await res.json()
        let v = Object.assign(new AINB(), data)
        v.nodes = v.Nodes = v.Nodes.map((x: any) => Node.from(x))
        v.blackboard = flatten_links(v.Blackboard || {})
        return v
    }
}

class Link {
    'Name': string | null;
    'Node Index': number;
    'Condition Min': number | null
    'Condition Max': number | null
    'Is Default': boolean | null
    constructor() { }
    static from(type: string, data: any) {
        let v = Object.assign(new Link(), data)
        v.type = type
        v.index = v['Node Index']
        v.name = v['Name']
        return v

    }

    get label() {
        if (this['Condition Min'] != undefined && this['Condition Max'] != undefined) {
            let a = this['Condition Min']
            let b = this['Condition Max']
            return `[${a} - ${b}]`
        }
        if (this['Is Default']) {
            return "Default"
        }
        return this.Name
    }
}

function flatten_links(values: any) {
    let out = []
    for (const type of Object.keys(values)) {
        for (const item of values[type]) {
            out.push(Link.from(type, item))
        }
    }
    return out
}

class Node {
    'Node Index': number;
    'Node Type': number;
    'Name': number;
    parameters: any;
    name: string | undefined;
    type: string;
    index: number;
    constructor() {
    }
    static from(data: any) {
        let v = Object.assign(new Node(), data)
        v.plugs = v.Plugs
        v.parameters = v.Parameters
        v.index = v['Node Index']
        v.name = v['Name']
        v.type = v['Node Type']
        v.plugs = flatten_links(v.Plugs)
        v.inputs = flatten_links(v.Parameters.Inputs)
        v.outputs = flatten_links(v.Parameters.Outputs)
        return v
    }
    get label() {
        if (this.name) {
            return `${this.name} ${this.index}`
        }
        return `${this.type} ${this.index}`
    }
}

