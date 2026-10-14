import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { 
  Bot, 
  Cpu, 
  Wrench, 
  Sliders, 
  Clock, 
  Copy, 
  Edit3,
  Calendar,
  Calculator,
  FileText
} from 'lucide-react';

const TOOL_ICONS = {
  calculator: Calculator,
  text_processor: FileText,
  datetime: Calendar,
};

const TOOL_NAMES = {
  calculator: 'Calculator',
  text_processor: 'Text Processor',
  datetime: 'Date & Time',
};

export const AgentDetailModal = ({
  isOpen,
  onClose,
  agent,
  onEdit,
  onDuplicate,
}) => {
  if (!agent) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={agent.name}
      size="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={Copy}
              onClick={() => {
                onClose();
                onDuplicate(agent);
              }}
            >
              Duplicate
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={Edit3}
              onClick={() => {
                onClose();
                onEdit(agent);
              }}
            >
              Edit
            </Button>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Header Summary */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-paper-muted border border-hairline rounded-sm">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-ink" />
            <span className="font-mono text-xs text-ink-muted">Model:</span>
            <Badge variant="accent" size="sm">{agent.model}</Badge>
          </div>
          <div className="text-[11px] font-mono text-ink-muted">
            Created: {new Date(agent.createdAt).toLocaleDateString()}
          </div>
        </div>

        {/* Description */}
        {agent.description && (
          <div className="space-y-1">
            <h4 className="text-xs font-mono uppercase text-ink-muted tracking-wider">
              Description
            </h4>
            <p className="text-sm text-ink leading-relaxed">
              {agent.description}
            </p>
          </div>
        )}

        {/* Enabled Tools */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Wrench className="w-3.5 h-3.5 text-ink-secondary" />
            <h4 className="text-xs font-mono uppercase text-ink-muted tracking-wider">
              Enabled Tools ({agent.tools?.length || 0})
            </h4>
          </div>
          {agent.tools && agent.tools.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {agent.tools.map((t) => {
                const IconComp = TOOL_ICONS[t] || Wrench;
                return (
                  <Badge key={t} variant="success" size="md" className="flex items-center gap-1.5 py-1 px-2.5">
                    <IconComp className="w-3.5 h-3.5" />
                    <span>{TOOL_NAMES[t] || t}</span>
                  </Badge>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-ink-muted italic">No tools enabled for this agent.</p>
          )}
        </div>

        {/* Parameters & Limits Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
          <div className="p-3 bg-white border border-hairline rounded-sm">
            <span className="text-[10px] text-ink-muted block uppercase">Temperature</span>
            <span className="text-ink font-bold text-sm mt-0.5 block">{agent.parameters?.temperature ?? 0.7}</span>
          </div>
          <div className="p-3 bg-white border border-hairline rounded-sm">
            <span className="text-[10px] text-ink-muted block uppercase">Max Tokens</span>
            <span className="text-ink font-bold text-sm mt-0.5 block">{agent.parameters?.maxTokens ?? 1024}</span>
          </div>
          <div className="p-3 bg-white border border-hairline rounded-sm">
            <span className="text-[10px] text-ink-muted block uppercase">Max Turns</span>
            <span className="text-ink font-bold text-sm mt-0.5 block">{agent.limits?.maxTurns ?? 3}</span>
          </div>
          <div className="p-3 bg-white border border-hairline rounded-sm">
            <span className="text-[10px] text-ink-muted block uppercase">Timeout</span>
            <span className="text-ink font-bold text-sm mt-0.5 block">{agent.limits?.timeoutSeconds ?? 30}s</span>
          </div>
        </div>

        {/* System Instructions / Prompt */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-ink-secondary" />
            <h4 className="text-xs font-mono uppercase text-ink-muted tracking-wider">
              System Instructions
            </h4>
          </div>
          <pre className="p-4 bg-paper-muted border border-hairline rounded-sm font-mono text-xs text-ink whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
            {agent.instructions}
          </pre>
        </div>
      </div>
    </Modal>
  );
};
