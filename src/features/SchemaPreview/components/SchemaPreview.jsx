import { Spin, Typography } from 'antd'
import dagre from 'dagre'
import ReactFlow, {
  Background,
  Controls,
  MarkerType,
  MiniMap,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { useSchemaQuery } from '../services/apiSlice.js'
import { nodeTypes } from './nodeTypes.js'
import './SchemaPreview.scss'

const NODE_WIDTH = 280
const ASSOCIATION_COLORS = {
  BelongsTo: '#1677ff',
  HasOne: '#52c41a',
  HasMany: '#fa8c16',
  BelongsToMany: '#722ed1',
}

function extractGraph(schema) {
  const payload =
    schema?.data && !Array.isArray(schema.data) ? schema.data : schema
  const nodes = payload?.nodes ?? payload?.data?.nodes ?? []
  const edges = payload?.edges ?? payload?.data?.edges ?? []
  return {
    nodes: Array.isArray(nodes) ? nodes : [],
    edges: Array.isArray(edges) ? edges : [],
  }
}

function estimateNodeHeight(node) {
  const data = node.data ?? node
  const columns = data.columns?.length ?? 0
  const associations = data.associations?.length ?? 0
  return 56 + columns * 28 + associations * 24 + 48
}

function associationKind(edge) {
  return (
    edge.label ??
    edge.data?.type ??
    edge.data?.association ??
    edge.type ??
    ''
  )
}

function layoutWithDagre(nodes, edges) {
  const graph = new dagre.graphlib.Graph()
  graph.setDefaultEdgeLabel(() => ({}))
  graph.setGraph({
    rankdir: 'LR',
    nodesep: 90,
    ranksep: 180,
    edgesep: 28,
    marginx: 40,
    marginy: 40,
  })

  nodes.forEach((node) => {
    graph.setNode(node.id, {
      width: NODE_WIDTH,
      height: estimateNodeHeight(node),
    })
  })

  edges.forEach((edge) => {
    if (
      edge.source !== edge.target &&
      graph.hasNode(edge.source) &&
      graph.hasNode(edge.target)
    ) {
      graph.setEdge(edge.source, edge.target)
    }
  })

  dagre.layout(graph)

  return nodes.map((node) => {
    const laidOut = graph.node(node.id)
    const height = estimateNodeHeight(node)
    return {
      ...node,
      position: {
        x: laidOut.x - NODE_WIDTH / 2,
        y: laidOut.y - height / 2,
      },
    }
  })
}

function normalizeNodes(nodes) {
  return nodes.map((node, index) => {
    const type =
      node.type === 'table' || node.type === 'tableNode' || !node.type
        ? 'tableNode'
        : node.type

    return {
      ...node,
      id: String(node.id ?? node.data?.tableName ?? index),
      type,
      sourcePosition: 'right',
      targetPosition: 'left',
      data: node.data ?? node,
    }
  })
}

function normalizeEdges(edges) {
  const seen = new Set()

  return edges.map((edge) => {
    const kind = String(associationKind(edge))
    const baseId = String(
      edge.id ?? `${edge.source}-${edge.target}-${kind || 'edge'}`
    )
    let id = baseId
    let suffix = 1
    while (seen.has(id)) {
      id = `${baseId}-${suffix}`
      suffix += 1
    }
    seen.add(id)

    const color = ASSOCIATION_COLORS[kind] ?? '#8c8c8c'
    const isMany = kind.includes('Many')
    const isSelf = edge.source === edge.target

    return {
      ...edge,
      id,
      type: isSelf ? 'default' : 'smoothstep',
      label: kind || edge.label,
      labelStyle: { fontSize: 10, fill: color, fontWeight: 600 },
      labelBgPadding: [4, 2],
      labelBgBorderRadius: 4,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color,
        width: 16,
        height: 16,
      },
      style: {
        stroke: color,
        strokeWidth: isMany ? 2 : 1.5,
        strokeDasharray: kind === 'BelongsToMany' ? '6 4' : undefined,
      },
      sourceHandle: isSelf ? 'source-bottom' : 'source-right',
      targetHandle: isSelf ? 'target-top' : 'target-left',
    }
  })
}

function SchemaPreview() {
  const { data: schema, isLoading, isError, error } = useSchemaQuery()
  const { nodes: rawNodes, edges: rawEdges } = extractGraph(schema)
  const preparedNodes = normalizeNodes(rawNodes)
  const edges = normalizeEdges(Array.isArray(rawEdges) ? rawEdges : [])
  const nodes = layoutWithDagre(preparedNodes, edges)

  if (isLoading) {
    return (
      <div
        className="schema-preview"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Spin size="large" />
      </div>
    )
  }

  if (isError) {
    return (
      <Typography.Text type="danger">
        {error?.data?.msg ?? error?.data?.message ?? 'Failed to load schema'}
      </Typography.Text>
    )
  }

  return (
    <div className="schema-preview">
      <ReactFlow
        nodes={nodes}
        edges={[]}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.2}
        defaultEdgeOptions={{ type: 'smoothstep' }}
      >
        <Background />
        <Controls position="bottom-left" showInteractive />
        <MiniMap
          position="bottom-right"
          pannable
          zoomable
          nodeColor="#1677ff"
          maskColor="rgba(240, 240, 240, 0.7)"
          style={{ width: 180, height: 120 }}
        />
      </ReactFlow>
    </div>
  )
}

export { SchemaPreview }
