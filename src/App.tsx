import { useEffect, useRef, useState } from 'react'
import './App.css'
import AICore, { type CoreActivity } from './components/AICore'

type TicketStatus = 'Open' | 'In Progress' | 'Resolved'
type TicketActivity = {
  status: TicketStatus
  timestamp: string
  note: string
}
type TicketPriority = 'Low' | 'Medium' | 'High' | 'Critical'
type Ticket = {
  id: string
  title: string
  description: string
  category: string
  priority: TicketPriority
  status: TicketStatus
  createdAt: string
  history?: TicketActivity[]
  assignedTo: string
}
type Message = { sender: 'ai' | 'user'; text: string }
const technicians = [
  'Unassigned',
  'Rahul Patil',
  'Priya Deshmukh',
  'Amit Shah',
]
const STORAGE_KEY = 'resolveiq-tickets'
const initialMessages: Message[] = [{
  sender: 'ai',
  text: "Hi! I'm ResolveIQ, your IT support assistant. 👋\n\nTell me what's going wrong, and I'll help you troubleshoot it.",
}]

function loadTickets(): Ticket[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)

    if (!saved) return []

    const parsed = JSON.parse(saved) as Ticket[]

    return parsed.map((ticket) => ({
  ...ticket,
  assignedTo: ticket.assignedTo ?? 'Unassigned',
  history: Array.isArray(ticket.history)
    ? ticket.history
    : [
        {
          status: ticket.status,
          timestamp: ticket.createdAt,
          note: 'Ticket history started',
        },
      ],
}))
  } catch {
    return []
  }
}

function categorizeIssue(issue: string): string {
  const text = issue.toLowerCase()

  if (
    ['wifi', 'wi-fi', 'network', 'vpn', 'internet', 'router', 'connection'].some(
      (word) => text.includes(word)
    )
  ) {
    return 'Network & VPN'
  }

  if (
    ['password', 'login', 'log in', 'account', 'sign in', 'locked out', 'access denied'].some(
      (word) => text.includes(word)
    )
  ) {
    return 'Account & Access'
  }

  if (
    ['printer', 'printing', 'print', 'keyboard', 'mouse', 'monitor', 'laptop', 'computer', 'hardware'].some(
      (word) => text.includes(word)
    )
  ) {
    return 'Hardware & Printer'
  }

  if (
    ['slow', 'lag', 'freeze', 'frozen', 'hang', 'overheating', 'battery'].some(
      (word) => text.includes(word)
    )
  ) {
    return 'Device Performance'
  }

  return 'Software & Applications'
}


function getITResponse(issue: string): string {
  const text = issue.toLowerCase()
  if (['wifi', 'wi-fi', 'network', 'vpn', 'internet'].some((word) => text.includes(word))) {
    return 'Network troubleshooting\n\n1. Check whether Wi-Fi or your network cable is connected.\n2. Disconnect and reconnect to the network.\n3. If you use a VPN, disconnect and reconnect to it.\n4. Try opening an approved internal website again.\n\nIf the issue continues, create an IT support ticket. Never share your password.'
  }
  if (['password', 'login', 'log in', 'account', 'sign in'].some((word) => text.includes(word))) {
    return 'Account access troubleshooting\n\n1. Check that your username is correct.\n2. Check whether Caps Lock is enabled.\n3. Use your organization’s official password-reset process if needed.\n4. If your account is locked, contact your IT administrator.\n\nNever share your password or verification codes in this chat.'
  }
  if (['slow', 'lag', 'freeze', 'frozen', 'hang'].some((word) => text.includes(word))) {
    return 'Slow computer troubleshooting\n\n1. Close applications you are not using.\n2. Check whether too many applications are running.\n3. Save your work and restart the computer if possible.\n4. Check whether the problem occurs in one application or all applications.\n\nIf the computer remains slow, create a support ticket with the details.'
  }
  if (['printer', 'printing', 'print'].some((word) => text.includes(word))) {
    return 'Printer troubleshooting\n\n1. Check that the printer is powered on.\n2. Check paper, ink or toner, and any error lights.\n3. Confirm that your computer is connected to the correct printer.\n4. Check whether the print queue contains a stuck job.\n\nIf it still does not work, report the printer name and error message to IT.'
  }
  if (['software', 'application', 'app', 'install', 'error'].some((word) => text.includes(word))) {
    return 'Software troubleshooting\n\n1. Note the exact error message.\n2. Close and reopen the affected application.\n3. Check whether an approved update is available.\n4. If administrator permission is required, contact IT support.\n\nDo not install unapproved software on a company device.'
  }
  return 'Let’s investigate your IT issue.\n\n1. Tell me which device or application is affected.\n2. Describe what you were trying to do.\n3. Share the exact error message, if one appears.\n4. Mention when the problem started.\n\nPlease do not share passwords, verification codes, or confidential company information.'
}

