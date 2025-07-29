import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface WorkflowNode {
  id: string;
  type: 'start' | 'process' | 'decision' | 'end';
  title: string;
  description: string;
  status: 'pending' | 'active' | 'completed' | 'error';
  connections: string[];
}

export interface WorkflowData {
  nodes: WorkflowNode[];
  title: string;
  description: string;
}

interface InteractiveFlowchartProps {
  workflow: WorkflowData;
  onNodeClick?: (node: WorkflowNode) => void;
  className?: string;
}

export default function InteractiveFlowchart({ 
  workflow, 
  onNodeClick, 
  className = "" 
}: InteractiveFlowchartProps) {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const getNodeColor = (status: WorkflowNode['status']) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 border-gray-300 text-gray-700';
      case 'active': return 'bg-blue-100 border-blue-300 text-blue-700';
      case 'completed': return 'bg-green-100 border-green-300 text-green-700';
      case 'error': return 'bg-red-100 border-red-300 text-red-700';
      default: return 'bg-gray-100 border-gray-300 text-gray-700';
    }
  };

  const getNodeShape = (type: WorkflowNode['type']) => {
    switch (type) {
      case 'start': return 'rounded-full';
      case 'end': return 'rounded-full';
      case 'decision': return 'transform rotate-45';
      case 'process': return 'rounded-lg';
      default: return 'rounded-lg';
    }
  };

  const getStatusBadge = (status: WorkflowNode['status']) => {
    const variants = {
      pending: 'secondary',
      active: 'default',
      completed: 'secondary',
      error: 'destructive'
    } as const;

    const labels = {
      pending: '대기',
      active: '진행중',
      completed: '완료',
      error: '오류'
    };

    return (
      <Badge variant={variants[status]} className="text-xs">
        {labels[status]}
      </Badge>
    );
  };

  const handleNodeClick = (node: WorkflowNode) => {
    setSelectedNode(node.id === selectedNode ? null : node.id);
    onNodeClick?.(node);
  };

  return (
    <div className={`workflow-container ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle>{workflow.title}</CardTitle>
          <p className="text-sm text-muted-foreground">{workflow.description}</p>
        </CardHeader>
        <CardContent>
          <div className="workflow-canvas relative">
            {/* 간단한 플로우차트 레이아웃 */}
            <div className="grid gap-4 max-w-4xl mx-auto">
              {workflow.nodes.map((node, index) => (
                <div key={node.id} className="flex flex-col items-center">
                  {/* 노드 */}
                  <div
                    className={`
                      relative p-4 min-w-[160px] border-2 cursor-pointer transition-all duration-200
                      ${getNodeColor(node.status)}
                      ${getNodeShape(node.type)}
                      ${selectedNode === node.id ? 'ring-2 ring-blue-500 scale-105' : 'hover:scale-102'}
                      ${node.type === 'decision' ? 'w-32 h-32 flex items-center justify-center' : ''}
                    `}
                    onClick={() => handleNodeClick(node)}
                  >
                    <div className={`text-center ${node.type === 'decision' ? 'transform -rotate-45' : ''}`}>
                      <div className="font-medium text-sm mb-1">{node.title}</div>
                      <div className="text-xs opacity-75 mb-2">{node.description}</div>
                      {getStatusBadge(node.status)}
                    </div>
                  </div>

                  {/* 연결 화살표 */}
                  {index < workflow.nodes.length - 1 && (
                    <div className="flex flex-col items-center my-2">
                      <div className="w-0.5 h-6 bg-gray-400"></div>
                      <div className="w-2 h-2 bg-gray-400 rotate-45 transform -mt-1"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* 선택된 노드 상세 정보 */}
            {selectedNode && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border">
                {(() => {
                  const node = workflow.nodes.find(n => n.id === selectedNode);
                  if (!node) return null;
                  
                  return (
                    <div>
                      <h4 className="font-medium text-blue-900 mb-2">{node.title}</h4>
                      <p className="text-sm text-blue-700 mb-3">{node.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-blue-600">상태:</span>
                          {getStatusBadge(node.status)}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedNode(null)}
                        >
                          닫기
                        </Button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}