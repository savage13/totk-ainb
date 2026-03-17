
import Split from 'split.js'

import * as d3 from 'd3';
import * as dagreD3 from 'dagre-d3-es';

import { AINB, Node } from './ainb.js'

import { hsv2hex } from './color'

Split(['#side', '#graph'], { sizes: [20, 80], minSize: 200 })
Split(['#nodelist0', '#ainbfiles'], { sizes: [50, 50], minSize: 50, direction: 'vertical' })

const STYLE = {
    edge: {
        default: {
            color: 'white',
            width: "2px",
        },
        focus: {
            output: {
                color: "#f1f180", // yellow-ish
                width: "3px",
            },
            input: {
                color: "#80f1f1", // blue-ish
                width: "3px",
            }
        }
    },
    node: {
        default: {
            color: 'none',
            width: "0px",
        },
        focus: {
            color: "#f7e7ad",
            width: "2px",
        },
    }
}
let g: any = null
let zoom: any = null
const _n = 'n'
let ainb_files = []
let _filename = ""
const BB = 314159


function $(x: string) { return document.querySelector(x); }

const title = $('#title')
const node_search = $('#node_search')
const ainb_search = $('#ainb_search')
const style = $('#style') as HTMLElement
const styleshow = $('#styleshow')

if (title && node_search && ainb_search) {
    title.addEventListener('click', (_ev) => { title.remove() })
    node_search.addEventListener('input', node_search_term)
    ainb_search.addEventListener('input', ainb_search_term)
}
if (style && styleshow) {
    styleshow.addEventListener('mouseover', (_ev) => {
        style.style.visibility = "visible"
    })
    styleshow.addEventListener('mouseleave', (_ev) => {
        style.style.visibility = "hidden"
    })
    style.addEventListener('mouseleave', (_ev) => {
        style.style.visibility = "hidden"
    })
    style.addEventListener('mouseover', (_ev) => {
        style.style.visibility = "visible"
    })
}

function node_search_term() {
    let term = node_search.value.trim().toLowerCase()
    const els = [...nodelist.children]
    if (term.length == 0) {
        els.forEach(el => el.style.display = '')
        return
    }
    for (const el of els) {
        let t = (!el.textContent.toLowerCase().includes(term)) ? "none" : ""
        el.style.display = t
    }
}

function ainb_search_term() {
    let term = ainb_search.value.trim().toLowerCase()
    const els = [...ainblist.children]
    if (term.length == 0) {
        els.forEach(el => el.style.display = '')
        return
    }
    for (const el of els) {
        let t = (!el.textContent.toLowerCase().includes(term)) ? "none" : ""
        el.style.display = t
    }
}

async function load(filename: string) {
    return AINB.from_file(`ainb_as_json_v2.0/${filename}`)
}

function $txt(t: string, className: any = undefined) {
    const el = document.createElement('div')
    el.textContent = t
    if (className) {
        el.classList.add(className)
    }
    return el
}
function $span(t: string, className: any = undefined) {
    const el = document.createElement('span')
    el.textContent = t
    if (className) {
        el.classList.add(className)
    }
    return el
}
function $li(els: HTMLElement | HTMLElement[], className: any = undefined) {
    const el = document.createElement('li')
    if (className) {
        el.classList.add(className)
    }
    if (!Array.isArray(els)) { els = [els] }
    el.append(...els)
    return el
}


function addSection(node: Node, el: HTMLElement, header: string, key: string) {
    if (!node || !node[key]) {
        return
    }
    const im = node[key]
    if (Object.keys(im).length == 0) {
        return
    }
    el.append($txt(header, 'section'))
    for (const type of Object.keys(im)) {
        for (const item of im[type]) {
            let parts = [$span(`${item.Name} : `), $span(`${type}`, 'typename')]
            if (item['Default Value'] !== undefined) {
                parts.push($span(` = ${item['Default Value']} (default)`, 'typevalue'))
            }
            el.append($li(parts, 'item'))
        }
    }
}


function create_node(node: Node) {
    const el = document.createElement('div')
    el.classList.add('nodedata')
    if (node.name) {
        el.appendChild($txt(`${node.name} (${node.index})`, "header"))
    } else {
        el.appendChild($txt(`${node.type} (${node.index})`, "header"))
    }
    addSection(node, el, "Properties", "Properties")
    addSection(node.Parameters, el, "Inputs", "Inputs")
    addSection(node.Parameters, el, "Outputs", "Outputs")
    return el
}


