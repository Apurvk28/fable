import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input, Textarea } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Alert } from '../ui/Alert';
import { agentApi } from '../../services/apiClient';
import {
  Sparkles,
  Bot,
  Wrench,
  Sliders,
  Clock,
  Cpu,
  Calculator,
  FileText,
  Calendar,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Lightbulb,
  RefreshCw
} from 'lucide-react';

const STARTER_PROMPTS = [
  {
    title: 'Financial Research Analyst',
    description: 'Calculates valuation metrics and summarizes quarterly earnings reports.',
    prompt: 'An equity research agent that parses company earnings, calculates financial ratios using the calculator, and formats summary tables.',
  },
  {
    title: 'Document Summarizer & Fact Extractor',
    description: 'Summarizes long research notes and extracts dates and timestamps.',
    prompt: 'A research assistant that extracts key takeaways from complex documents, formats structured bullet points, and tags date references.',
  },
  {
    title: 'Engineering Calculator & Unit Solver',
    description: 'Evaluates formulas, executes arithmetic, and validates numerical limits.',
    prompt: 'A scientific assistant that evaluates arithmetic expressions step by step using the calculator tool and provides clean mathematical output.',
  },
];

const AVAILABLE_TOOLS = [
  { id: 'calculator', name: 'Calculator', icon: Calculator },
  { id: 'text_processor', name: 'Text Processor', icon: FileText },
  { id: 'datetime', name: 'Date & Time', icon: Calendar },
];

