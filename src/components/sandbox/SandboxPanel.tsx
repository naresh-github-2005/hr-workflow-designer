import { useMemo, useState } from 'react';
import { simulateWorkflow } from '../../api/mockApi';
import { useWorkflowStore } from '../../store/workflowStore';
import { useToastStore } from '../../store/toastStore';
import type { SimulationResult } from '../../types/workflow';

export function SandboxPanel() {
  const nodes = useWorkflowStore((state) => state.nodes);
  const edges = useWorkflowStore((state) => state.edges);
  const serialize = useWorkflowStore((state) => state.serialize);
  const validate = useWorkflowStore((state) => state.validate);
  const validation = useWorkflowStore((state) => state.validation);
  const addToast = useToastStore((state) => state.addToast);
  const [isSimulating, setIsSimulating] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [simulateError, setSimulateError] = useState<string | null>(null);

  const workflowJson = useMemo(
    () => JSON.stringify({ nodes, edges }, null, 2),
    [nodes, edges]
  );

  const runSimulation = async () => {
    const validationResult = validate();
    if (!validationResult.isValid) {
      setResult(null);
      setSimulateError('Resolve validation errors before simulation.');
      addToast('Resolve validation errors before simulation.', 'warning');
      return;
    }

    setIsSimulating(true);
    setSimulateError(null);
    try {
      const response = await simulateWorkflow(serialize());
      setResult(response);
      addToast('Simulation completed successfully.', 'success');
    } catch {
      setSimulateError('Simulation failed in mock API.');
      addToast('Simulation failed in mock API.', 'error');
    } finally {
      setIsSimulating(false);
    }
  };

  const errorCount = validation.issues.filter((issue) => issue.level === 'error').length;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-800">Workflow sandbox</h2>
        <button
          onClick={runSimulation}
          disabled={isSimulating}
          className="rounded bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSimulating ? 'Simulating...' : 'Run simulation'}
        </button>
      </div>

      <div className="space-y-2">
        <p className={`text-xs ${errorCount === 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
          {errorCount === 0 ? 'Validation passed.' : `${errorCount} validation error(s) detected.`}
        </p>
        {validation.issues.length > 0 ? (
          <ul className="max-h-32 list-disc space-y-1 overflow-auto pl-4 text-[11px] text-slate-600">
            {validation.issues.map((issue) => (
              <li key={`${issue.code}-${issue.nodeId ?? 'global'}-${issue.message}`}>
                <span className={issue.level === 'error' ? 'text-rose-700' : 'text-amber-700'}>
                  [{issue.level.toUpperCase()}]
                </span>{' '}
                {issue.message}
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="mt-3">
        <p className="mb-1 text-xs font-medium text-slate-700">Serialized workflow JSON</p>
        <pre className="max-h-44 overflow-auto rounded border border-slate-200 bg-slate-50 p-2 text-[11px] text-slate-700">
          {workflowJson}
        </pre>
      </div>

      {simulateError ? <p className="mt-2 text-xs text-rose-700">{simulateError}</p> : null}

      {result ? (
        <div className="mt-3 space-y-2">
          <p className="text-xs font-medium text-emerald-700">{result.summary}</p>
          <ol className="max-h-52 space-y-2 overflow-auto text-xs">
            {result.logs.map((log) => (
              <li key={`${log.step}-${log.nodeId}`} className="rounded border border-slate-200 bg-slate-50 p-2">
                <p className="font-semibold text-slate-800">
                  Step {log.step}: {log.title} ({log.nodeType})
                </p>
                <p className="text-slate-600">{log.message}</p>
                <p className="text-[10px] text-slate-500">{log.timestamp}</p>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </section>
  );
}