function node_color(node: Node) {
    let s = 0.95
    let v = 0.55
    switch (node.type) {
        case 'Element_Expression': return hsv2hex(1 / 16, s, v);
        case 'Element_F32Selector': return hsv2hex(2 / 16, s, v);
        case 'Element_ModuleIF_Output_Bool': return hsv2hex(3 / 16, s, v);
        case 'Element_ModuleIF_Input_Bool': return hsv2hex(4 / 16, s, v);
        case 'Element_SplitTiming': return hsv2hex(5 / 16, s, v);
        case 'Element_S32Selector': return hsv2hex(6 / 16, s, v);
        case 'Element_Sequential': return hsv2hex(7 / 16, s, v);
        case 'Element_BoolSelector': return hsv2hex(8 / 16, s, v);
        case 'Element_Simultaneous': return hsv2hex(9 / 16, s, v);
        default:
            break
    }
    s = 0.95
    v = 0.45
    let ncolors = 8
    if (node.name.startsWith('Operate')) { return hsv2hex(0 / ncolors, s, v) }
    if (node.name.startsWith('Execute')) { return hsv2hex(1 / ncolors, s, v) }
    if (node.name.startsWith('Query')) { return hsv2hex(2 / ncolors, s, v) }
    if (node.name.startsWith('ActorLogic')) { return hsv2hex(3 / ncolors, s, v) }
    if (node.name.startsWith('OneShot')) { return hsv2hex(4 / ncolors, s, v) }
    if (node.name.startsWith('Hold')) { return hsv2hex(5 / ncolors, s, v) }
    if (node.name.startsWith('Selector')) { return hsv2hex(6 / ncolors, s, v) }
    if (node.name.startsWith('Trigger')) { return hsv2hex(7 / ncolors, s, v) }

    return '#63718e'
}

async function load_json(filename: string) {
    const res = await fetch(filename)
    return res.json()
}

async function main() {

    ainb_files = await load_json("index.json")
    for (const file of ainb_files) {
        ainblist.append(ainb_link(file))
    }
    ainb_search_term()

    const url = new URL(window.location)
    let filename = url.searchParams.get('file')
    let node = url.searchParams.get('node')
    if (!filename) {
        filename = ainb_files[0] + ".json"
    }
    await show_graph(filename)
    if (node) {
        scroll_to_node(node)
    }
}

function ainb_link(filename: string) {
    const el = document.createElement('li')
    el.textContent = filename
    el.classList.add('listitem')
    el.addEventListener('click', (ev) => {
        show_graph(filename + '.json')
        ev.stopPropagation()
        ev.preventDefault()
    })
    return el
}

function scroll_to_node(id: string) {
    let el = d3.selectAll('g.node').filter((v: string) => { return v == id })

    let x = el.node().transform.baseVal[0].matrix.e
    let y = el.node().transform.baseVal[0].matrix.f

    let svg = d3.select('svg')
    zoom.scaleTo(svg, 1)
    svg.transition().duration(1000).call(zoom.translateTo, x, y)
    set_url("", id)

}

function node_set_border(id: string, color: string, width: string) {
    let el = d3.selectAll('g.node').filter((v: string) => { return v == id })
    el.select('rect').style('stroke', color).style('stroke-width', width)
}
function edge_set_border(id: string, color: string, width: string) {
    let el = d3.selectAll('g.edgePath').filter((v: any) => { return v.name == id })
    el.select('path').style('stroke', color).style('stroke-width', width).style('fill', 'color')
    el.select('marker').select('path').style('fill', color)
}

function focus_node(id: string) {
    node_set_border(id, STYLE.node.focus.color, STYLE.node.focus.width)
    const edges = g.edges().filter((e: any) => e.v == id || e.w == id)
    for (const edge of edges) {
        const io = (edge.v == id) ? STYLE.edge.focus.output : STYLE.edge.focus.input
        edge_set_border(edge.name, io.color, io.width)
    }
}

function unfocus_node(id: string) {
    node_set_border(id, STYLE.node.default.color, STYLE.node.default.width)
    const edges = g.edges().filter((e: any) => e.v == id || e.w == id)
    for (const edge of edges) {
        edge_set_border(edge.name, STYLE.edge.default.color, STYLE.edge.default.width)
    }
}

function node_link(node: Node) {
    const el = document.createElement('li')
    const id = _n + node.index
    el.textContent = node.label
    el.classList.add('listitem')
    el.addEventListener('click', (_ev) => { scroll_to_node(id) })
    el.addEventListener('mouseover', (_ev) => { focus_node(id) })
    el.addEventListener('mouseleave', (_ev) => { unfocus_node(id) })
    return el
}