function suggestPriority(issue: string): TicketPriority {
  const text = issue.toLowerCase()

  // Critical: major outage or serious security incident
  if (
    [
      'entire office',
      'whole office',
      'everyone',
      'all employees',
      'company-wide',
      'company wide',
      'network down',
      'system down',
      'server down',
      'data breach',
      'ransomware',
      'security breach',
    ].some((word) => text.includes(word))
  ) {
    return 'Critical'
  }

  // High: urgent work blockage or widespread disruption
  if (
    [
      'urgent',
      'business stopped',
      'cannot work',
      "can't work",
      'multiple employees',
      'many employees',
      'locked out',
      'account compromised',
    ].some((word) => text.includes(word))
  ) {
    return 'High'
  }

  // Low: minor inconvenience
  if (
    [
      'slow laptop',
      'minor issue',
      'small issue',
      'cosmetic',
      'when convenient',
    ].some((word) => text.includes(word))
  ) {
    return 'Low'
  }

  // Default priority
  return 'Medium'
}


function App() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [lastIssue, setLastIssue] = useState('')
  const [lastResponse, setLastResponse] = useState('')
  const [activePage, setActivePage] = useState('Dashboard')
  const [tickets, setTickets] = useState<Ticket[]>(loadTickets)
  const [ticketSearch, setTicketSearch] = useState('')
const [statusFilter, setStatusFilter] = useState('All')
const [priorityFilter, setPriorityFilter] = useState('All')
  const [isTicketFormOpen, setIsTicketFormOpen] = useState(false)
  const [ticketTitle, setTicketTitle] = useState('')
  const [ticketDescription, setTicketDescription] = useState('')
  const [ticketCategory, setTicketCategory] = useState('Network & VPN')
  const [ticketPriority, setTicketPriority] = useState<TicketPriority>('Medium')
  const [coreActivity, setCoreActivity] = useState<CoreActivity>('idle')
  const chatAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
    })
  }, [activePage])
  
function openTicketFromIssue(issue: string, response: string) {
  const priority = suggestPriority(issue)

  setTicketTitle(issue.trim())
  setTicketDescription(
    `Reported issue:\n${issue.trim()}\n\nTroubleshooting guidance:\n${response}`,
  )
  setTicketPriority(priority)
  setTicketCategory(
    /password|login|account|sign in/i.test(issue)
      ? 'Account & Access'
      : /printer|printing/i.test(issue)
        ? 'Hardware'
        : /software|application|install|error/i.test(issue)
          ? 'Software'
          : 'Network & VPN',
  )
  setIsTicketFormOpen(true)
  setActivePage('Tickets')
}

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets))
  }, [tickets])

  useEffect(() => {
  const chatArea = chatAreaRef.current

  if (!chatArea) return

  requestAnimationFrame(() => {
    chatArea.scrollTo({
      top: chatArea.scrollHeight,
      behavior: 'smooth',
    })
  })
}, [messages])
const filteredTickets = tickets.filter((ticket) => {
  const query = ticketSearch.trim().toLowerCase()

  const matchesSearch =
    ticket.title.toLowerCase().includes(query) ||
    ticket.id.toLowerCase().includes(query) ||
    ticket.description.toLowerCase().includes(query) ||
    ticket.category.toLowerCase().includes(query)

  const matchesStatus =
    statusFilter === 'All' || ticket.status === statusFilter

  const matchesPriority =
    priorityFilter === 'All' || ticket.priority === priorityFilter

  return matchesSearch && matchesStatus && matchesPriority
})
  const openTicketCount = tickets.filter(
  (ticket) => ticket.status !== 'Resolved'
).length

