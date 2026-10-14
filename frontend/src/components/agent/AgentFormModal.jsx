import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input, Textarea } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Alert } from '../ui/Alert';
import { agentApi } from '../../services/apiClient';
import { 
  Bot, 
  Cpu, 
  Wrench, 
  Sliders, 
  Clock, 
  HelpCircle,
  Calculator,
  FileText,
  Calendar,
  AlertTriangle
} from 'lucide-react';

const AVAILABLE_MODELS = [
  {
    id: 'qwen/qwen3.8-27b',
    name: 'Qwen 3.8 27B',
    description: 'High-reasoning instruction-following model with native JSON support on Groq.',
    context: '32k context',
    recommended: true,
    availableOnProvider: true,
  },
  {
    id: 'llama-3.3-70b-versatile',
    name: 'Llama 3.3 70B Versatile',
    description: 'High-reasoning model optimized for complex instructions and tool orchestration.',
    context: '128k context',
    recommended: false,
    availableOnProvider: false,
  },
  {
    id: 'llama-3.1-8b-instant',
    name: 'Llama 3.1 8B Instant',
    description: 'Ultra-fast inference model ideal for low-latency tasks and rapid prototyping.',
    context: '128k context',
    recommended: false,
    availableOnProvider: false,
  },
  {
    id: 'openai/gpt-oss-120b',
    name: 'GPT OSS 120B',
    description: 'Massive open-weights foundation model available on Groq.',
    context: '128k context',
    recommended: false,
    availableOnProvider: true,
  },
  {
    id: 'openai/gpt-oss-20b',
    name: 'GPT OSS 20B',
    description: 'Compact high-speed open-weights model on Groq.',
    context: '128k context',
    recommended: false,
    availableOnProvider: true,
  },
  {
    id: 'mixtral-8x7b-32768',
    name: 'Mixtral 8x7B (MoE)',
    description: 'Mixture of Experts architecture balancing speed and nuanced prompt response.',
    context: '32k context',
    recommended: false,
    availableOnProvider: false,
  },
];

const AVAILABLE_TOOLS = [
  {
    id: 'calculator',
    name: 'Calculator',
    icon: Calculator,
    description: 'Deterministic mathematical expression evaluator with AST-level safety.',
  },
  {
    id: 'text_processor',
    name: 'Text Processor',
    icon: FileText,
    description: 'Text summarization, keyword extraction, and structural transforms.',
  },
  {
    id: 'datetime',
    name: 'Date & Time',
    icon: Calendar,
    description: 'Timezone-aware date calculations and ISO timestamp resolutions.',
  },
];

