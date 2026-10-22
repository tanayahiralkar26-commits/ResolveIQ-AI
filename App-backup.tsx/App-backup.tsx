
import { useEffect, useRef, useState } from 'react'
import './App.css'
import AICore, { type CoreActivity } from './components/AICore'

type Message = {
  sender: 'ai' | 'user'
  text: string
}

const initialMessages: Message[] = [
  {
    sender: 'ai',
    text: "Hi! I'm ResolveIQ, your IT support assistant. 👋\n\nTell me what's going wrong, and I'll help you troubleshoot it.",
  },
]

function App() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [activePage, setActivePage] = useState('Dashboard')
  const [ticketCount, setTicketCount] = useState(3)
  const [coreActivity, setCoreActivity] = useState<CoreActivity>('idle')
  const chatAreaRef = useRef<HTMLDivElement>(null)

useEffect(() => {
  chatAreaRef.current?.scrollTo({
    top: chatAreaRef.current.scrollHeight,
    behavior: 'smooth',
  })
}, [messages])

  
function getITResponse(issue: string): string {
  const text = issue.toLowerCase();

  if (
    text.includes("wifi") ||
    text.includes("wi-fi") ||
    text.includes("network") ||
    text.includes("vpn") ||
    text.includes("internet")
  ) {
    return "Network troubleshooting\n\n1. Check whether Wi-Fi or your network cable is connected.\n2. Disconnect and reconnect to the network.\n3. If you use a VPN, disconnect and reconnect to it.\n4. Try opening an approved internal website again.\n\nIf the issue continues, create an IT support ticket. Never share your password.";
  }

  if (
    text.includes("password") ||
    text.includes("login") ||
    text.includes("log in") ||
    text.includes("account") ||
    text.includes("sign in")
  ) {
    return "Account access troubleshooting\n\n1. Check that your username is correct.\n2. Check whether Caps Lock is enabled.\n3. Use your organization's official password-reset process if needed.\n4. If your account is locked, contact your IT administrator.\n\nNever share your password or verification codes in this chat.";
  }

  if (
    text.includes("slow") ||
    text.includes("lag") ||
    text.includes("freeze") ||
    text.includes("frozen") ||
    text.includes("hang")
  ) {
    return "Slow computer troubleshooting\n\n1. Close applications you are not using.\n2. Check whether too many applications are running.\n3. Save your work and restart the computer if possible.\n4. Check whether the problem occurs in one application or all applications.\n\nIf the computer remains slow, create a support ticket with the details.";
  }

  if (
    text.includes("software") ||
    text.includes("application") ||
    text.includes("app") ||
    text.includes("install") ||
    text.includes("error")
  ) {
    return "Software troubleshooting\n\n1. Note the exact error message.\n2. Close and reopen the affected application.\n3. Check whether an approved update is available.\n4. If installation or administrator permission is required, contact IT support.\n\nDo not install unapproved software on a company device.";
  }

  if (
    text.includes("printer") ||
    text.includes("printing") ||
    text.includes("print")
  ) {
    return "Printer troubleshooting\n\n1. Check that the printer is powered on.\n2. Check paper, ink or toner, and any error lights.\n3. Confirm that your computer is connected to the correct printer.\n4. Check whether the print queue contains a stuck job.\n\nIf it still does not work, report the printer name and error message to IT.";
  }

  return "Let's investigate your IT issue.\n\n1. Tell me which device or application is affected.\n2. Describe what you were trying to do.\n3. Share the exact error message, if one appears.\n4. Mention when the problem started.\n\nPlease do not share passwords, verification codes, or confidential company information.";
}