const resolvedTicketCount = tickets.filter(
  (ticket) => ticket.status === 'Resolved'
).length

const highPriorityTicketCount = tickets.filter(
  (ticket) =>
    ticket.priority === 'High' || ticket.priority === 'Critical'
).length

const resolutionRate =
  tickets.length === 0
    ? 0
    : Math.round((resolvedTicketCount / tickets.length) * 100)
  function sendMessage(text: string) {
    const issue = text.trim()
    if (!issue) return
    const reply = getITResponse(issue)
    setLastIssue(issue)
    setLastResponse(reply)
    setMessages((previous) => [...previous, { sender: 'user', text: issue }, { sender: 'ai', text: reply }])
    setInput('')
    setActivePage('AI Assistant')
    setCoreActivity('thinking')
    window.setTimeout(() => setCoreActivity('idle'), 700)
  }

  function openPage(page: string) {
    setActivePage(page)
    if (page === 'AI Assistant') setCoreActivity('idle')
  }

  function openNewTicket(prefillFromConversation = false) {
    if (prefillFromConversation && lastIssue) {
      setTicketTitle(lastIssue.length > 70 ? `${lastIssue.slice(0, 67)}...` : lastIssue)
      setTicketDescription(`Reported issue:\n${lastIssue}\n\nTroubleshooting guidance provided:\n${lastResponse}`)
      setTicketCategory(categorizeIssue(lastIssue))
    } else {
      setTicketTitle('')
      setTicketDescription('')
      setTicketCategory('Network & VPN')
    }
    setTicketPriority('Medium')
    setIsTicketFormOpen(true)
  }

  function submitTicket(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!ticketTitle.trim() || !ticketDescription.trim()) return
    const now = new Date().toLocaleString()

const ticket: Ticket = {
  id: `RIQ-${Date.now().toString().slice(-6)}`,
  title: ticketTitle.trim(),
  description: ticketDescription.trim(),
  category: ticketCategory,
  priority: ticketPriority,
  status: 'Open',
  createdAt: now,
  assignedTo: 'Unassigned',
  history: [
    {
      status: 'Open',
      timestamp: now,
      note: 'Ticket created',
    },
  ],
}
    setTickets((previous) => [ticket, ...previous])
    setIsTicketFormOpen(false)
    setActivePage('Tickets')
    setCoreActivity('success')
    window.setTimeout(() => setCoreActivity('idle'), 1000)
  }

  function updateTicketStatus(id: string, status: TicketStatus) {
  setTickets((previous) =>
    previous.map((ticket) => {
      if (ticket.id !== id) return ticket

      // Avoid recording duplicate status changes.
      if (ticket.status === status) return ticket

      const now = new Date().toLocaleString()

      return {
        ...ticket,
        status,
        history: [
          ...(ticket.history ?? []),
          {
            status,
            timestamp: now,
            note: `Status changed to ${status}`,
          },
        ],
      }
    })
  )
}