export const AiAssistedModal = ({
  isOpen,
  onClose,
  onAgentSaved,
}) => {
  // Step: 'prompt' | 'review'
  const [step, setStep] = useState('prompt');
  const [userPrompt, setUserPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  // Proposal State (Step 2)
  const [proposal, setProposal] = useState(null);
  const [modelUsed, setModelUsed] = useState('');

  // Editable fields in review step
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [model, setModel] = useState('llama-3.3-70b-versatile');
  const [tools, setTools] = useState([]);
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1024);
  const [maxTurns, setMaxTurns] = useState(3);
  const [timeoutSeconds, setTimeoutSeconds] = useState(30);

  useEffect(() => {
    if (isOpen) {
      setStep('prompt');
      setUserPrompt('');
      setError(null);
      setProposal(null);
    }
  }, [isOpen]);

  const handleSelectStarter = (starterPrompt) => {
    setUserPrompt(starterPrompt);
  };

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    if (!userPrompt.trim() || userPrompt.trim().length < 5) {
      setError('Please provide a descriptive prompt for your agent (at least 5 characters).');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const res = await agentApi.generateConfig({ purpose: userPrompt.trim() });
      const prop = res.proposal;

      setProposal(prop);
      setModelUsed(res.modelUsed || 'llama-3.3-70b-versatile');

      // Populate review state
      setName(prop.name || 'AI Assistant');
      setDescription(prop.description || '');
      setInstructions(prop.instructions || '');
      setModel(prop.model || 'llama-3.3-70b-versatile');
      setTools(Array.isArray(prop.tools) ? prop.tools : []);
      setTemperature(prop.parameters?.temperature ?? 0.7);
      setMaxTokens(prop.parameters?.maxTokens ?? 1024);
      setMaxTurns(prop.limits?.maxTurns ?? 3);
      setTimeoutSeconds(prop.limits?.timeoutSeconds ?? 30);

      setStep('review');
    } catch (err) {
      setError(err.message || 'Failed to generate agent configuration from Groq.');
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleTool = (toolId) => {
    setTools((prev) =>
      prev.includes(toolId) ? prev.filter((id) => id !== toolId) : [...prev, toolId]
    );
  };

  const handleSaveToWorkshop = async () => {
    if (!name.trim()) {
      setError('Agent name cannot be blank.');
      return;
    }
    if (!instructions.trim() || instructions.trim().length < 10) {
      setError('System instructions must be at least 10 characters.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const newAgentPayload = {
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
      };

      const res = await agentApi.createAgent(newAgentPayload);
      onAgentSaved(res.agent);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save generated agent.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={step === 'prompt' ? 'AI Agent Architect' : 'Review & Save AI Proposal'}
      size="lg"
      footer={
        step === 'prompt' ? (
          <div className="flex items-center justify-between w-full">
            <Button id="btn-cancel-ai" variant="ghost" onClick={onClose} disabled={isGenerating}>
              Cancel
            </Button>
            <Button
              id="btn-generate-ai"
              variant="accent"
              icon={Sparkles}
              isLoading={isGenerating}
              disabled={userPrompt.trim().length < 5}
              onClick={handleGenerate}
            >
              Generate Configuration
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full">
            <Button
              id="btn-back-ai"
              variant="outline"
              icon={ArrowLeft}
              onClick={() => setStep('prompt')}
              disabled={isSaving}
            >
              Back & Adjust Prompt
            </Button>
            <Button
              id="btn-save-ai-agent"
              variant="primary"
              icon={CheckCircle2}
              isLoading={isSaving}
              onClick={handleSaveToWorkshop}
            >
              Save Agent to Workshop
            </Button>
          </div>
        )
      }
    >
      <div className="space-y-6">
        {error && (
          <Alert variant="error" title="AI Generation Notice" dismissible onDismiss={() => setError(null)}>
            {error}
          </Alert>
        )}

        {step === 'prompt' ? (
          /* Step 1: Prompt Input */
          <div className="space-y-6">
            <div className="bg-fable-chartreuse/15 p-4 rounded-sm border border-hairline flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-ink shrink-0 mt-0.5" />
              <div>
                <h4 className="font-serif font-medium text-ink text-sm">
                  Describe what your agent should do
                </h4>
                <p className="text-xs text-ink-secondary mt-0.5 leading-relaxed">
                  Groq's Llama 3.3 model will analyze your purpose, select the most relevant tools, calibrate parameters, and draft production-grade system instructions.
                </p>
              </div>
            </div>

            {/* Prompt Textarea */}
            <div>
              <Textarea
                id="textarea-ai-purpose"
                label="Agent Purpose & Tasks"
                required
                rows={4}
                placeholder="e.g., An analyst that calculates revenue margins using the calculator, extracts quarterly earnings bullet points, and provides formatted summaries..."
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                hint="Be specific about the tools, input data, and expected output format."
              />
            </div>

            {/* Starter Examples */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-mono text-ink-muted uppercase tracking-wider">
                <Lightbulb className="w-3.5 h-3.5 text-ink-secondary" />
                <span>Or select a starter example</span>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {STARTER_PROMPTS.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSelectStarter(item.prompt)}
                    className="p-3 bg-paper hover:bg-paper-muted border border-hairline hover:border-ink/40 rounded-sm cursor-pointer transition-all text-left group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-serif font-medium text-xs text-ink group-hover:underline">
                        {item.title}
                      </span>
                      <ArrowRight className="w-3 h-3 text-ink-muted group-hover:text-ink transition-transform group-hover:translate-x-0.5" />
                    </div>
                    <p className="text-[11px] text-ink-secondary mt-0.5">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Step 2: Review and Edit Proposal */
          <div className="space-y-6">
            <div className="bg-emerald-50/50 p-4 rounded-sm border border-hairline flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-sm bg-status-success/20 text-status-success flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-serif font-medium text-ink text-sm">
                    AI Proposal Ready for Review
                  </h4>
                  <p className="text-xs text-ink-secondary">
                    Review and tweak any instructions or parameters before saving to your workshop.
                  </p>
                </div>
              </div>
              <Badge variant="accent" size="sm" className="font-mono text-[10px]">
                {modelUsed}
              </Badge>
            </div>

            {/* Editable Identity */}
            <div className="grid grid-cols-1 gap-4">
              <Input
                id="input-ai-agent-name"
                label="Agent Name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Input
                id="input-ai-agent-desc"
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* System Instructions */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-mono text-ink font-medium">
                  Generated System Instructions
                </label>
                <span className="text-[10px] font-mono text-ink-muted">
                  {instructions.length} chars
                </span>
              </div>
              <Textarea
                id="textarea-ai-agent-instructions"
                rows={5}
                className="font-mono text-xs leading-relaxed"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
              />
            </div>

            {/* Enabled Tools */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-ink-muted tracking-wider">
                  Recommended Built-in Tools ({tools.length} active)
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {AVAILABLE_TOOLS.map((t) => {
                  const isChecked = tools.includes(t.id);
                  const IconComp = t.icon;
                  return (
                    <div
                      key={t.id}
                      onClick={() => toggleTool(t.id)}
                      className={`p-2.5 rounded-sm border cursor-pointer flex items-center justify-between transition-all ${
                        isChecked
                          ? 'border-ink bg-emerald-50/40 ring-1 ring-ink'
                          : 'border-hairline bg-paper'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <IconComp className="w-3.5 h-3.5 text-ink" />
                        <span className="text-xs font-medium text-ink">{t.name}</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="rounded text-ink focus:ring-ink"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Calibrated Parameters */}
            <div className="p-3.5 bg-paper-muted rounded-sm border border-hairline grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div>
                <span className="text-[9px] text-ink-muted block uppercase">Temperature</span>
                <span className="text-ink font-bold text-sm block mt-0.5">{temperature}</span>
              </div>
              <div>
                <span className="text-[9px] text-ink-muted block uppercase">Max Tokens</span>
                <span className="text-ink font-bold text-sm block mt-0.5">{maxTokens}</span>
              </div>
              <div>
                <span className="text-[9px] text-ink-muted block uppercase">Max Turns</span>
                <span className="text-ink font-bold text-sm block mt-0.5">{maxTurns}</span>
              </div>
              <div>
                <span className="text-[9px] text-ink-muted block uppercase">Timeout</span>
                <span className="text-ink font-bold text-sm block mt-0.5">{timeoutSeconds}s</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
