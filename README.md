# HR Workflow Designer Module (Prototype)

React + TypeScript + React Flow prototype for HR admins to design, configure, validate, and simulate internal workflows like onboarding, leave approval, and document verification.

https://github.com/user-attachments/assets/75fefa93-4cc0-410e-ad42-e2ab720ed23a

## Project Overview

This prototype provides:

- Drag-and-drop workflow canvas using React Flow
- Custom node types (Start, Task, Approval, Automation, End)
- Dynamic right-side configuration forms per node type
- Built-in workflow validation (structure + required field rules + cycle checks)
- Mock API layer for automation definitions and workflow simulation
- Sandbox panel to serialize graph JSON and run step-by-step simulation logs
- Undo/redo with full history stack (buttons + Ctrl/Cmd shortcuts)
- Right-click node context menu (Edit, Duplicate, Delete)
- Zoom/fit interactions with Alt+drag pan support
- Workflow templates (Employee Onboarding, Leave Approval)
- Dotted live connection preview during edge creation
- Directional arrows on every edge
- Exactly 4 node handles (top/right/bottom/left) supporting both incoming and outgoing links
- Multi-workflow save/load/delete with localStorage persistence
- Toast notifications for key actions
- Mobile-responsive layout with compact Build/Inspector tabs
- Mobile portrait lock screen (editor enabled in landscape mode)
- Mobile landscape build view combines Builder + Canvas in one screen
- Mobile node tap opens details editor sheet automatically
- Mobile compact controls and floating tab switcher for better canvas space
- Mobile fullscreen toggle (browser-supported) and PWA standalone manifest
- Mobile pinch-to-zoom on workflow canvas

No backend persistence or authentication is included by design.

## Architecture

### State Management

- `Zustand` store (`src/store/workflowStore.ts`) holds:
  - `nodes`, `edges`
  - `selectedNodeId`, `selectedEdgeId`
  - `validation` result
  - history stacks (`past`, `future`) for undo/redo
  - graph actions (add/update/remove/select/connect/template/history)
  - serialization and validation helpers
- `Zustand` store (`src/store/workflowLibraryStore.ts`) holds:
  - saved workflow list with active workflow tracking
  - localStorage hydration/persistence helpers
  - save, update, load, and delete actions

### Separation of Concerns

- `components/canvas`: React Flow canvas behavior and interactions
- `components/nodes`: custom node renderers
- `components/forms`: type-safe node-specific forms
- `components/sandbox`: simulation panel and execution logs
- `api`: mock API abstraction (`getAutomations`, `simulateWorkflow`)
- `validation`: graph + node validation rules
- `types`: domain models/interfaces
- `hooks`: reusable behavior (`useAutomations`, `useAutoValidation`)
- `utils`: shared utilities (`id`, node factory)

### Extensibility Approach

To add a new node type:

1. Extend union types in `types/workflow.ts`
2. Add default data in `utils/nodeFactory.ts`
3. Add visual component in `components/nodes/`
4. Add form in `components/forms/`
5. Add validator rules in `validation/workflowValidator.ts`
6. Add palette entry in `components/sidebar/NodePalette.tsx`

## Folder Structure

```text
src/
  api/
    mockApi.ts
  components/
    canvas/
      NodeContextMenu.tsx
      WorkflowCanvas.tsx
    common/
      Field.tsx
      KeyValueEditor.tsx
      ToastViewport.tsx
    forms/
      NodeConfigPanel.tsx
      StartNodeForm.tsx
      TaskNodeForm.tsx
      ApprovalNodeForm.tsx
      AutomationNodeForm.tsx
      EndNodeForm.tsx
    nodes/
      NodeHandles.tsx
      nodeTypes.ts
      NodeCard.tsx
      StartNode.tsx
      TaskNode.tsx
      ApprovalNode.tsx
      AutomationNode.tsx
      EndNode.tsx
    sandbox/
      SandboxPanel.tsx
    sidebar/
      NodePalette.tsx
      RightPanel.tsx
      WorkflowLibraryPanel.tsx
  hooks/
    useAutomations.ts
    useAutoValidation.ts
    useWorkflowShortcuts.ts
  store/
    toastStore.ts
    workflowLibraryStore.ts
    workflowStore.ts
  types/
    workflow.ts
  utils/
    id.ts
    nodeFactory.ts
    templates.ts
  validation/
    workflowValidator.ts
  App.tsx
  main.tsx
  index.css
```

## How to Run

1. Install dependencies:

```bash
npm install
```

2. Start dev server:

```bash
npm run dev
```

3. Open the local Vite URL (usually `http://localhost:5173`).

## Design Decisions

- **Zustand over Context/useReducer:** simple, scalable global graph state with minimal boilerplate.
- **Custom node + custom form pairing:** keeps behavior explicit and modular.
- **Mock API abstraction in one place:** easy to swap with real backend later.
- **Validation as standalone utility:** testable and independent from UI.
- **Immediate form-to-node updates:** fast WYSIWYG workflow editing.
- **History snapshots:** centralized undo/redo logic across canvas and form edits.
- **Template abstraction:** reusable graph presets via typed template registry.

## Assumptions

- Workflows are persisted in browser localStorage only.
- Single active graph editing session.
- Validation severity has `error` and `warning`; simulation blocks on errors.
- Automation parameter requirements are validated by non-empty values.

## What Was Completed

- Full drag/drop workflow builder UI layout
- Custom React Flow nodes for all required node types
- Type-safe dynamic configuration panel by node type
- Mock API for `GET /automations` and `POST /simulate` behavior
- Graph serialization and simulation execution log rendering
- Core validation rules (start/end rules, orphan checks, cycles, field requirements)
- Undo/redo + keyboard shortcuts (Delete, Escape, Ctrl/Cmd+Z/Y)
- Context menu on node right-click (Edit, Duplicate, Delete)
- Template loading for employee onboarding and leave approval flows
- Zoom/pan ergonomics and fit-to-screen action
- Dotted live connection preview + action toasts
- Edge arrows + 4-side node connection handles
- Multi-workflow library with save/load/delete
- Click edge to add/edit inline connection text
- Modular code organization for future growth

## Limitations

- No backend persistence (data is browser-local only)
- No role-based access controls
- Limited branching semantics in simulation (linearized topological execution)

## What I Would Add With More Time

- Persistent storage (local storage and backend sync)
- Advanced validator (branch conditions, unreachable-end analysis)
- Workflow versioning and template management UI
- Better simulation controls (pause/resume, branch outcomes)
- Unit/integration tests and schema-driven form generation