function sendMessage(text: string) {
  if (!text.trim()) return;

  const reply = getITResponse(text);

  setMessages((previous) => [
    ...previous,
    { sender: "user", text },
    { sender: "ai", text: reply },
  ]);

  setInput("");
  setActivePage("AI Assistant");
}


  function createTicket() {
    setTicketCount((count) => count + 1)
    setCoreActivity('success')
    setActivePage('Tickets')
  }

  function openPage(page: string) {
    setActivePage(page)
    setCoreActivity('idle')
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">R</div>
          <div>
            <h2>ResolveIQ</h2>
            <span>INTELLIGENT IT SUPPORT</span>
          </div>
        </div>

        <div className="nav-label">WORKSPACE</div>

        <nav className="navigation">
          {[
            { name: 'Dashboard', icon: '▦' },
            { name: 'AI Assistant', icon: '✧' },
            { name: 'Tickets', icon: '▤' },
            { name: 'Knowledge Base', icon: '◫' },
          ].map((item) => (
            <button
              key={item.name}
              className={`nav-item ${activePage === item.name ? 'active' : ''}`}
              onClick={() => openPage(item.name)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.name}
              {item.name === 'Tickets' && (
                <span className="nav-count">{ticketCount}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="online-card">
            <span className="status-dot" />
            <div>
              <strong>Support system</strong>
              <p>Interface prototype</p>
            </div>
          </div>

          <div className="profile">
            <div className="avatar">TH</div>
            <div className="profile-info">
              <strong>Demo Employee</strong>
              <span>Employee account</span>
            </div>
            <span className="profile-menu">···</span>
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb">
            Workspace <span>/</span> <strong>{activePage}</strong>
          </div>

          <div className="topbar-right">
            <span className="environment">
              <span className="status-dot" /> DEMO ENVIRONMENT
            </span>
            <button
              className="icon-button"
              aria-label="Notifications"
              title="Notifications"
            >
              ♧
            </button>
          </div>
        </header>

        <div className="page-content">
          <section className="welcome-section">
            <div>
              <div className="eyebrow">YOUR IT OPERATIONS HUB</div>
              <h1>
                {activePage === 'Dashboard'
                  ? 'Good evening 👋'
                  : activePage}
              </h1>
              <p>
                {activePage === 'Dashboard'
                  ? 'Resolve technical issues faster with intelligent support.'
                  : `Explore your ${activePage.toLowerCase()} workspace.`}
              </p>
            </div>

            <button className="primary-button" onClick={createTicket}>
              <span>＋</span> Create demo ticket
            </button>
          </section>

          <section className="stats-grid">
            <div className="stat-card">
              <div className="stat-top">
                <span>My tickets</span>
                <span className="stat-icon purple">▤</span>
              </div>
              <div className="stat-number">{ticketCount}</div>
              <div className="stat-foot">Demo counter · not saved</div>
            </div>

            <div className="stat-card">
              <div className="stat-top">
                <span>Open tickets</span>
                <span className="stat-icon orange">◷</span>
              </div>
              <div className="stat-number">2</div>
              <div className="stat-foot">Sample dashboard data</div>
            </div>

            <div className="stat-card">
              <div className="stat-top">
                <span>Resolved today</span>
                <span className="stat-icon green">✓</span>
              </div>
              <div className="stat-number">8</div>
              <div className="stat-foot">Sample dashboard data</div>
            </div>

            <div className="stat-card">
              <div className="stat-top">
                <span>AI availability</span>
                <span className="stat-icon blue">✧</span>
              </div>
              <div className="stat-number">Demo</div>
              <div className="stat-foot">AI integration pending</div>
            </div>
          </section>

          <section className="workspace-grid">
            <div className="panel assistant-panel">
              <div className="panel-heading">
                <div className="heading-icon">✧</div>
                <div>
                  <h2>ResolveIQ Assistant</h2>
                  <p>Your intelligent IT support companion</p>
                </div>
                <span className="beta-badge">PREVIEW</span>
              </div>

              <div className="chat-area" ref={chatAreaRef}>
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`message-row ${message.sender === 'user' ? 'user-row' : ''}`}
                  >
                    {message.sender === 'ai' && (
                      <div className="message-avatar">R</div>
                    )}
                    <div
                      className={`message-bubble ${message.sender === 'user' ? 'user-bubble' : 'ai-bubble'}`}
                    >
                      {message.text}
                    </div>
                  </div>
                ))}
              </div>

              <div className="suggestions">
                <span>QUICK START</span>
                <div className="suggestion-list">
                  <button onClick={() => sendMessage('My VPN is not connecting')}>
                    <span>⌁</span> VPN issue
                  </button>
                  <button onClick={() => sendMessage('I cannot access my account')}>
                    <span>♙</span> Login problem
                  </button>
                  <button onClick={() => sendMessage('My laptop is running slowly')}>
                    <span>◴</span> Slow computer
                  </button>
                </div>
              </div>

              <form
                className="chat-input-area"
                onSubmit={(event) => {
                  event.preventDefault()
                  sendMessage(input)
                }}
              >
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Describe your IT issue..."
                  aria-label="Describe your IT issue"
                />
                <button type="submit" aria-label="Send message">
                  ↑
                </button>
              </form>

              <div className="input-note">
                Prototype mode · AI responses are simulated
              </div>
            </div>

            <div className="right-column">
              <div className="panel core-panel">
                <div className="section-heading">
                  <h2>AI Core</h2>
                  <span className="beta-badge">3D PREVIEW</span>
                </div>

                <p className="section-subtitle">
                  Interactive visualization · Prototype mode
                </p>

                <AICore activity={coreActivity} />

                <p className="core-caption">
                  {coreActivity === 'thinking'
                    ? 'Interaction received · No live AI request'
                    : coreActivity === 'success'
                      ? 'Demo action triggered · No ticket backend'
                      : 'Core online · Ready for interaction'}
                </p>
              </div>

              <div className="panel quick-actions-panel">
                <div className="section-heading">
                  <h2>Quick actions</h2>
                  <span>•••</span>
                </div>

                <p className="section-subtitle">
                  Get help with common tasks
                </p>

                <button
                  className="action-item"
                  onClick={() => sendMessage('Help me troubleshoot my network connection')}
                >
                  <span className="action-icon purple">⌁</span>
                  <span>
                    <strong>Network &amp; VPN</strong>
                    <small>Connection and access issues</small>
                  </span>
                  <span className="arrow">›</span>
                </button>

                <button
                  className="action-item"
                  onClick={() => sendMessage('Help me with my account access and password')}
                >
                  <span className="action-icon blue">♙</span>
                  <span>
                    <strong>Account &amp; access</strong>
                    <small>Login and permission issues</small>
                  </span>
                  <span className="arrow">›</span>
                </button>

                <button
                  className="action-item"
                  onClick={() => sendMessage('Help me troubleshoot a software issue')}
                >
                  <span className="action-icon orange">▣</span>
                  <span>
                    <strong>Software support</strong>
                    <small>Apps and installation issues</small>
                  </span>
                  <span className="arrow">›</span>
                </button>

                <button
                  className="view-all"
                  onClick={() => openPage('Knowledge Base')}
                >
                  Explore knowledge base <span>→</span>
                </button>
              </div>

              <div className="incident-card">
                <div className="incident-top">
                  <span className="incident-symbol">✧</span>
                  <span className="incident-label">SMART SUPPORT</span>
                </div>

                <h3>Resolve issues, not just tickets.</h3>
                <p>
                  ResolveIQ is being built to connect troubleshooting,
                  ticket workflows, and shared-incident detection.
                </p>

                <button onClick={() => openPage('AI Assistant')}>
                  Try the assistant <span>→</span>
                </button>
              </div>
            </div>
          </section>

          <footer className="page-footer">
            <span>ResolveIQ AI · Hackathon prototype</span>
            <span>AI and ticket backend integrations pending</span>
          </footer>
        </div>
      </main>
    </div>
  )
}

export default App
