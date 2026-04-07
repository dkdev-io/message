'use client'

import { useMemo, useCallback } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  type Node,
  type Edge,
  type NodeTypes,
  Handle,
  Position,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import dagre from '@dagrejs/dagre'

interface Branch {
  id: string
  label: string
  keywords: string[]
  response_body: string
}

interface ScriptTreeProps {
  script: string
  branches: Branch[]
}

function getBorderColor(label: string): string {
  const l = label.toLowerCase()
  if (l.includes('positive') || l.includes('support')) return '#22c55e'
  if (l.includes('negative') || l.includes('not interested') || l.includes('opposed')) return '#ef4444'
  if (l.includes('question')) return '#3b82f6'
  if (l.includes('undecided') || l.includes('neutral')) return '#eab308'
  return '#6b7280'
}

function RootNode({ data }: { data: { label: string; body: string } }) {
  return (
    <div style={{
      background: 'var(--color-surface)',
      border: '2px solid #5170FF',
      borderRadius: 12,
      padding: '12px 16px',
      width: 220,
      fontSize: 12,
    }}>
      <div style={{ fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#5170FF', marginBottom: 6 }}>
        {data.label}
      </div>
      <div style={{ color: 'var(--color-text)', lineHeight: 1.4 }}>
        {data.body}
      </div>
      <Handle type="source" position={Position.Bottom} style={{ background: '#5170FF' }} />
    </div>
  )
}

function BranchNode({ data }: { data: { label: string; body: string; borderColor: string } }) {
  return (
    <div style={{
      background: 'var(--color-surface)',
      border: `2px solid ${data.borderColor}`,
      borderRadius: 12,
      padding: '12px 16px',
      width: 200,
      fontSize: 12,
    }}>
      <Handle type="target" position={Position.Top} style={{ background: data.borderColor }} />
      <div style={{ fontWeight: 700, fontSize: 11, color: data.borderColor, marginBottom: 4 }}>
        {data.label}
      </div>
      <div style={{ color: 'var(--color-text)', lineHeight: 1.4 }}>
        {data.body}
      </div>
    </div>
  )
}

const nodeTypes: NodeTypes = {
  root: RootNode,
  branch: BranchNode,
}

function layoutGraph(nodes: Node[], edges: Edge[]): { nodes: Node[]; edges: Edge[] } {
  const g = new dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))
  g.setGraph({ rankdir: 'TB', nodesep: 40, ranksep: 80 })

  for (const node of nodes) {
    g.setNode(node.id, { width: node.type === 'root' ? 220 : 200, height: 100 })
  }
  for (const edge of edges) {
    g.setEdge(edge.source, edge.target)
  }

  dagre.layout(g)

  const layoutedNodes = nodes.map((node) => {
    const pos = g.node(node.id)
    const width = node.type === 'root' ? 220 : 200
    return {
      ...node,
      position: { x: pos.x - width / 2, y: pos.y - 50 },
    }
  })

  return { nodes: layoutedNodes, edges }
}

export default function ScriptTree({ script, branches }: ScriptTreeProps) {
  const { nodes, edges } = useMemo(() => {
    const rawNodes: Node[] = [
      {
        id: 'root',
        type: 'root',
        position: { x: 0, y: 0 },
        data: {
          label: 'Initial Script',
          body: script.length > 80 ? script.slice(0, 80) + '...' : script,
        },
      },
      ...branches.map((b) => ({
        id: b.id,
        type: 'branch' as const,
        position: { x: 0, y: 0 },
        data: {
          label: b.label,
          body: b.response_body.length > 60 ? b.response_body.slice(0, 60) + '...' : b.response_body,
          borderColor: getBorderColor(b.label),
        },
      })),
    ]

    const rawEdges: Edge[] = branches.map((b) => ({
      id: `root-${b.id}`,
      source: 'root',
      target: b.id,
      label: b.keywords.slice(0, 3).join(', '),
      style: { stroke: getBorderColor(b.label), strokeWidth: 2 },
      labelStyle: { fontSize: 10, fill: 'var(--color-muted)' },
      labelBgStyle: { fill: 'var(--color-bg)', fillOpacity: 0.8 },
      labelBgPadding: [4, 2] as [number, number],
      type: 'smoothstep',
    }))

    return layoutGraph(rawNodes, rawEdges)
  }, [script, branches])

  const onInit = useCallback((instance: { fitView: () => void }) => {
    setTimeout(() => instance.fitView(), 50)
  }, [])

  if (branches.length === 0) {
    return (
      <div className="text-center py-12 text-sm text-[var(--color-muted)]">
        Add response branches to see the conversation flow.
      </div>
    )
  }

  return (
    <div style={{ height: 400 }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onInit={onInit}
        fitView
        proOptions={{ hideAttribution: true }}
        minZoom={0.3}
        maxZoom={1.5}
      >
        <Background gap={20} size={1} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  )
}