async function show_graph(filename: string,) {
    _filename = filename
    const ainb = await load(filename)

    raw.setAttribute('href', `ainb_as_json_v2.0/${filename}`)

    // Remove all nodes before rebuilding
    if (g) {
        g.nodes().forEach((id: string) => g.removeNode(id))
    }

    g = new dagreD3.graphlib.Graph({ multigraph: true }).setGraph({});

    g.graph().ranksep = ranksep.value
    g.graph().nodesep = nodesep.value
    g.graph().ranker = ranker.value//'tight-tree'
    g.graph().rankdir = rankdir.value//'tight-tree'
    g.graph().align = align.value

    // Default to assigning a new object as a label for each new edge.
    g.setDefaultEdgeLabel(function() {
        return {}
    })

    let edges = new Set()
    const setEdge = (source: number, target: number, options: any) => {
        const s = `n${source}`
        const t = `n${target}`
        const key = `${s}-${t}-${options.label}`
        if (edges.has(key)) {
            return
        }
        g.setEdge(s, t, options, key)
    }

    const style = 'stroke: white; fill: none; stroke-width: 2px;'
    const curve = d3.curveBasis
    const labelStyle = 'fill: white; stroke-width: 0px; font-family: sans-serif; font-size: 1.1em;'
    const arrowheadStyle = 'fill: white;'

    nodelist.replaceChildren()
    nodelist.append($txt(filename))

    for (const node of ainb.nodes) {
        let nodeStyle = `fill: ${node_color(node)};`
        nodelist.appendChild(node_link(node))
        g.setNode(_n + node.index, { label: create_node(node), style: nodeStyle, rx: 13, ry: 13 })
        // Inputs
        for (const link of node.inputs) {
            if (!link.Sources) {
                // Single Source
                if (link.index !== undefined && link.index >= 0) {
                    setEdge(link.index, node.index, {
                        label: link.label, style, curve, labelStyle, arrowheadStyle,
                    })
                } else if (link['Blackboard Index'] >= 0) {
                    setEdge(BB, node.index, {
                        label: link.label, style, curve, labelStyle, arrowheadStyle,
                    })
                }
            } else {
                // MultiSource
                for (const src of link.Sources) {
                    let idx = src['Node Index']
                    if (idx >= 0) {
                        setEdge(idx, node.index, {
                            label: link.label, style, curve, labelStyle, arrowheadStyle,
                        })
                    }
                }
            }
        }
        // Blackboard Links
        for (const kind of Object.keys(node.Properties)) {
            for (const item of node.Properties[kind]) {
                if (item['Blackboard Index'] >= 0) {
                    setEdge(BB, node.index, {
                        label: item.name, style, curve, labelStyle, arrowheadStyle,
                    })
                }
            }
        }
    }
    // Blackboard Node
    if (ainb.blackboard.length) {
        let nodeStyle = `fill: rgb(200,40,40);`
        const el = document.createElement('div')
        el.classList.add('nodedata')
        el.append($txt("Blackboard", "header"))
        addSection({ Outputs: ainb.Blackboard }, el, "Outputs", "Outputs")
        g.setNode(`n${BB}`, { label: el, style: nodeStyle, rx: 13, ry: 13 })

    }
    // Plugs
    for (const node of ainb.nodes) {
        for (const plug of node.plugs) {
            if (plug.index >= 0) {
                setEdge(plug.index, node.index, {
                    label: plug.label, style, curve, labelStyle, arrowheadStyle,
                })
            }
        }
    }

    var svg = d3.select('svg'),
        inner = svg.select('g')

    zoom = d3.zoom().on("zoom", (event: any) => {
        inner.attr("transform", event.transform)
    })
    svg.call(zoom)

    // // Create the renderer
    var render = new dagreD3.render()

    // Run the renderer. This is what draws the final graph.
    render(inner, g)

    // Allow clicking and selecting of text on nodes
    svg.selectAll('g.node').each(function(v: any) {
        this.addEventListener("mousedown", (ev: any) => {
            ev.stopPropagation() // preventDefault here prevent text selection
        })
        this.addEventListener("mouseover", (ev: any) => {
            ev.stopPropagation() // preventDefault here prevent text selection
            focus_node(v)
        })
        this.addEventListener("mouseleave", (ev: any) => {
            ev.stopPropagation() // preventDefault here prevent text selection
            unfocus_node(v)
        })
        this.addEventListener("click", (ev: any) => {
            ev.stopPropagation()
            ev.preventDefault()
            scroll_to_node(v)
        })
        this.addEventListener("dblclick", (ev: any) => {
            ev.stopPropagation()
            ev.preventDefault()
        })
    })

    // Zoom to fit
    const { width, height } = inner.node().getBBox()
    let rect = document.getElementsByTagName('svg')[0].getBoundingClientRect()
    if (width && height) {
        //const bbox = svg.node().getBBox()
        const scale = Math.min(rect.width / width, rect.height / height) * 0.95
        zoom.scaleTo(svg, scale)
        zoom.translateTo(svg, width / 2, height / 2)
    }
    node_search_term()
    set_url(filename)

}

function set_url(filename: string = "", node: string = "") {
    const url = new URL(window.location)
    if (node == "") {
        url.searchParams.delete('node')
    } else {
        url.searchParams.set('node', node)
    }
    if (filename != "") {
        url.searchParams.set('file', filename)
    }
    //console.log(filename, node, url)
    window.history.pushState({}, "", url.toString())
}

ranker.addEventListener('change', (ev) => {
    show_graph(_filename)
})
rankdir.addEventListener('change', (ev) => {
    show_graph(_filename)
})
align.addEventListener('change', (ev) => {
    show_graph(_filename)
})
ranksep.addEventListener('input', (ev) => {
    show_graph(_filename)
})
nodesep.addEventListener('input', (ev) => {
    show_graph(_filename)
})

main()


