'use client'

import { useCallback, useMemo, type DragEvent } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  BackgroundVariant,
} from '@xyflow/react'
import { useBuilder, useBuilderDispatch } from './BuilderContext'
import WorkflowNode from './WorkflowNode'
import type { StepNode, StepNodeData } from './types'

const nodeTypes = { stepNode: WorkflowNode }

export default function Canvas() {
  const { nodes, edges, stepCounter } = useBuilder()
  const dispatch = useBuilderDispatch()

  const onNodesChange: OnNodesChange<StepNode> = useCallback(
    (changes) => {
      const updated = applyNodeChanges(changes, nodes) as StepNode[]
      dispatch({ type: 'SET_NODES', nodes: updated })
    },
    [nodes, dispatch]
  )

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      const updated = applyEdgeChanges(changes, edges)
      dispatch({ type: 'SET_EDGES', edges: updated })
    },
    [edges, dispatch]
  )

  const onConnect: OnConnect = useCallback(
    (connection) => {
      const newEdges = addEdge(
        {
          ...connection,
          animated: true,
          style: { stroke: 'var(--accent-dim)' },
        },
        edges
      )
      dispatch({ type: 'SET_EDGES', edges: newEdges })
    },
    [edges, dispatch]
  )

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: StepNode) => {
      dispatch({ type: 'SELECT_NODE', nodeId: node.id })
    },
    [dispatch]
  )

  const onPaneClick = useCallback(() => {
    dispatch({ type: 'SELECT_NODE', nodeId: null })
  }, [dispatch])

  const onDragOver = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault()
      const raw = e.dataTransfer.getData('application/0n-service')
      if (!raw) return

      const { serviceId, serviceName, serviceIcon, serviceLogo } = JSON.parse(raw)
      const stepNum = String(stepCounter).padStart(3, '0')
      const stepId = `step_${stepNum}`

      // Get the position relative to the React Flow canvas
      const bounds = (e.target as HTMLElement).closest('.react-flow')?.getBoundingClientRect()
      if (!bounds) return

      const position = {
        x: e.clientX - bounds.left,
        y: e.clientY - bounds.top,
      }

      const data: StepNodeData = {
        stepId,
        serviceId,
        serviceName,
        serviceIcon,
        serviceLogo: serviceLogo || '',
        toolId: '',
        toolName: '',
        inputs: {},
        outputs: {},
        condition: '',
        onFail: 'halt',
        timeout: 0,
        parallelGroup: '',
      }

      const newNode: StepNode = {
        id: stepId,
        type: 'stepNode',
        position,
        data,
      }

      dispatch({ type: 'ADD_NODE', node: newNode })
    },
    [stepCounter, dispatch]
  )

  const defaultEdgeOptions = useMemo(
    () => ({
      animated: true,
      style: { stroke: 'var(--accent-dim)', strokeWidth: 2 },
    }),
    []
  )

  return (
    <div style={{ flex: 1 }} onDragOver={onDragOver} onDrop={onDrop}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        defaultEdgeOptions={defaultEdgeOptions}
        colorMode="dark"
        snapToGrid
        snapGrid={[20, 20] as [number, number]}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
        <Controls />
        <MiniMap
          nodeStrokeWidth={3}
          pannable
          zoomable
        />
      </ReactFlow>
    </div>
  )
}