export const AgentFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  agentToEdit = null,
  isLoading = false,
}) => {
  const isEditing = Boolean(agentToEdit);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [model, setModel] = useState('qwen/qwen3.8-27b');
  const [tools, setTools] = useState([]);
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1024);
  const [maxTurns, setMaxTurns] = useState(3);
  const [timeoutSeconds, setTimeoutSeconds] = useState(30);

  // Live model availability
  const [modelsList, setModelsList] = useState(AVAILABLE_MODELS);
  const [isLoadingModels, setIsLoadingModels] = useState(false);

  // Validation & Error states
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  // Fetch verified provider models when modal opens
  useEffect(() => {
    let isMounted = true;
    if (isOpen) {
      setIsLoadingModels(true);
      agentApi.getSupportedModels()
        .then((res) => {
          if (!isMounted) return;
          if (Array.isArray(res.verified) && res.verified.length > 0) {
            setModelsList(res.verified);

            // If creating an agent, ensure an active model is selected by default
            if (!agentToEdit) {
              const active = res.verified.find((m) => m.availableOnProvider !== false);
              if (active) {
                setModel((prev) => {
                  const currentObj = res.verified.find((m) => m.id === prev);
                  return (currentObj && currentObj.availableOnProvider !== false) ? prev : active.id;
                });
              }
            }
          }
        })
        .catch((err) => {
          console.warn('Failed to fetch live provider models:', err);
        })
        .finally(() => {
          if (isMounted) setIsLoadingModels(false);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [isOpen, agentToEdit]);

  useEffect(() => {
    if (agentToEdit) {
      setName(agentToEdit.name || '');
      setDescription(agentToEdit.description || '');
      setInstructions(agentToEdit.instructions || '');
      setModel(agentToEdit.model || 'qwen/qwen3.8-27b');
      setTools(Array.isArray(agentToEdit.tools) ? agentToEdit.tools : []);
      setTemperature(agentToEdit.parameters?.temperature ?? 0.7);
      setMaxTokens(agentToEdit.parameters?.maxTokens ?? 1024);
      setMaxTurns(agentToEdit.limits?.maxTurns ?? 3);
      setTimeoutSeconds(agentToEdit.limits?.timeoutSeconds ?? 30);
    } else {
      // Default clean state for creation
      setName('');
      setDescription('');
      setInstructions('You are a helpful, precise assistant built on the Fable platform.\nWhen solving problems, think step by step and use enabled tools when calculations or formatting is required.');
      setModel('qwen/qwen3.8-27b');
      setTools(['calculator']);
      setTemperature(0.7);
      setMaxTokens(1024);
      setMaxTurns(3);
      setTimeoutSeconds(30);
    }
    setErrors({});
    setSubmitError('');
  }, [agentToEdit, isOpen]);

  const toggleTool = (toolId) => {
    setTools((prev) =>
      prev.includes(toolId) ? prev.filter((id) => id !== toolId) : [...prev, toolId]
    );
  };

  const selectedModelObj = modelsList.find((m) => m.id === model);
  const isSelectedModelUnavailable = selectedModelObj && selectedModelObj.availableOnProvider === false;

  const validateForm = () => {
    const errs = {};
    if (!name.trim()) {
      errs.name = 'Agent name is required.';
    } else if (name.trim().length < 2) {
      errs.name = 'Name must be at least 2 characters.';
    } else if (name.trim().length > 60) {
      errs.name = 'Name cannot exceed 60 characters.';
    }

    if (description.length > 200) {
      errs.description = 'Description cannot exceed 200 characters.';
    }

    if (!instructions.trim()) {
      errs.instructions = 'System instructions are required.';
    } else if (instructions.trim().length < 10) {
      errs.instructions = 'Instructions must be at least 10 characters long.';
    }

    if (isSelectedModelUnavailable) {
      errs.model = `Model "${model}" is unavailable on Groq. Please choose an active model.`;
    }

    if (temperature < 0.0 || temperature > 2.0) {
      errs.temperature = 'Temperature must be between 0.0 and 2.0.';
    }

    if (maxTokens < 128 || maxTokens > 4096) {
      errs.maxTokens = 'Max tokens must be between 128 and 4096.';
    }

    if (maxTurns < 1 || maxTurns > 10) {
      errs.maxTurns = 'Max turns must be between 1 and 10.';
    }

    if (timeoutSeconds < 5 || timeoutSeconds > 120) {
      errs.timeoutSeconds = 'Timeout must be between 5 and 120 seconds.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!validateForm()) return;

    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim(),
        instructions: instructions.trim(),
        model,
        tools,
        parameters: {
          temperature: Number(temperature),
          maxTokens: Number(maxTokens),
        },
        limits: {
          maxTurns: Number(maxTurns),
          timeoutSeconds: Number(timeoutSeconds),
        },
      });
    } catch (err) {
      setSubmitError(err.message || 'Failed to save agent configuration.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit Agent: ${agentToEdit?.name}` : 'Configure New Agent'}
      size="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button id="btn-cancel-agent" variant="ghost" type="button" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            id="btn-submit-agent"
            variant="primary"
            type="submit"
            form="agent-form"
            isLoading={isLoading}
          >
            {isEditing ? 'Save Changes' : 'Create Agent'}
          </Button>
        </div>
      }
    >
      <form id="agent-form" onSubmit={handleSubmit} className="space-y-6">
        {submitError && (
          <Alert variant="error" title="Configuration Error">
            {submitError}
          </Alert>
        )}

        {/* 1. Identity & Purpose */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-hairline pb-2">
            <Bot className="w-4 h-4 text-ink" />
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-ink">
              1. Identity & Scope
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <Input
              id="input-agent-name"
              label="Agent Name"
              required
              placeholder="e.g., Financial Data Analyst"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
              hint="Unique descriptive identifier (2–60 characters)."
            />

            <Input
              id="input-agent-description"
              label="Short Description (Optional)"
              placeholder="e.g., Parses quarterly earnings and generates summary tables."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              error={errors.description}
              hint={`${description.length}/200 characters`}
            />
          </div>
        </div>

        {/* 2. Instructions / System Prompt */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-hairline pb-2">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-ink" />
              <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-ink">
                2. System Instructions
              </h3>
            </div>
            <span className="text-[11px] font-mono text-ink-muted">
              {instructions.length} chars
            </span>
          </div>

          <Textarea
            id="textarea-agent-instructions"
            label="Behavioral Prompt & Constraints"
            required
            rows={5}
            className="font-mono text-xs leading-relaxed"
            placeholder="Describe the agent's persona, reasoning rules, boundaries, and expected output format..."
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            error={errors.instructions}
            hint="Defines the fundamental system instructions for model inference."
          />
        </div>

        {/* 3. Model Selection */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-hairline pb-2">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-ink" />
              <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-ink">
                3. Model Inference Engine
              </h3>
            </div>
            <span className="text-[10px] font-mono text-ink-muted">
              Provider: Groq Cloud
            </span>
          </div>

          {isSelectedModelUnavailable && (
            <Alert variant="warning" title="Model Currently Unavailable">
              The model <span className="font-mono font-semibold">"{model}"</span> is not accessible on the active Groq provider. Please select an active alternative model before saving.
            </Alert>
          )}

          {errors.model && (
            <p className="text-xs text-status-error font-mono">{errors.model}</p>
          )}

          <div className="grid grid-cols-1 gap-2.5">
            {modelsList.map((m) => {
              const isSelected = model === m.id;
              const isAvailable = m.availableOnProvider !== false;
              return (
                <div
                  key={m.id}
                  onClick={() => {
                    if (isAvailable) {
                      setModel(m.id);
                    }
                  }}
                  className={`p-3 rounded-sm border transition-all ${
                    !isAvailable
                      ? 'opacity-55 bg-paper-muted cursor-not-allowed border-hairline'
                      : isSelected
                      ? 'border-ink bg-white shadow-editorial ring-1 ring-ink cursor-pointer'
                      : 'border-hairline bg-paper hover:border-ink/40 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="agent-model"
                        checked={isSelected}
                        disabled={!isAvailable}
                        onChange={() => isAvailable && setModel(m.id)}
                        className="text-ink focus:ring-ink disabled:opacity-40"
                      />
                      <span className={`font-serif font-medium text-sm ${!isAvailable ? 'text-ink-muted line-through decoration-hairline' : 'text-ink'}`}>
                        {m.name}
                      </span>
                      {m.recommended && (
                        <Badge variant="accent" size="sm">
                          Recommended
                        </Badge>
                      )}
                      {isAvailable ? (
                        <Badge variant="success" size="sm">
                          Available
                        </Badge>
                      ) : (
                        <Badge variant="error" size="sm">
                          Unavailable on Groq
                        </Badge>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-ink-muted">
                      {m.contextWindow ? `${Math.round(m.contextWindow / 1024)}k context` : (m.context || '')}
                    </span>
                  </div>
                  <p className="text-xs text-ink-secondary mt-1 pl-5">
                    {m.description}
                  </p>
                  {!isAvailable && (
                    <p className="text-[11px] font-mono text-status-error mt-1 pl-5">
                      Inactive on active Groq account. Choose an active alternative.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. Built-in Tools Registry */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-hairline pb-2">
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-ink" />
              <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-ink">
                4. Approved Built-in Tools
              </h3>
            </div>
            <span className="text-[11px] font-mono text-ink-muted">
              {tools.length} of {AVAILABLE_TOOLS.length} enabled
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {AVAILABLE_TOOLS.map((t) => {
              const isChecked = tools.includes(t.id);
              const IconComp = t.icon;
              return (
                <div
                  key={t.id}
                  onClick={() => toggleTool(t.id)}
                  className={`p-3 rounded-sm border cursor-pointer flex flex-col justify-between transition-all ${
                    isChecked
                      ? 'border-ink bg-emerald-50/30 ring-1 ring-ink'
                      : 'border-hairline bg-paper hover:border-ink/40'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <IconComp className="w-4 h-4 text-ink" />
                        <span className="text-xs font-bold text-ink">{t.name}</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} // handled by parent div
                        className="rounded text-ink focus:ring-ink"
                      />
                    </div>
                    <p className="text-[11px] text-ink-secondary leading-normal">
                      {t.description}
                    </p>
                  </div>
                  <div className="mt-2 pt-2 border-t border-hairline/60">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-ink-muted">
                      {isChecked ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 5. Parameters & Execution Guardrails */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-hairline pb-2">
            <Clock className="w-4 h-4 text-ink" />
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-ink">
              5. Parameters & Protective Limits
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-paper-muted p-4 rounded-sm border border-hairline">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-mono text-ink">Temperature</label>
                <span className="text-xs font-mono font-semibold text-ink">
                  {temperature}
                </span>
              </div>
              <input
                type="range"
                min="0.0"
                max="2.0"
                step="0.05"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-ink"
              />
              <span className="text-[10px] text-ink-muted">
                0.0 = Deterministic &middot; 2.0 = Creative
              </span>
              {errors.temperature && (
                <p className="text-xs text-status-error mt-1">{errors.temperature}</p>
              )}
            </div>

            <div>
              <Input
                label="Max Tokens"
                type="number"
                min={128}
                max={4096}
                step={64}
                value={maxTokens}
                onChange={(e) => setMaxTokens(parseInt(e.target.value, 10) || 128)}
                error={errors.maxTokens}
                hint="Token budget for completion (128–4096)."
              />
            </div>

            <div>
              <Input
                label="Max Tool Turns"
                type="number"
                min={1}
                max={10}
                value={maxTurns}
                onChange={(e) => setMaxTurns(parseInt(e.target.value, 10) || 1)}
                error={errors.maxTurns}
                hint="Max reasoning steps per run (1–10)."
              />
            </div>

            <div>
              <Input
                label="Timeout (Seconds)"
                type="number"
                min={5}
                max={120}
                value={timeoutSeconds}
                onChange={(e) => setTimeoutSeconds(parseInt(e.target.value, 10) || 5)}
                error={errors.timeoutSeconds}
                hint="Max wall-clock run duration (5–120s)."
              />
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
};
