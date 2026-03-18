
export class AINB {
    nodes: Node[];
    constructor() {
        this.nodes = []
    }
    static async from_file(filename: string) {
        const res = await fetch(filename)
        let data = await res.json()
        let v = Object.assign(new AINB(), data)
        v.nodes = v.Nodes = v.Nodes.map((x: any) => Node.from(x))
        v.blackboard = flatten_links(v.Blackboard || {})
        v.io = {}
        for (const node of v.nodes) {
            for (const input of node.inputs) {
                if (!input.Sources) {
                    let key = input['Node Index']
                    if (!(key in v.io)) {
                        v.io[key] = []
                    }
                    v.io[key].push(Object.assign({}, input, { index: node.index }))
                } else {
                    for (const src of input.Sources) {
                        let key = src['Node Index']
                        if (!(key in v.io)) {
                            v.io[key] = []
                        }
                        v.io[key].push(Object.assign({}, src, { index: node.index }))
                    }
                }
            }
        }
        return v
    }
}

class Link {
    'Name': string | null;
    'Node Index': number;
    'Condition Min': number | null
    'Condition Max': number | null
    'Is Default': boolean | null
    'Is Output': boolean | null
    type: string;
    vartype: string;
    index: number;
    name: string | null;
    constructor() {
        this.type = ""
        this.index = -1
        this.name = null
        this.vartype = ""
    }
    static from(type: string, vartype: string, data: any) {
        let v = Object.assign(new Link(), data)
        v.type = type
        v.index = v['Node Index']
        v.name = v['Name']
        v.vartype = vartype
        return v
    }

    get is_output() {
        return this.vartype == "Outputs" && this['Is Output']
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

function flatten_links(values: any, kind: string) {
    let out = []
    for (const type of Object.keys(values)) {
        for (const item of values[type]) {
            out.push(Link.from(type, kind, item))
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
        this.index = -1
        this.type = ""
    }
    static from(data: any) {
        let v = Object.assign(new Node(), data)
        v.plugs = v.Plugs
        v.parameters = v.Parameters
        v.index = v['Node Index']
        v.name = v['Name']
        v.type = v['Node Type']
        v.properties = flatten_links(v.Properties, "Properties")
        v.plugs = flatten_links(v.Plugs, "Plugs")
        v.inputs = flatten_links(v.Parameters.Inputs, "Inputs")
        v.outputs = flatten_links(v.Parameters.Outputs, "Outputs")
        return v
    }
    get label() {
        if (this.name) {
            return `${this.name} ${this.index}`
        }
        return `${this.type} ${this.index}`
    }
}

