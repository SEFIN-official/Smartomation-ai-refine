/**
 * Smartomation.ai Blog - Structured post data
 * Used by blog listing and detail pages. Keep in sync with blog/*.html files.
 */
const BLOG_POSTS = [
  {
    slug: 'how-to-scale-ai-automation',
    title: 'How to Scale AI Automation Across Teams',
    summary: 'Practical patterns for rolling out intelligent workflows beyond a single team—governance, tooling, and change management so automation scales with your organization.',
    date: '2026-02-12',
    dateFormatted: 'February 12, 2026',
    readTime: 6,
    image: 'images/blog/scale-ai-automation.jpg',
    imageAlt: 'Scaling AI automation across teams',
    metaTitle: 'How to Scale AI Automation Across Teams | Smartomation.ai',
    metaDescription: 'Roll out intelligent workflows across teams with governance, tooling, and change management. Enterprise-grade patterns for scaling AI automation.',
    imagePrompt: 'Abstract professional illustration: soft purple and blue gradient background, subtle network nodes and connecting lines suggesting teams and workflows, no text, no logos, clean modern SaaS style.'
  },
  {
    slug: 'from-workflows-to-agents',
    title: 'From Workflows to Agents: Designing Intelligent Systems',
    summary: 'When to use deterministic workflows versus agentic systems—and how to design the transition so reliability and control stay front and center.',
    date: '2026-02-10',
    dateFormatted: 'February 10, 2026',
    readTime: 7,
    image: 'images/blog/workflows-to-agents.jpg',
    imageAlt: 'From workflows to intelligent agents',
    metaTitle: 'From Workflows to Agents: Designing Intelligent Systems | Smartomation.ai',
    metaDescription: 'Design the shift from deterministic workflows to agentic systems while keeping reliability and control. Practical architecture guidance.',
    imagePrompt: 'Abstract diagram: flow from left (linear steps) to right (branching intelligent nodes), purple-to-violet gradient, soft glow, no text, professional.'
  },
  {
    slug: 'why-multi-agent-systems-outperform',
    title: 'Why Multi-Agent Systems Outperform Single AI Tools',
    summary: 'Multiple specialized agents often beat one generalist model. We break down when and how to orchestrate multi-agent systems for real-world automation.',
    date: '2026-02-08',
    dateFormatted: 'February 8, 2026',
    readTime: 6,
    image: 'images/blog/multi-agent-systems.jpg',
    imageAlt: 'Multi-agent AI systems',
    metaTitle: 'Why Multi-Agent Systems Outperform Single AI Tools | Smartomation.ai',
    metaDescription: 'When and how to use multi-agent systems for automation. Specialized agents, orchestration, and real-world outcomes.',
    imagePrompt: 'Abstract: several distinct glowing orbs or nodes connected by thin lines on dark purple gradient, suggesting multiple agents collaborating, no text.'
  },
  {
    slug: 'real-roi-ai-sales-automation',
    title: 'The Real ROI of AI-Powered Sales Automation',
    summary: 'Where AI actually moves the needle in sales ops—lead scoring, CRM hygiene, and follow-up automation—with measurable impact, not hype.',
    date: '2026-02-05',
    dateFormatted: 'February 5, 2026',
    readTime: 5,
    image: 'images/blog/ai-sales-automation.jpg',
    imageAlt: 'AI-powered sales automation',
    metaTitle: 'The Real ROI of AI-Powered Sales Automation | Smartomation.ai',
    metaDescription: 'Where AI delivers real ROI in sales: lead scoring, CRM updates, and follow-up. Measurable impact for revenue teams.',
    imagePrompt: 'Abstract: soft purple and teal gradient, upward trend or pipeline shape, minimal and professional, no text or logos.'
  },
  {
    slug: 'designing-ai-systems-guardrails-governance',
    title: 'Designing AI Systems with Guardrails and Governance',
    summary: 'How to build approval flows, content checks, and audit trails so AI automation stays safe and compliant in enterprise environments.',
    date: '2026-02-01',
    dateFormatted: 'February 1, 2026',
    readTime: 7,
    image: 'images/blog/ai-guardrails-governance.jpg',
    imageAlt: 'AI guardrails and governance',
    metaTitle: 'Designing AI Systems with Guardrails and Governance | Smartomation.ai',
    metaDescription: 'Build approval flows, content checks, and audit trails for safe, compliant AI automation in the enterprise.',
    imagePrompt: 'Abstract: shield or boundary motif with soft purple gradient, subtle grid or framework, professional, no text.'
  },
  {
    slug: 'automate-crm-updates-ai-agents',
    title: 'How to Automate CRM Updates Using AI Agents',
    summary: 'Keep your CRM accurate without manual data entry. Use AI agents to parse emails, calls, and meetings and push structured updates into Salesforce, HubSpot, or your CRM.',
    date: '2026-01-28',
    dateFormatted: 'January 28, 2026',
    readTime: 6,
    image: 'images/blog/crm-ai-agents.jpg',
    imageAlt: 'CRM automation with AI agents',
    metaTitle: 'How to Automate CRM Updates Using AI Agents | Smartomation.ai',
    metaDescription: 'Automate CRM updates with AI agents. Parse emails, calls, and meetings; push structured data to your CRM.',
    imagePrompt: 'Abstract: database or list shape with flowing lines, purple and blue gradient, clean SaaS style, no text.'
  },
  {
    slug: 'crewai-enterprise-orchestration',
    title: 'CrewAI in Enterprise Orchestration',
    summary: 'Using CrewAI to coordinate multiple AI agents for research, summarization, and task handoffs—architecture and best practices for production.',
    date: '2026-01-24',
    dateFormatted: 'January 24, 2026',
    readTime: 6,
    image: 'images/blog/crewai-orchestration.jpg',
    imageAlt: 'CrewAI enterprise orchestration',
    metaTitle: 'CrewAI in Enterprise Orchestration | Smartomation.ai',
    metaDescription: 'Coordinate multiple AI agents with CrewAI. Architecture and best practices for research, summarization, and task handoffs.',
    imagePrompt: 'Abstract: central hub with connected nodes, purple and indigo gradient, orchestration feel, no text or logos.'
  },
  {
    slug: 'claude-code-intelligent-workflow-reasoning',
    title: 'Claude Code for Intelligent Workflow Reasoning',
    summary: 'Where Claude Code fits in automation pipelines—code generation, data transformation, and reasoning steps that need to run reliably in production.',
    date: '2026-01-20',
    dateFormatted: 'January 20, 2026',
    readTime: 5,
    image: 'images/blog/claude-code-workflows.jpg',
    imageAlt: 'Claude Code in workflow reasoning',
    metaTitle: 'Claude Code for Intelligent Workflow Reasoning | Smartomation.ai',
    metaDescription: 'Use Claude Code in automation for code generation, data transformation, and reliable reasoning in production.',
    imagePrompt: 'Abstract: code or logic flow motif, purple gradient with soft glow, technical but clean, no text.'
  },
  {
    slug: 'building-knowledge-systems-notebooklm',
    title: 'Building Knowledge Systems with NotebookLM',
    summary: 'Turn internal docs, wikis, and PDFs into queryable knowledge bases. How we use NotebookLM and similar tools for RAG and internal search.',
    date: '2026-01-15',
    dateFormatted: 'January 15, 2026',
    readTime: 5,
    image: 'images/blog/notebooklm-knowledge.jpg',
    imageAlt: 'Knowledge systems with NotebookLM',
    metaTitle: 'Building Knowledge Systems with NotebookLM | Smartomation.ai',
    metaDescription: 'Build queryable knowledge from docs and PDFs with NotebookLM. RAG and internal search for enterprises.',
    imagePrompt: 'Abstract: layered documents or knowledge graph, soft purple and grey gradient, no text.'
  },
  {
    slug: 'postgresql-vs-mongodb-ai-architectures',
    title: 'PostgreSQL vs MongoDB in AI-Driven Architectures',
    summary: 'When to choose relational vs document stores for AI pipelines—structured outputs, embeddings, and operational workloads.',
    date: '2026-01-10',
    dateFormatted: 'January 10, 2026',
    readTime: 6,
    image: 'images/blog/postgres-mongodb-ai.jpg',
    imageAlt: 'PostgreSQL vs MongoDB for AI',
    metaTitle: 'PostgreSQL vs MongoDB in AI-Driven Architectures | Smartomation.ai',
    metaDescription: 'Choose the right data layer for AI: PostgreSQL vs MongoDB for structured data, embeddings, and scale.',
    imagePrompt: 'Abstract: two distinct data structures—tabular and document-like—on purple gradient, clean comparison feel, no text.'
  },
  {
    slug: 'automating-slack-notion-ai-agents',
    title: 'Automating Slack & Notion with AI Agents',
    summary: 'Connect Slack and Notion to AI agents for summaries, task creation, and search—so your team stays in flow without context switching.',
    date: '2026-01-05',
    dateFormatted: 'January 5, 2026',
    readTime: 5,
    image: 'images/blog/slack-notion-ai.jpg',
    imageAlt: 'Slack and Notion with AI agents',
    metaTitle: 'Automating Slack & Notion with AI Agents | Smartomation.ai',
    metaDescription: 'Connect Slack and Notion to AI agents for summaries, tasks, and search. Keep teams in flow.',
    imagePrompt: 'Abstract: chat bubbles and blocks, purple and blue gradient, collaboration feel, no logos or text.'
  },
  {
    slug: 'ai-google-workspace-beyond-basic',
    title: 'AI in Google Workspace: Beyond Basic Automation',
    summary: 'Move past simple triggers—use AI to draft in Gmail, structure in Sheets, and generate in Docs within your existing Google Workspace setup.',
    date: '2025-12-28',
    dateFormatted: 'December 28, 2025',
    readTime: 5,
    image: 'images/blog/google-workspace-ai.jpg',
    imageAlt: 'AI in Google Workspace',
    metaTitle: 'AI in Google Workspace: Beyond Basic Automation | Smartomation.ai',
    metaDescription: 'Use AI in Gmail, Sheets, and Docs for drafting, structuring, and generating—within Google Workspace.',
    imagePrompt: 'Abstract: documents and sheets motif, soft purple and white gradient, productivity feel, no text or logos.'
  },
  {
    slug: 'automation-spectrum-deterministic-to-agentic',
    title: 'The Automation Spectrum: Deterministic to Agentic Systems',
    summary: 'From fixed rules to adaptive agents—a clear framework for choosing the right level of automation for each use case.',
    date: '2025-12-20',
    dateFormatted: 'December 20, 2025',
    readTime: 6,
    image: 'images/blog/automation-spectrum.jpg',
    imageAlt: 'Automation spectrum from deterministic to agentic',
    metaTitle: 'The Automation Spectrum: Deterministic to Agentic | Smartomation.ai',
    metaDescription: 'Choose the right automation: from fixed rules to adaptive agents. A practical framework for each use case.',
    imagePrompt: 'Abstract: gradient bar or spectrum from ordered to fluid, purple tones, no text.'
  },
  {
    slug: 'why-most-ai-demos-fail-in-production',
    title: 'Why Most AI Demos Fail in Production',
    summary: 'Common gaps between demo and production—latency, cost, edge cases, and governance. How to design and test for real deployment.',
    date: '2025-12-15',
    dateFormatted: 'December 15, 2025',
    readTime: 6,
    image: 'images/blog/ai-demos-production.jpg',
    imageAlt: 'AI demos vs production',
    metaTitle: 'Why Most AI Demos Fail in Production | Smartomation.ai',
    metaDescription: 'Bridge the gap between AI demos and production. Latency, cost, edge cases, and governance.',
    imagePrompt: 'Abstract: split or bridge motif, one side bright one side stable, purple gradient, no text.'
  },
  {
    slug: 'designing-reliable-ai-infrastructure',
    title: 'Designing Reliable AI Infrastructure for Enterprises',
    summary: 'Observability, fallbacks, and scaling patterns so your AI automation stays up when it matters—without overbuilding.',
    date: '2025-12-10',
    dateFormatted: 'December 10, 2025',
    readTime: 7,
    image: 'images/blog/reliable-ai-infrastructure.jpg',
    imageAlt: 'Reliable AI infrastructure',
    metaTitle: 'Designing Reliable AI Infrastructure for Enterprises | Smartomation.ai',
    metaDescription: 'Observability, fallbacks, and scaling for enterprise AI. Reliable automation without overbuilding.',
    imagePrompt: 'Abstract: robust infrastructure or scaffold, purple and dark blue gradient, solid and professional, no text.'
  }
];

// Sort by date descending (newest first)
BLOG_POSTS.sort((a, b) => new Date(b.date) - new Date(a.date));