function updateTicketAssignee(id: string, assignedTo: string) {
  setTickets((previous) =>
    previous.map((ticket) => {
      if (ticket.id !== id || ticket.assignedTo === assignedTo) {
        return ticket
      }

      const now = new Date().toLocaleString()

      return {
        ...ticket,
        assignedTo,
        history: [
          ...(ticket.history ?? []),
          {
            status: ticket.status,
            timestamp: now,
            note:
              assignedTo === 'Unassigned'
                ? 'Ticket unassigned'
                : `Assigned to ${assignedTo}`,
          },
        ],
      }
    }),
  )
}

  return (
    <div className="app-shell">
      <div className="floating-core-background" aria-hidden="true">
  <AICore activity={coreActivity} />
</div>
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">R</div>
          <div><h2>ResolveIQ</h2><span>INTELLIGENT IT SUPPORT</span></div>
        </div>
        <div className="nav-label">WORKSPACE</div>
        <nav className="navigation">
          {[
            { name: 'Dashboard', icon: '▦' },
            { name: 'AI Assistant', icon: '✧' },
            { name: 'Tickets', icon: '▤' },
            { name: 'Knowledge Base', icon: '◫' },
          ].map((item) => (
            <button key={item.name} className={`nav-item ${activePage === item.name ? 'active' : ''}`} onClick={() => openPage(item.name)}>
              <span className="nav-icon">{item.icon}</span>{item.name}
              {item.name === 'Tickets' && <span className="nav-count">{tickets.length}</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="online-card"><span className="status-dot" /><div><strong>Support system</strong><p>Prototype online</p></div></div>
          <div className="profile"><div className="avatar">TH</div><div className="profile-info"><strong>Workspace user</strong><span>IT support</span></div></div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar"><div><span className="topbar-label">WORKSPACE / {activePage.toUpperCase()}</span><p>ResolveIQ AI support workspace</p></div><div className="topbar-right"><span className="status-dot" /> Prototype mode</div></header>
        <div className="page-content">
          <section className="welcome-section">
            <div><div className="eyebrow">YOUR IT OPERATIONS HUB</div><h1>{activePage === 'Dashboard' ? 'Good evening 👋' : activePage}</h1><p>{activePage === 'Dashboard' ? 'Resolve technical issues faster with intelligent support.' : `Explore your ${activePage.toLowerCase()} workspace.`}</p></div>
            <button className="primary-button" onClick={() => openNewTicket()}><span>＋</span> Create ticket</button>
          </section>

          
{activePage === 'Knowledge Base' ? (
  <KnowledgeBasePage sendMessage={sendMessage} />
) : activePage === 'Tickets' ? (
           <section className="panel tickets-panel">
  <div className="section-heading">
    <h2>Support tickets</h2>
    <span>{filteredTickets.length} of {tickets.length} tickets</span>
  </div>

  <div className="ticket-filters">
    <input
      type="search"
      className="ticket-search"
      placeholder="Search by title, ID, category..."
      value={ticketSearch}
      onChange={(event) => setTicketSearch(event.target.value)}
      aria-label="Search tickets"
    />

    <select
      value={statusFilter}
      onChange={(event) => setStatusFilter(event.target.value)}
      aria-label="Filter by status"
    >
      <option value="All">All statuses</option>
      <option value="Open">Open</option>
      <option value="In Progress">In Progress</option>
      <option value="Resolved">Resolved</option>
    </select>

    <select
      value={priorityFilter}
      onChange={(event) => setPriorityFilter(event.target.value)}
      aria-label="Filter by priority"
    >
      <option value="All">All priorities</option>
      <option value="Critical">Critical</option>
      <option value="High">High</option>
      <option value="Medium">Medium</option>
      <option value="Low">Low</option>
    </select>
  </div>
           {tickets.length === 0 ? (
  <p>No tickets yet. Create your first support ticket.</p>
) : filteredTickets.length === 0 ? (
  <p>No matching tickets. Try changing your search or filters.</p>
) : (
                <div className="ticket-list">
                  
{filteredTickets.map((ticket) => (
  <article className="ticket-item" key={ticket.id}>
    <div className="ticket-title-row">
      <div className="ticket-heading">
        <span className="ticket-id-label">IT SUPPORT TICKET</span>
        <h3>{ticket.title}</h3>
        <span className="ticket-id">{ticket.id}</span>
      </div>

      <span
        className={`ticket-status status-${ticket.status
          .toLowerCase()
          .replace(' ', '-')}`}
      >
        {ticket.status}
      </span>
    </div>

    <div className="ticket-meta">
      <div className="ticket-meta-item">
        <span>Category</span>
        <strong>{ticket.category}</strong>
      </div>

      <div className="ticket-meta-item">
        <span>Priority</span>
        <strong className={`priority-${ticket.priority.toLowerCase()}`}>
          {ticket.priority}
        </strong>
      </div>

      <div className="ticket-meta-item">
        <span>Created</span>
        <strong>{ticket.createdAt}</strong>
      </div>
    </div>
        <div className="ticket-assignment">
      <label htmlFor={`technician-${ticket.id}`}>
        Assigned Technician
      </label>

      <select
        id={`technician-${ticket.id}`}
        value={ticket.assignedTo ?? 'Unassigned'}
        onChange={(event) =>
          updateTicketAssignee(ticket.id, event.target.value)
        }
      >
        {technicians.map((technician) => (
          <option key={technician} value={technician}>
            {technician}
          </option>
        ))}
      </select>
    </div>
    <div className="ticket-description-box">
      <span>Description</span>
      <p className="ticket-description">{ticket.description}</p>
    </div>
<div className="ticket-history">
  <h4>Activity history</h4>

  <div className="ticket-timeline">
    {(ticket.history ?? []).map((activity, index) => (
      <div
        className="timeline-entry"
        key={`${ticket.id}-${index}`}
      >
        <span className="timeline-dot" />

        <div className="timeline-content">
          <strong>{activity.note}</strong>
          <span>{activity.timestamp}</span>
          <small>Status: {activity.status}</small>
        </div>
      </div>
    ))}
  </div>
</div>
    <div className="ticket-footer">
      <label className="ticket-status-label">
        Update status
        <select
          value={ticket.status}
          onChange={(event) =>
            updateTicketStatus(
              ticket.id,
              event.target.value as TicketStatus
            )
          }
        >
          <option>Open</option>
          <option>In Progress</option>
          <option>Resolved</option>
        </select>
        <button
  type="button"
  className="resolve-ticket-btn"
  onClick={() => updateTicketStatus(ticket.id, 'Resolved')}
  disabled={ticket.status === 'Resolved'}
>
  {ticket.status === 'Resolved' ? (
    <>
      <span>✓</span> Resolved
    </>
  ) : (
    <>
      <span>✓</span> Resolve Ticket
    </>
  )}
</button>
      </label>
    </div>
  </article>
))}

                </div>
              )}
            </section>
          ) : (
            <>
              {activePage === 'Dashboard' && (
                <section className="stats-grid">
                  <div className="stat-card"><div className="stat-top"><span>My tickets</span><span className="stat-icon purple">▤</span></div><div className="stat-number">{tickets.length}</div><div className="stat-foot">Saved in this browser</div></div>
                  <div className="stat-card"><div className="stat-top"><span>Open tickets</span><span className="stat-icon orange">◷</span></div><div className="stat-number">{openTicketCount}</div><div className="stat-foot">Not yet resolved</div></div>
                  <div className="stat-card">
  <div className="stat-top">
    <span>Resolved tickets</span>
    <span className="stat-icon green">✓</span>
  </div>
  <div className="stat-number">{resolvedTicketCount}</div>
  <div className="stat-foot">
    {resolutionRate}% resolution rate
  </div>
</div>
                  <div className="stat-card">
  <div className="stat-top">
    <span>High-priority incidents</span>
    <span className="stat-icon orange">!</span>
  </div>
  <div className="stat-number">{highPriorityTicketCount}</div>
  <div className="stat-foot">
    High or Critical priority
  </div>
</div>                </section>
              )}

              <section className="workspace-grid">
                <div className="panel assistant-panel">
                  <div className="panel-heading"><div className="heading-icon">✧</div><div><h2>ResolveIQ Assistant</h2><p>Your IT support companion</p></div><span className="beta-badge">PREVIEW</span></div>
                  <div className="chat-area" ref={chatAreaRef}>
                    {messages.map((message, index) => <div key={index} className={`message-row ${message.sender === 'user' ? 'user-row' : ''}`}>{message.sender === 'ai' && <div className="message-avatar">R</div>}<div className={`message-bubble ${message.sender === 'user' ? 'user-bubble' : 'ai-bubble'}`}>{message.text}</div></div>)}
                  </div>
                 
{lastIssue && (
  <div style={{ padding: '0 20px 16px' }}>
    <button
      className="primary-button"
      type="button"
      onClick={() => openTicketFromIssue(lastIssue, lastResponse)}
    >
      ＋ Create ticket from this conversation
    </button>
  </div>
)}

                  <div className="suggestions"><span>QUICK START</span><div className="suggestion-list"><button onClick={() => sendMessage('My VPN is not connecting')}><span>⌁</span> VPN issue</button><button onClick={() => sendMessage('I cannot access my account')}><span>♙</span> Login problem</button><button onClick={() => sendMessage('My laptop is running slowly')}><span>◴</span> Slow computer</button></div></div>
                  <form className="chat-input-area" onSubmit={(event) => { event.preventDefault(); sendMessage(input) }}><input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Describe your IT issue..." aria-label="Describe your IT issue" /><button type="submit" aria-label="Send message">↑</button></form>
                  <div className="input-note">Prototype mode · Responses are simulated, not live AI</div>
                </div>
                <div className="right-column">
                 
                  <div className="panel quick-actions-panel"><div className="section-heading"><h2>Quick actions</h2><span>•••</span></div><p className="section-subtitle">Get help with common tasks</p>
                    <button className="action-item" onClick={() => sendMessage('Help me troubleshoot my network connection')}><span className="action-icon purple">⌁</span><span><strong>Network &amp; VPN</strong><small>Connection and access issues</small></span><span className="arrow">›</span></button>
                    <button className="action-item" onClick={() => sendMessage('Help me with my account access and password')}><span className="action-icon blue">♙</span><span><strong>Account &amp; access</strong><small>Login and permission issues</small></span><span className="arrow">›</span></button>
                    <button className="action-item" onClick={() => sendMessage('Help me troubleshoot a software issue')}><span className="action-icon orange">▣</span><span><strong>Software support</strong><small>Apps and installation issues</small></span><span className="arrow">›</span></button>
                    <button className="view-all" onClick={() => openPage('Knowledge Base')}>Explore knowledge base <span>→</span></button>
                  </div>
                 


                </div>
              </section>
            </>
          )}

          <footer className="page-footer"><span>ResolveIQ AI · Hackathon prototype</span><span>Real AI and backend integrations pending</span></footer>
        </div>
      </main>

      {isTicketFormOpen && (
        <div className="modal-backdrop" role="presentation">
          <form className="ticket-form panel" onSubmit={submitTicket} role="dialog" aria-modal="true" aria-labelledby="ticket-form-title">
            <div className="section-heading"><h2 id="ticket-form-title">Create support ticket</h2><button type="button" className="modal-close" onClick={() => setIsTicketFormOpen(false)} aria-label="Close">×</button></div>
            <label>Issue title<input value={ticketTitle} onChange={(event) => setTicketTitle(event.target.value)} required placeholder="Briefly describe the issue" /></label>
            <label>Description<textarea value={ticketDescription} onChange={(event) => setTicketDescription(event.target.value)} required rows={5} placeholder="Add issue details and troubleshooting steps" /></label>
            <label>Category<select value={ticketCategory} onChange={(event) => setTicketCategory(event.target.value)}><option>Network &amp; VPN</option><option>Account &amp; Access</option><option>Hardware &amp; Printer</option><option>Device Performance</option><option>Software &amp; Applications</option></select></label>
            <label>Priority<select value={ticketPriority} onChange={(event) => setTicketPriority(event.target.value as TicketPriority)}><option>Low</option><option>Medium</option><option>High</option><option>Critical</option></select></label>
            <div className="ticket-form-actions"><button type="button" className="secondary-button" onClick={() => setIsTicketFormOpen(false)}>Cancel</button><button type="submit" className="primary-button">Submit ticket</button></div>
          </form>
        </div>
      )}
    </div>
  )
}

type KnowledgeBasePageProps = {
  sendMessage: (message: string) => void;
};

function KnowledgeBasePage({ sendMessage }: KnowledgeBasePageProps) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [expanded, setExpanded] = useState<string | null>(null);

  const articles = [
    {
      id: 'network',
      title: 'Network & VPN',
      category: 'Network',
      summary: 'Troubleshoot Wi-Fi and VPN connection problems.',
      steps: [
        'Check that Wi-Fi is enabled and airplane mode is off.',
        'Reconnect to your approved Wi-Fi network.',
        'If your organization uses a VPN, disconnect and reconnect using its approved app.',
        'If the issue continues, contact IT support.'
      ],
      prompt: 'My Wi-Fi or VPN is not connecting'
    },
    {
      id: 'account',
      title: 'Account & access',
      category: 'Account',
      summary: 'Resolve common sign-in and account access problems.',
      steps: [
        'Check your username and make sure Caps Lock is off.',
        'Check your internet connection and try signing in again.',
        'Use your organization’s official password reset process if needed.',
        'Never share your password or verification codes with anyone.'
      ],
      prompt: 'I cannot access my account'
    },
    {
      id: 'performance',
      title: 'Slow computer',
      category: 'Hardware',
      summary: 'Improve performance when your computer is running slowly.',
      steps: [
        'Save your work and close applications you are not using.',
        'Check whether an application is frozen or using excessive resources.',
        'Restart your computer if it is safe to do so.',
        'If the issue continues, contact IT support.'
      ],
      prompt: 'My laptop is running slowly'
    },
    {
      id: 'software',
      title: 'Software & applications',
      category: 'Software',
      summary: 'Try basic fixes for applications that crash or fail to open.',
      steps: [
        'Close the application and open it again.',
        'Save your work before restarting your computer.',
        'Check whether an approved update is available.',
        'If the problem persists, record the error message and contact IT.'
      ],
      prompt: 'My software application is crashing or not opening'
    }
  ];

  const categories = ['All', 'Network', 'Account', 'Hardware', 'Software'];

  const filteredArticles = articles.filter((article) => {
    const matchesCategory =
      category === 'All' || article.category === category;

    const query = search.trim().toLowerCase();
    const matchesSearch =
      !query ||
      article.title.toLowerCase().includes(query) ||
      article.summary.toLowerCase().includes(query) ||
      article.category.toLowerCase().includes(query) ||
      article.steps.some((step) => step.toLowerCase().includes(query));

    return matchesCategory && matchesSearch;
  });

  return (
    <section className="panel knowledge-page">
      <div className="knowledge-header">
        <span className="incident-label">RESOLVEIQ RESOURCES</span>
        <h2>Knowledge Base</h2>
        <p>Search practical guides to common workplace IT problems.</p>
      </div>

      <input
        className="knowledge-search"
        type="search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search Wi-Fi, password, software..."
        aria-label="Search troubleshooting articles"
      />

      <div className="knowledge-categories">
        {categories.map((item) => (
          <button
            key={item}
            type="button"
            className={category === item ? 'knowledge-category active' : 'knowledge-category'}
            onClick={() => setCategory(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="knowledge-articles">
        {filteredArticles.length === 0 ? (
          <p>No matching articles. Try another search term or category.</p>
        ) : (
          filteredArticles.map((article) => (
            <article className="ticket-item knowledge-article" key={article.id}>
              <span className="incident-label">{article.category}</span>
              <h3>{article.title}</h3>
              <p>{article.summary}</p>

              <button
                type="button"
                className="secondary-button"
                onClick={() =>
                  setExpanded(expanded === article.id ? null : article.id)
                }
              >
                {expanded === article.id ? 'Hide steps −' : 'View steps +'}
              </button>

              {expanded === article.id && (
                <div className="knowledge-steps">
                  <h4>Recommended steps</h4>
                  <ol>
                    {article.steps.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ol>

                  <button
                    type="button"
                    className="primary-button"
                    onClick={() => sendMessage(article.prompt)}
                  >
                    Ask AI Assistant about this
                  </button>
                </div>
              )}
            </article>
          ))
        )}
      </div>
    </section>
  );
}

export default App
