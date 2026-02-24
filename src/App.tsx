import { useState, useEffect, useCallback, useRef } from 'react'
import type { AppState, ModalState, NotifItem, AiMessage, User, Department, Process, Technology, Vendor, Threat, Assessment, BIA, Location, Group, Training, CriticalDate, Issue, Incident, Equipment, DocFolder } from './types'
import { makeSeed, ROLES, EQUIP_TYPES } from './data/seed'
import { IC, ic, DRLLogo } from './components/ui/Icons'
import Badge from './components/ui/Badge'
import Modal from './components/ui/Modal'
import Notification from './components/ui/Notification'
import Donut from './components/charts/Donut'
import Bars from './components/charts/Bars'
import AiBtn from './components/ai/AiBtn'
import { canSee, isAdmin, uid } from './utils/permissions'
import { generateReport } from './utils/reportGenerator'
import './index.css'

const PAGES = [
  { group: 'Overview', items: [{ id: 'dashboard', label: 'Dashboard', icon: IC.Dashboard }] },
  { group: 'Planning', items: [
    { id: 'departments', label: 'Departments', icon: IC.Department },
    { id: 'processes', label: 'Processes', icon: IC.Process },
    { id: 'technologies', label: 'Technologies', icon: IC.Tech },
    { id: 'vendors', label: 'Vendors', icon: IC.Vendor },
  ]},
  { group: 'Risk', items: [
    { id: 'threats', label: 'Threat Library', icon: IC.Threat },
    { id: 'assessments', label: 'Assessments', icon: IC.Assessment },
    { id: 'bia', label: 'Impact Analysis', icon: IC.BIA },
  ]},
  { group: 'Operations', items: [
    { id: 'locations', label: 'Locations', icon: IC.Location },
    { id: 'groups', label: 'Groups', icon: IC.Group },
    { id: 'documents', label: 'Documents', icon: IC.Doc },
    { id: 'training', label: 'Training', icon: IC.Training },
    { id: 'equipment', label: 'Equipment', icon: IC.Equipment },
  ]},
  { group: 'Response', items: [
    { id: 'critdates', label: 'Critical Dates', icon: IC.Calendar },
    { id: 'tasks', label: 'Continuity Tasks', icon: IC.Task },
    { id: 'issues', label: 'Issues', icon: IC.Issue },
    { id: 'incidents', label: 'Incidents', icon: IC.Incident },
  ]},
  { group: 'System', items: [
    { id: 'reports', label: 'Reports', icon: IC.Report },
    { id: 'calendar', label: 'Calendar', icon: IC.Calendar },
    { id: 'settings', label: 'Settings', icon: IC.Settings },
  ]},
]

const LS_KEY = 'bedrock_state'

function loadState(): AppState {
  try {
    const s = localStorage.getItem(LS_KEY)
    if (s) return JSON.parse(s)
  } catch {}
  return makeSeed()
}

export default function App() {
  const [state, setState] = useState<AppState>(loadState)
  const [page, setPage] = useState('landing')
  const [modal, setModal] = useState<ModalState>({ show: false, type: null, data: null })
  const [notifs, setNotifs] = useState<NotifItem[]>([])
  const [collapsed, setCollapsed] = useState(false)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => (localStorage.getItem('bedrock_theme') as any) || 'dark')
  const [search, setSearch] = useState('')
  const [aiOpen, setAiOpen] = useState(false)
  const [aiMsgs, setAiMsgs] = useState<AiMessage[]>([])
  const [aiInput, setAiInput] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [curUser] = useState<User>(loadState().users[0])
  const [settingsTab, setSettingsTab] = useState('company')
  const [formData, setFormData] = useState<any>({})
  const [calMonth, setCalMonth] = useState(new Date().getMonth())
  const [calYear, setCalYear] = useState(new Date().getFullYear())
  const aiRef = useRef<HTMLDivElement>(null)

  useEffect(() => { localStorage.setItem(LS_KEY, JSON.stringify(state)) }, [state])
  useEffect(() => { localStorage.setItem('bedrock_theme', theme); document.documentElement.setAttribute('data-theme', theme) }, [theme])
  useEffect(() => { if (aiRef.current) aiRef.current.scrollTop = aiRef.current.scrollHeight }, [aiMsgs])

  const notify = useCallback((msg: string, type: NotifItem['type'] = 'success') => {
    const n: NotifItem = { id: uid(), msg, type }
    setNotifs(prev => [...prev, n])
    setTimeout(() => setNotifs(prev => prev.filter(x => x.id !== n.id)), 3000)
  }, [])

  const update = useCallback((fn: (s: AppState) => AppState) => {
    setState(prev => fn(prev))
  }, [])

  const openModal = (type: string, data?: any) => {
    setFormData(data ? { ...data } : {})
    setModal({ show: true, type, data })
  }
  const closeModal = () => setModal({ show: false, type: null, data: null })

  // CRUD helpers
  const addItem = <T extends { id: string }>(key: keyof AppState, item: Omit<T, 'id'>) => {
    const newItem = { ...item, id: String(uid()) } as T
    update(s => ({ ...s, [key]: [...(s[key] as any[]), newItem] }))
    notify(`Added successfully`)
    closeModal()
  }

  const updateItem = <T extends { id: string }>(key: keyof AppState, id: string, updates: Partial<T>) => {
    update(s => ({
      ...s,
      [key]: (s[key] as any[]).map((x: any) => x.id === id ? { ...x, ...updates } : x),
    }))
    notify(`Updated successfully`)
    closeModal()
  }

  const deleteItem = (key: keyof AppState, id: string) => {
    update(s => ({ ...s, [key]: (s[key] as any[]).filter((x: any) => x.id !== id) }))
    notify(`Deleted`, 'warning')
    closeModal()
  }

  // AI
  const sendAi = async () => {
    if (!aiInput.trim()) return
    const userMsg = aiInput.trim()
    setAiInput('')
    setAiMsgs(prev => [...prev, { role: 'user', content: userMsg }])
    setAiLoading(true)
    // Simulate AI response
    setTimeout(() => {
      const ctx = `Company: ${state.company.name}, ${state.departments.length} departments, ${state.departments.flatMap(d => d.processes).length} processes, ${state.assessments.length} assessments, ${state.incidents.length} incidents.`
      setAiMsgs(prev => [...prev, {
        role: 'ai',
        content: `Based on your BCP data (${ctx}), here's my analysis regarding "${userMsg}": This is a simulated response. To enable real AI responses, configure your Claude API key in Settings > Integrations.`
      }])
      setAiLoading(false)
    }, 1000)
  }

  // Report
  const downloadReport = () => {
    const text = generateReport(state)
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `BCP_${state.company.name.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`
    a.click(); URL.revokeObjectURL(url)
    notify('Report downloaded')
  }

  const allProcesses = state.departments.flatMap(d => d.processes.map(p => ({ ...p, dept: d.name, deptId: d.id })))

  // ═══ LANDING ═══
  if (page === 'landing') {
    return (
      <div className="landing">
        <div className="landing-logo">
          <img src="/bedrock-icon.svg" alt="Bedrock" />
        </div>
        <h1>BEDROCK</h1>
        <p>Business Continuity Platform</p>
        <button className="btn btn-primary" onClick={() => setPage('dashboard')}>
          {ic(IC.Dashboard)} Enter Platform
        </button>
        <div className="landing-footer">
          <span>Powered by</span>
          <DRLLogo />
          <span>Dark Rock Labs</span>
        </div>
      </div>
    )
  }

  // ═══ PAGE RENDERERS ═══
  const renderPage = () => {
    switch (page) {
      case 'dashboard': return renderDashboard()
      case 'departments': return renderDepartments()
      case 'processes': return renderProcesses()
      case 'technologies': return renderTechnologies()
      case 'vendors': return renderVendors()
      case 'threats': return renderThreats()
      case 'assessments': return renderAssessments()
      case 'bia': return renderBIA()
      case 'locations': return renderLocations()
      case 'groups': return renderGroups()
      case 'documents': return renderDocuments()
      case 'training': return renderTraining()
      case 'equipment': return renderEquipment()
      case 'critdates': return renderCritDates()
      case 'tasks': return renderTasks()
      case 'issues': return renderIssues()
      case 'incidents': return renderIncidents()
      case 'reports': return renderReports()
      case 'calendar': return renderCalendar()
      case 'settings': return renderSettings()
      default: return renderDashboard()
    }
  }

  // ═══ DASHBOARD ═══
  function renderDashboard() {
    const procs = allProcesses
    const rtoCounts = {
      'Same Day': procs.filter(p => p.rto === 'Same Day').length,
      '1 Day': procs.filter(p => p.rto === '1 Day').length,
      '2-5 Days': procs.filter(p => p.rto === '2-5 Days').length,
      '6+ Days': procs.filter(p => p.rto === '6+ Days').length,
    }
    return (
      <>
        <div className="stat-grid">
          <div className="stat"><div className="stat-val">{state.departments.length}</div><div className="stat-lbl">Departments</div></div>
          <div className="stat"><div className="stat-val">{procs.length}</div><div className="stat-lbl">Processes</div></div>
          <div className="stat"><div className="stat-val">{state.vendors.filter(v => v.critical).length}</div><div className="stat-lbl">Critical Vendors</div></div>
          <div className="stat"><div className="stat-val">{state.threats.length}</div><div className="stat-lbl">Threats</div></div>
          <div className="stat"><div className="stat-val">{state.issues.filter(i => i.status === 'Open').length}</div><div className="stat-lbl">Open Issues</div></div>
          <div className="stat"><div className="stat-val">{state.incidents.length}</div><div className="stat-lbl">Incidents</div></div>
        </div>
        <div className="grid2">
          <div className="card">
            <div className="card-title">{ic(IC.Process)} RTO Distribution</div>
            <Donut data={[
              { l: 'Same Day', v: rtoCounts['Same Day'], c: '#F87171' },
              { l: '1 Day', v: rtoCounts['1 Day'], c: '#FBBF24' },
              { l: '2-5 Days', v: rtoCounts['2-5 Days'], c: '#34D399' },
              { l: '6+ Days', v: rtoCounts['6+ Days'], c: '#60A5FA' },
            ]} />
          </div>
          <div className="card">
            <div className="card-title">{ic(IC.Department)} Department Processes</div>
            <Bars items={state.departments.map(d => ({
              l: d.name, v: d.processes.length,
              d: `${d.processes.filter(p => p.rto === 'Same Day').length} critical`,
            }))} />
          </div>
        </div>
        <div className="grid2">
          <div className="card">
            <div className="card-title">{ic(IC.Threat)} Top Risks</div>
            {state.threats.sort((a, b) => b.rpn - a.rpn).slice(0, 5).map(t => (
              <div key={t.id} className="flex-between mb8">
                <span>{t.name}</span>
                <Badge value={`RPN ${t.rpn}`} type={t.rpn >= 15 ? 'Critical' : t.rpn >= 10 ? 'High' : 'Medium'} />
              </div>
            ))}
          </div>
          <div className="card">
            <div className="card-title">{ic(IC.Issue)} Recent Issues</div>
            {state.issues.slice(0, 5).map(i => (
              <div key={i.id} className="flex-between mb8">
                <span>{i.title}</span>
                <Badge value={i.status} />
              </div>
            ))}
          </div>
        </div>
      </>
    )
  }

  // ═══ DEPARTMENTS ═══
  function renderDepartments() {
    return (
      <>
        <div className="flex-between mb16">
          <span></span>
          {isAdmin(curUser) && <button className="btn btn-primary btn-sm" onClick={() => openModal('dept-add')}>{ic(IC.Plus)} Add Department</button>}
        </div>
        <table className="tbl">
          <thead><tr><th>Name</th><th>Lead</th><th>Headcount</th><th>Processes</th><th>Actions</th></tr></thead>
          <tbody>
            {state.departments.map(d => {
              const lead = state.users.find(u => u.id === d.lead)
              return (
                <tr key={d.id}>
                  <td className="fw6">{d.name}</td>
                  <td>{lead ? `${lead.fn} ${lead.ln}` : '-'}</td>
                  <td>{d.headcount}</td>
                  <td>{d.processes.length}</td>
                  <td className="tbl-actions">
                    <button title="Edit" onClick={() => openModal('dept-edit', d)}>{ic(IC.Edit)}</button>
                    <button title="Delete" className="del" onClick={() => openModal('dept-del', d)}>{ic(IC.Trash)}</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </>
    )
  }

  // ═══ PROCESSES ═══
  function renderProcesses() {
    return (
      <>
        <div className="flex-between mb16">
          <span></span>
          {isAdmin(curUser) && <button className="btn btn-primary btn-sm" onClick={() => openModal('proc-add')}>{ic(IC.Plus)} Add Process</button>}
        </div>
        <table className="tbl">
          <thead><tr><th>Process</th><th>Department</th><th>Priority</th><th>RTO</th><th>RPO</th><th>MTD</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {allProcesses.map(p => (
              <tr key={p.id}>
                <td className="fw6">{p.name}</td>
                <td>{p.dept}</td>
                <td><Badge value={p.pri} /></td>
                <td><Badge value={p.rto} /></td>
                <td>{p.rpo}</td>
                <td>{p.mtd}</td>
                <td><Badge value={p.status} /></td>
                <td className="tbl-actions">
                  <button title="Edit" onClick={() => openModal('proc-edit', { ...p })}>{ic(IC.Edit)}</button>
                  <button title="Delete" className="del" onClick={() => openModal('proc-del', p)}>{ic(IC.Trash)}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </>
    )
  }

  // ═══ TECHNOLOGIES ═══
  function renderTechnologies() {
    return (
      <>
        <div className="flex-between mb16">
          <span></span>
          {isAdmin(curUser) && <button className="btn btn-primary btn-sm" onClick={() => openModal('tech-add')}>{ic(IC.Plus)} Add Technology</button>}
        </div>
        <table className="tbl">
          <thead><tr><th>Name</th><th>Tier</th><th>Type</th><th>RPO</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {state.technologies.map(t => (
              <tr key={t.id}>
                <td className="fw6">{t.name}</td>
                <td><Badge value={t.tier} /></td>
                <td>{t.type}</td>
                <td>{t.rpo}</td>
                <td><Badge value={t.status} /></td>
                <td className="tbl-actions">
                  <button onClick={() => openModal('tech-edit', t)}>{ic(IC.Edit)}</button>
                  <button className="del" onClick={() => openModal('tech-del', t)}>{ic(IC.Trash)}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </>
    )
  }

  // ═══ VENDORS ═══
  function renderVendors() {
    return (
      <>
        <div className="flex-between mb16">
          <span></span>
          {isAdmin(curUser) && <button className="btn btn-primary btn-sm" onClick={() => openModal('vendor-add')}>{ic(IC.Plus)} Add Vendor</button>}
        </div>
        <table className="tbl">
          <thead><tr><th>Vendor</th><th>Critical</th><th>SLA</th><th>Contact</th><th>Phone</th><th>Contract</th><th>Actions</th></tr></thead>
          <tbody>
            {state.vendors.map(v => (
              <tr key={v.id}>
                <td className="fw6">{v.name}</td>
                <td>{v.critical ? <Badge value="Critical" type="Critical" /> : <Badge value="Standard" type="Low" />}</td>
                <td className="mono">{v.sla}</td>
                <td>{v.contact}</td>
                <td>{v.phone}</td>
                <td>{v.contract}</td>
                <td className="tbl-actions">
                  <button onClick={() => openModal('vendor-edit', v)}>{ic(IC.Edit)}</button>
                  <button className="del" onClick={() => openModal('vendor-del', v)}>{ic(IC.Trash)}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </>
    )
  }

  // ═══ THREATS ═══
  function renderThreats() {
    const cats = [...new Set(state.threats.map(t => t.cat))]
    return (
      <>
        <div className="flex-between mb16">
          <span></span>
          {isAdmin(curUser) && <button className="btn btn-primary btn-sm" onClick={() => openModal('threat-add')}>{ic(IC.Plus)} Add Threat</button>}
        </div>
        <div className="grid2 mb24">
          <div className="card">
            <div className="card-title">Risk Matrix</div>
            <div className="risk-matrix">
              <div className="rm-label"></div>
              {[1,2,3,4,5].map(i => <div key={i} className="rm-label">I:{i}</div>)}
              {[5,4,3,2,1].map(l => (
                <>
                  <div key={`l${l}`} className="rm-label">L:{l}</div>
                  {[1,2,3,4,5].map(i => {
                    const rpn = l * i
                    const threats = state.threats.filter(t => t.like === l && t.impact === i)
                    const bg = rpn >= 15 ? 'rgba(248,113,113,.3)' : rpn >= 8 ? 'rgba(251,191,36,.3)' : 'rgba(52,211,153,.2)'
                    return <div key={`${l}-${i}`} className="rm-cell" style={{ background: bg }} title={threats.map(t => t.name).join(', ')}>{threats.length || ''}</div>
                  })}
                </>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="card-title">By Category</div>
            <Donut data={cats.map((c, i) => ({
              l: c, v: state.threats.filter(t => t.cat === c).length,
              c: ['#F87171','#FBBF24','#34D399','#60A5FA','#A78BFA','#F472B6','#FB923C'][i % 7],
            }))} />
          </div>
        </div>
        <table className="tbl">
          <thead><tr><th>Threat</th><th>Category</th><th>Likelihood</th><th>Impact</th><th>RPN</th><th>Trend</th><th>Actions</th></tr></thead>
          <tbody>
            {state.threats.sort((a, b) => b.rpn - a.rpn).map(t => (
              <tr key={t.id}>
                <td className="fw6">{t.name}</td>
                <td>{t.cat}</td>
                <td className="mono">{t.like}</td>
                <td className="mono">{t.impact}</td>
                <td><Badge value={`${t.rpn}`} type={t.rpn >= 15 ? 'Critical' : t.rpn >= 8 ? 'High' : 'Medium'} /></td>
                <td>{t.trend === 'up' ? '↑' : t.trend === 'down' ? '↓' : '→'}</td>
                <td className="tbl-actions">
                  <button onClick={() => openModal('threat-edit', t)}>{ic(IC.Edit)}</button>
                  <button className="del" onClick={() => openModal('threat-del', t)}>{ic(IC.Trash)}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </>
    )
  }

  // ═══ ASSESSMENTS ═══
  function renderAssessments() {
    return (
      <>
        <div className="flex-between mb16">
          <span></span>
          {isAdmin(curUser) && <button className="btn btn-primary btn-sm" onClick={() => openModal('assess-add')}>{ic(IC.Plus)} Add Assessment</button>}
        </div>
        <table className="tbl">
          <thead><tr><th>Assessment</th><th>Status</th><th>L</th><th>I</th><th>RPN</th><th>Date</th><th>Mitigations</th><th>Actions</th></tr></thead>
          <tbody>
            {state.assessments.map(a => (
              <tr key={a.id}>
                <td className="fw6">{a.name}</td>
                <td><Badge value={a.status} /></td>
                <td className="mono">{a.like}</td>
                <td className="mono">{a.impact}</td>
                <td className="mono fw6">{a.rpn}</td>
                <td>{a.date}</td>
                <td className="t2" style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.miti}</td>
                <td className="tbl-actions">
                  <button onClick={() => openModal('assess-edit', a)}>{ic(IC.Edit)}</button>
                  <button className="del" onClick={() => openModal('assess-del', a)}>{ic(IC.Trash)}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </>
    )
  }

  // ═══ BIA ═══
  function renderBIA() {
    return (
      <>
        <div className="flex-between mb16">
          <span></span>
          {isAdmin(curUser) && <button className="btn btn-primary btn-sm" onClick={() => openModal('bia-add')}>{ic(IC.Plus)} Add BIA</button>}
        </div>
        <table className="tbl">
          <thead><tr><th>Department</th><th>Process</th><th>Financial Impact</th><th>Operational</th><th>Reputational</th><th>Regulatory</th><th>Actions</th></tr></thead>
          <tbody>
            {state.bia.map(b => {
              const dept = state.departments.find(d => d.id === b.dept)
              const proc = dept?.processes.find(p => p.id === b.process)
              return (
                <tr key={b.id}>
                  <td className="fw6">{dept?.name || b.dept}</td>
                  <td>{proc?.name || b.process}</td>
                  <td className="mono">${b.finImpact.toLocaleString()}</td>
                  <td><Badge value={b.opsImpact} /></td>
                  <td><Badge value={b.repImpact} /></td>
                  <td><Badge value={b.regImpact} /></td>
                  <td className="tbl-actions">
                    <button onClick={() => openModal('bia-edit', b)}>{ic(IC.Edit)}</button>
                    <button className="del" onClick={() => openModal('bia-del', b)}>{ic(IC.Trash)}</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </>
    )
  }

  // ═══ LOCATIONS ═══
  function renderLocations() {
    return (
      <>
        <div className="flex-between mb16">
          <span></span>
          {isAdmin(curUser) && <button className="btn btn-primary btn-sm" onClick={() => openModal('loc-add')}>{ic(IC.Plus)} Add Location</button>}
        </div>
        <div className="grid3">
          {state.locations.map(l => (
            <div key={l.id} className="card">
              <div className="card-title">{l.name}</div>
              <p className="t2 mb8">{l.addr}</p>
              <div className="flex gap8 mb8">
                <Badge value={l.type} />
                <Badge value={l.status} />
              </div>
              <p className="t3" style={{ fontSize: 12 }}>Capacity: {l.capacity}</p>
              <div className="tbl-actions mt8">
                <button onClick={() => openModal('loc-edit', l)}>{ic(IC.Edit)}</button>
                <button className="del" onClick={() => openModal('loc-del', l)}>{ic(IC.Trash)}</button>
              </div>
            </div>
          ))}
        </div>
      </>
    )
  }

  // ═══ GROUPS ═══
  function renderGroups() {
    return (
      <>
        <div className="flex-between mb16">
          <span></span>
          {isAdmin(curUser) && <button className="btn btn-primary btn-sm" onClick={() => openModal('group-add')}>{ic(IC.Plus)} Add Group</button>}
        </div>
        <div className="grid2">
          {state.groups.map(g => (
            <div key={g.id} className="card">
              <div className="card-title">{g.name}</div>
              <p className="t2 mb8">{g.desc}</p>
              <div className="flex gap8" style={{ flexWrap: 'wrap' }}>
                {g.members.map(mid => {
                  const u = state.users.find(x => x.id === mid)
                  return u ? <Badge key={mid} value={`${u.fn} ${u.ln}`} type="info" /> : null
                })}
              </div>
              <div className="tbl-actions mt8">
                <button onClick={() => openModal('group-edit', g)}>{ic(IC.Edit)}</button>
                <button className="del" onClick={() => openModal('group-del', g)}>{ic(IC.Trash)}</button>
              </div>
            </div>
          ))}
        </div>
      </>
    )
  }

  // ═══ DOCUMENTS ═══
  function renderDocuments() {
    return (
      <>
        <div className="flex-between mb16">
          <span></span>
          {isAdmin(curUser) && <button className="btn btn-primary btn-sm" onClick={() => openModal('doc-add')}>{ic(IC.Plus)} Add Document</button>}
        </div>
        {state.documents.folders.map(folder => (
          <div key={folder.id} className="card">
            <div className="card-title">{ic(IC.Doc)} {folder.name}</div>
            <table className="tbl">
              <thead><tr><th>Name</th><th>Size</th><th>Date</th><th>Author</th></tr></thead>
              <tbody>
                {folder.files.map(f => {
                  const author = state.users.find(u => u.id === f.author)
                  return (
                    <tr key={f.id}>
                      <td className="fw6">{f.name}</td>
                      <td className="mono t2">{f.size}</td>
                      <td className="t2">{f.date}</td>
                      <td>{author ? `${author.fn} ${author.ln}` : f.author}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ))}
      </>
    )
  }

  // ═══ TRAINING ═══
  function renderTraining() {
    return (
      <>
        <div className="flex-between mb16">
          <span></span>
          {isAdmin(curUser) && <button className="btn btn-primary btn-sm" onClick={() => openModal('training-add')}>{ic(IC.Plus)} Add Training</button>}
        </div>
        <table className="tbl">
          <thead><tr><th>Name</th><th>Type</th><th>Frequency</th><th>Last</th><th>Next</th><th>Status</th><th>Attendees</th><th>Actions</th></tr></thead>
          <tbody>
            {state.training.map(t => (
              <tr key={t.id}>
                <td className="fw6">{t.name}</td>
                <td>{t.type}</td>
                <td>{t.freq}</td>
                <td>{t.last}</td>
                <td>{t.next}</td>
                <td><Badge value={t.status} /></td>
                <td className="mono">{t.attendees.length}</td>
                <td className="tbl-actions">
                  <button onClick={() => openModal('training-edit', t)}>{ic(IC.Edit)}</button>
                  <button className="del" onClick={() => openModal('training-del', t)}>{ic(IC.Trash)}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </>
    )
  }

  // ═══ EQUIPMENT ═══
  function renderEquipment() {
    return (
      <>
        <div className="flex-between mb16">
          <span></span>
          {isAdmin(curUser) && <button className="btn btn-primary btn-sm" onClick={() => openModal('equip-add')}>{ic(IC.Plus)} Add Equipment</button>}
        </div>
        {state.equipment.length === 0 ? (
          <div className="empty">
            {ic(IC.Equipment)}
            <p>No equipment tracked yet</p>
            <button className="btn btn-secondary btn-sm mt8" onClick={() => openModal('equip-add')}>Add First Item</button>
          </div>
        ) : (
          <table className="tbl">
            <thead><tr><th>Name</th><th>Type</th><th>Serial</th><th>Location</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {state.equipment.map(e => (
                <tr key={e.id}>
                  <td className="fw6">{e.name}</td>
                  <td>{e.type}</td>
                  <td className="mono">{e.serial}</td>
                  <td>{e.location}</td>
                  <td><Badge value={e.status} /></td>
                  <td className="tbl-actions">
                    <button onClick={() => openModal('equip-edit', e)}>{ic(IC.Edit)}</button>
                    <button className="del" onClick={() => openModal('equip-del', e)}>{ic(IC.Trash)}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </>
    )
  }

  // ═══ CRITICAL DATES ═══
  function renderCritDates() {
    return (
      <>
        <div className="flex-between mb16">
          <span></span>
          {isAdmin(curUser) && <button className="btn btn-primary btn-sm" onClick={() => openModal('cd-add')}>{ic(IC.Plus)} Add Date</button>}
        </div>
        <table className="tbl">
          <thead><tr><th>Date</th><th>Name</th><th>Department</th><th>Type</th><th>Actions</th></tr></thead>
          <tbody>
            {state.critDates.sort((a, b) => a.date.localeCompare(b.date)).map(cd => (
              <tr key={cd.id}>
                <td className="mono fw6">{cd.date}</td>
                <td>{cd.name}</td>
                <td>{cd.dept}</td>
                <td><Badge value={cd.type} /></td>
                <td className="tbl-actions">
                  <button onClick={() => openModal('cd-edit', cd)}>{ic(IC.Edit)}</button>
                  <button className="del" onClick={() => openModal('cd-del', cd)}>{ic(IC.Trash)}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </>
    )
  }

  // ═══ TASKS ═══
  function renderTasks() {
    const phases: [string, keyof typeof state.tasks][] = [
      ['Early Closure', 'early'], ['0-24 Hours', 'immed'], ['2-5 Days', 'short'], ['6+ Days', 'long']
    ]
    return (
      <>
        {phases.map(([label, key]) => (
          <div key={key} className="card">
            <div className="card-title">{label}</div>
            <ol style={{ paddingLeft: 20 }}>
              {state.tasks[key].map((task, i) => (
                <li key={i} style={{ marginBottom: 6, fontSize: 13 }}>{task}</li>
              ))}
            </ol>
            {isAdmin(curUser) && (
              <button className="btn btn-secondary btn-sm mt8" onClick={() => openModal('task-add', { phase: key })}>
                {ic(IC.Plus)} Add Task
              </button>
            )}
          </div>
        ))}
      </>
    )
  }

  // ═══ ISSUES ═══
  function renderIssues() {
    return (
      <>
        <div className="flex-between mb16">
          <span></span>
          {isAdmin(curUser) && <button className="btn btn-primary btn-sm" onClick={() => openModal('issue-add')}>{ic(IC.Plus)} Add Issue</button>}
        </div>
        <table className="tbl">
          <thead><tr><th>Title</th><th>Priority</th><th>Status</th><th>Assigned</th><th>Created</th><th>Actions</th></tr></thead>
          <tbody>
            {state.issues.map(i => {
              const assignee = state.users.find(u => u.id === i.assigned)
              return (
                <tr key={i.id}>
                  <td className="fw6">{i.title}</td>
                  <td><Badge value={i.pri} /></td>
                  <td><Badge value={i.status} /></td>
                  <td>{assignee ? `${assignee.fn} ${assignee.ln}` : '-'}</td>
                  <td>{i.created}</td>
                  <td className="tbl-actions">
                    <button onClick={() => openModal('issue-edit', i)}>{ic(IC.Edit)}</button>
                    <button className="del" onClick={() => openModal('issue-del', i)}>{ic(IC.Trash)}</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </>
    )
  }

  // ═══ INCIDENTS ═══
  function renderIncidents() {
    return (
      <>
        <div className="flex-between mb16">
          <span></span>
          {isAdmin(curUser) && <button className="btn btn-primary btn-sm" onClick={() => openModal('incident-add')}>{ic(IC.Plus)} Log Incident</button>}
        </div>
        <table className="tbl">
          <thead><tr><th>Title</th><th>Date</th><th>Severity</th><th>Status</th><th>Lead</th><th>Actions</th></tr></thead>
          <tbody>
            {state.incidents.map(inc => {
              const lead = state.users.find(u => u.id === inc.lead)
              return (
                <tr key={inc.id}>
                  <td className="fw6">{inc.title}</td>
                  <td>{inc.date}</td>
                  <td><Badge value={inc.severity} /></td>
                  <td><Badge value={inc.status} /></td>
                  <td>{lead ? `${lead.fn} ${lead.ln}` : '-'}</td>
                  <td className="tbl-actions">
                    <button onClick={() => openModal('incident-edit', inc)}>{ic(IC.Edit)}</button>
                    <button onClick={() => openModal('incident-view', inc)}>{ic(IC.Eye)}</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </>
    )
  }

  // ═══ REPORTS ═══
  function renderReports() {
    return (
      <div className="card">
        <div className="card-title">{ic(IC.Report)} BCP Report Generator</div>
        <p className="t2 mb16">Generate a comprehensive Business Continuity Plan document based on current data.</p>
        <div className="stat-grid mb16">
          <div className="stat"><div className="stat-val">{state.departments.length}</div><div className="stat-lbl">Departments</div></div>
          <div className="stat"><div className="stat-val">{allProcesses.length}</div><div className="stat-lbl">Processes</div></div>
          <div className="stat"><div className="stat-val">{state.vendors.length}</div><div className="stat-lbl">Vendors</div></div>
          <div className="stat"><div className="stat-val">{state.assessments.length}</div><div className="stat-lbl">Assessments</div></div>
        </div>
        <button className="btn btn-primary" onClick={downloadReport}>
          {ic(IC.Download)} Download Full BCP Report
        </button>
        <AiBtn onClick={() => setAiOpen(true)} label="AI Summary" />
      </div>
    )
  }

  // ═══ CALENDAR ═══
  function renderCalendar() {
    const now = new Date()
    const first = new Date(calYear, calMonth, 1)
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate()
    const startDay = first.getDay()
    const days = []
    for (let i = 0; i < startDay; i++) days.push(null)
    for (let i = 1; i <= daysInMonth; i++) days.push(i)

    const monthStr = first.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    const eventDates = new Set(state.critDates.map(cd => {
      const d = new Date(cd.date)
      if (d.getMonth() === calMonth && d.getFullYear() === calYear) return d.getDate()
      return null
    }).filter(Boolean))

    return (
      <div className="card" style={{ maxWidth: 500 }}>
        <div className="flex-between mb16">
          <button className="btn btn-secondary btn-sm" onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1) } else setCalMonth(calMonth - 1) }}>←</button>
          <span className="fw7">{monthStr}</span>
          <button className="btn btn-secondary btn-sm" onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1) } else setCalMonth(calMonth + 1) }}>→</button>
        </div>
        <div className="cal-grid">
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <div key={d} className="cal-hdr">{d}</div>)}
          {days.map((d, i) => (
            <div key={i} className={`cal-day ${d === null ? 'empty' : ''} ${d === now.getDate() && calMonth === now.getMonth() && calYear === now.getFullYear() ? 'today' : ''} ${d && eventDates.has(d) ? 'has-event' : ''}`}>
              {d || ''}
            </div>
          ))}
        </div>
        <div className="mt16">
          <div className="card-title">{ic(IC.Calendar)} Events This Month</div>
          {state.critDates.filter(cd => {
            const d = new Date(cd.date)
            return d.getMonth() === calMonth && d.getFullYear() === calYear
          }).map(cd => (
            <div key={cd.id} className="flex-between mb8">
              <span>{cd.name}</span>
              <span className="mono t2">{cd.date}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ═══ SETTINGS ═══
  function renderSettings() {
    const tabs = [
      { id: 'company', label: 'Company' },
      { id: 'users', label: 'Users' },
      { id: 'roles', label: 'Roles' },
      { id: 'theme', label: 'Appearance' },
      { id: 'data', label: 'Data' },
    ]
    return (
      <div className="card" style={{ padding: 0 }}>
        <div className="settings-grid">
          <div className="settings-nav">
            {tabs.map(t => (
              <div key={t.id} className={`settings-nav-item ${settingsTab === t.id ? 'active' : ''}`} onClick={() => setSettingsTab(t.id)}>
                {t.label}
              </div>
            ))}
          </div>
          <div className="settings-body">
            {settingsTab === 'company' && (
              <>
                <h3 className="mb16" style={{ fontFamily: 'var(--display)', fontSize: 14, letterSpacing: 1 }}>Company Information</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Company Name</label>
                    <input className="form-input" value={state.company.name} onChange={e => update(s => ({ ...s, company: { ...s.company, name: e.target.value } }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Industry</label>
                    <input className="form-input" value={state.company.industry} onChange={e => update(s => ({ ...s, company: { ...s.company, industry: e.target.value } }))} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Address</label>
                    <input className="form-input" value={state.company.addr} onChange={e => update(s => ({ ...s, company: { ...s.company, addr: e.target.value } }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input className="form-input" value={state.company.phone} onChange={e => update(s => ({ ...s, company: { ...s.company, phone: e.target.value } }))} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input className="form-input" value={state.company.city} onChange={e => update(s => ({ ...s, company: { ...s.company, city: e.target.value } }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">State</label>
                    <input className="form-input" value={state.company.state} onChange={e => update(s => ({ ...s, company: { ...s.company, state: e.target.value } }))} />
                  </div>
                </div>
                <button className="btn btn-primary mt16" onClick={() => notify('Company info saved')}>Save Changes</button>
              </>
            )}
            {settingsTab === 'users' && (
              <>
                <div className="flex-between mb16">
                  <h3 style={{ fontFamily: 'var(--display)', fontSize: 14, letterSpacing: 1 }}>User Management</h3>
                  <button className="btn btn-primary btn-sm" onClick={() => openModal('user-add')}>{ic(IC.Plus)} Add User</button>
                </div>
                <table className="tbl">
                  <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>
                    {state.users.map(u => (
                      <tr key={u.id}>
                        <td className="fw6">{u.fn} {u.ln}</td>
                        <td className="t2">{u.email}</td>
                        <td><Badge value={ROLES.find(r => r.id === u.role)?.label || u.role} /></td>
                        <td><Badge value={u.active ? 'Active' : 'Inactive'} /></td>
                        <td className="tbl-actions">
                          <button onClick={() => openModal('user-edit', u)}>{ic(IC.Edit)}</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
            {settingsTab === 'roles' && (
              <>
                <h3 className="mb16" style={{ fontFamily: 'var(--display)', fontSize: 14, letterSpacing: 1 }}>Role Permissions</h3>
                {ROLES.map(r => (
                  <div key={r.id} className="card">
                    <div className="card-title">{r.label}</div>
                    <div className="flex gap8" style={{ flexWrap: 'wrap' }}>
                      {r.perms.map(p => <Badge key={p} value={p} type="info" />)}
                    </div>
                  </div>
                ))}
              </>
            )}
            {settingsTab === 'theme' && (
              <>
                <h3 className="mb16" style={{ fontFamily: 'var(--display)', fontSize: 14, letterSpacing: 1 }}>Appearance</h3>
                <div className="form-group">
                  <label className="form-label">Theme</label>
                  <div className="flex gap8">
                    <button className={`btn ${theme === 'dark' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTheme('dark')}>{ic(IC.Moon)} Dark</button>
                    <button className={`btn ${theme === 'light' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTheme('light')}>{ic(IC.Sun)} Light</button>
                  </div>
                </div>
              </>
            )}
            {settingsTab === 'data' && (
              <>
                <h3 className="mb16" style={{ fontFamily: 'var(--display)', fontSize: 14, letterSpacing: 1 }}>Data Management</h3>
                <div className="flex gap8">
                  <button className="btn btn-secondary" onClick={() => {
                    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url; a.download = `bedrock_backup_${new Date().toISOString().split('T')[0]}.json`
                    a.click(); URL.revokeObjectURL(url)
                    notify('Backup downloaded')
                  }}>{ic(IC.Download)} Export Backup</button>
                  <button className="btn btn-danger" onClick={() => {
                    if (confirm('Reset all data to defaults? This cannot be undone.')) {
                      setState(makeSeed())
                      notify('Data reset to defaults', 'warning')
                    }
                  }}>{ic(IC.Trash)} Reset Data</button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ═══ MODAL CONTENT ═══
  function renderModalContent() {
    if (!modal.show || !modal.type) return null
    const t = modal.type
    const d = modal.data

    // Delete confirmations
    if (t.endsWith('-del')) {
      const entity = t.replace('-del', '')
      const keyMap: Record<string, keyof AppState> = {
        dept: 'departments', tech: 'technologies', vendor: 'vendors',
        threat: 'threats', assess: 'assessments', bia: 'bia',
        loc: 'locations', group: 'groups', training: 'training',
        equip: 'equipment', cd: 'critDates', issue: 'issues', incident: 'incidents',
      }
      return (
        <Modal title="Confirm Delete" onClose={closeModal}>
          <p className="mb16">Are you sure you want to delete <strong>{d?.name || d?.title || 'this item'}</strong>?</p>
          <div className="modal-footer" style={{ padding: 0, borderTop: 'none' }}>
            <button className="btn btn-secondary" onClick={closeModal}>Cancel</button>
            <button className="btn btn-danger" onClick={() => {
              if (entity === 'proc') {
                update(s => ({
                  ...s,
                  departments: s.departments.map(dept => ({
                    ...dept,
                    processes: dept.processes.filter(p => p.id !== d.id)
                  }))
                }))
                notify('Process deleted', 'warning')
                closeModal()
              } else if (keyMap[entity]) {
                deleteItem(keyMap[entity], d.id)
              }
            }}>Delete</button>
          </div>
        </Modal>
      )
    }

    // View modals
    if (t === 'incident-view') {
      return (
        <Modal title="Incident Details" onClose={closeModal} size="lg">
          <h3 className="fw7 mb8">{d.title}</h3>
          <div className="flex gap8 mb16">
            <Badge value={d.severity} />
            <Badge value={d.status} />
          </div>
          <div className="form-group"><label className="form-label">Date</label><p>{d.date}</p></div>
          <div className="form-group"><label className="form-label">Description</label><p>{d.desc}</p></div>
          <div className="form-group"><label className="form-label">Resolution</label><p>{d.resolution}</p></div>
        </Modal>
      )
    }

    // Form modals
    const isEdit = t.endsWith('-edit')
    const fd = formData

    const field = (label: string, key: string, type = 'text') => (
      <div className="form-group">
        <label className="form-label">{label}</label>
        {type === 'textarea' ? (
          <textarea className="form-textarea" value={fd[key] || ''} onChange={e => setFormData({ ...fd, [key]: e.target.value })} />
        ) : type === 'select-dept' ? (
          <select className="form-select" value={fd[key] || ''} onChange={e => setFormData({ ...fd, [key]: e.target.value })}>
            <option value="">Select...</option>
            {state.departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        ) : type === 'select-user' ? (
          <select className="form-select" value={fd[key] || ''} onChange={e => setFormData({ ...fd, [key]: e.target.value })}>
            <option value="">Select...</option>
            {state.users.map(u => <option key={u.id} value={u.id}>{u.fn} {u.ln}</option>)}
          </select>
        ) : type === 'select-role' ? (
          <select className="form-select" value={fd[key] || ''} onChange={e => setFormData({ ...fd, [key]: e.target.value })}>
            {ROLES.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
          </select>
        ) : type === 'select-rto' ? (
          <select className="form-select" value={fd[key] || ''} onChange={e => setFormData({ ...fd, [key]: e.target.value })}>
            {['Same Day', '1 Day', '2-5 Days', '6+ Days'].map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        ) : type === 'select-pri' ? (
          <select className="form-select" value={fd[key] || ''} onChange={e => setFormData({ ...fd, [key]: e.target.value })}>
            {['Critical', 'High', 'Medium', 'Low'].map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        ) : type === 'number' ? (
          <input className="form-input" type="number" value={fd[key] || ''} onChange={e => setFormData({ ...fd, [key]: Number(e.target.value) })} />
        ) : (
          <input className="form-input" type={type} value={fd[key] || ''} onChange={e => setFormData({ ...fd, [key]: e.target.value })} />
        )}
      </div>
    )

    const saveBtn = (onClick: () => void) => (
      <div className="modal-footer" style={{ padding: '12px 0 0', borderTop: 'none' }}>
        <button className="btn btn-secondary" onClick={closeModal}>Cancel</button>
        <button className="btn btn-primary" onClick={onClick}>{isEdit ? 'Save Changes' : 'Add'}</button>
      </div>
    )

    // Department
    if (t === 'dept-add' || t === 'dept-edit') {
      return (
        <Modal title={isEdit ? 'Edit Department' : 'Add Department'} onClose={closeModal}>
          {field('Name', 'name')}
          {field('Lead', 'lead', 'select-user')}
          {field('Headcount', 'headcount', 'number')}
          {saveBtn(() => {
            if (isEdit) updateItem('departments', d.id, fd)
            else addItem('departments', { ...fd, processes: [] })
          })}
        </Modal>
      )
    }

    // Process
    if (t === 'proc-add' || t === 'proc-edit') {
      return (
        <Modal title={isEdit ? 'Edit Process' : 'Add Process'} onClose={closeModal} size="lg">
          <div className="form-row">{field('Name', 'name')}{field('Department', 'deptId', 'select-dept')}</div>
          <div className="form-row">{field('Priority', 'pri', 'select-pri')}{field('RTO', 'rto', 'select-rto')}</div>
          <div className="form-row">{field('RPO', 'rpo')}{field('MTD', 'mtd')}</div>
          {field('Strategy', 'strat')}
          {field('Workaround', 'workaround', 'textarea')}
          {saveBtn(() => {
            const proc = { name: fd.name, pri: fd.pri || 'Medium', rto: fd.rto || '2-5 Days', rpo: fd.rpo || '', mtd: fd.mtd || '', strat: fd.strat || '', status: fd.status || 'Active', deps: fd.deps || [], workaround: fd.workaround || '' }
            if (isEdit) {
              update(s => ({
                ...s,
                departments: s.departments.map(dept => ({
                  ...dept,
                  processes: dept.processes.map(p => p.id === d.id ? { ...p, ...proc } : p)
                }))
              }))
              notify('Process updated'); closeModal()
            } else {
              const deptId = fd.deptId || state.departments[0]?.id
              update(s => ({
                ...s,
                departments: s.departments.map(dept => dept.id === deptId ? { ...dept, processes: [...dept.processes, { ...proc, id: String(uid()) }] } : dept)
              }))
              notify('Process added'); closeModal()
            }
          })}
        </Modal>
      )
    }

    // Technology
    if (t === 'tech-add' || t === 'tech-edit') {
      return (
        <Modal title={isEdit ? 'Edit Technology' : 'Add Technology'} onClose={closeModal}>
          {field('Name', 'name')}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Tier</label>
              <select className="form-select" value={fd.tier || ''} onChange={e => setFormData({ ...fd, tier: e.target.value })}>
                <option value="Tier 1">Tier 1</option><option value="Tier 2">Tier 2</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Type</label>
              <select className="form-select" value={fd.type || ''} onChange={e => setFormData({ ...fd, type: e.target.value })}>
                {['SaaS','On-Premise','IaaS','Hardware'].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          </div>
          {field('RPO', 'rpo')}
          {saveBtn(() => isEdit ? updateItem('technologies', d.id, fd) : addItem('technologies', { ...fd, status: 'Active' }))}
        </Modal>
      )
    }

    // Vendor
    if (t === 'vendor-add' || t === 'vendor-edit') {
      return (
        <Modal title={isEdit ? 'Edit Vendor' : 'Add Vendor'} onClose={closeModal}>
          {field('Name', 'name')}
          <div className="form-row">{field('Contact', 'contact')}{field('Phone', 'phone')}</div>
          <div className="form-row">{field('Email', 'email')}{field('SLA', 'sla')}</div>
          {field('Contract End', 'contract', 'date')}
          <div className="form-group">
            <label className="form-label">
              <input type="checkbox" checked={fd.critical || false} onChange={e => setFormData({ ...fd, critical: e.target.checked })} /> Critical Vendor
            </label>
          </div>
          {saveBtn(() => isEdit ? updateItem('vendors', d.id, fd) : addItem('vendors', fd))}
        </Modal>
      )
    }

    // Threat
    if (t === 'threat-add' || t === 'threat-edit') {
      return (
        <Modal title={isEdit ? 'Edit Threat' : 'Add Threat'} onClose={closeModal}>
          {field('Name', 'name')}
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-select" value={fd.cat || ''} onChange={e => setFormData({ ...fd, cat: e.target.value })}>
              {['Cyber','Natural','Infrastructure','Health','Operational','Personnel'].map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div className="form-row">{field('Likelihood (1-5)', 'like', 'number')}{field('Impact (1-5)', 'impact', 'number')}</div>
          <div className="form-group">
            <label className="form-label">Trend</label>
            <select className="form-select" value={fd.trend || 'stable'} onChange={e => setFormData({ ...fd, trend: e.target.value })}>
              <option value="up">Increasing</option><option value="stable">Stable</option><option value="down">Decreasing</option>
            </select>
          </div>
          {saveBtn(() => {
            const rpn = (fd.like || 1) * (fd.impact || 1)
            isEdit ? updateItem('threats', d.id, { ...fd, rpn }) : addItem('threats', { ...fd, rpn })
          })}
        </Modal>
      )
    }

    // Assessment
    if (t === 'assess-add' || t === 'assess-edit') {
      return (
        <Modal title={isEdit ? 'Edit Assessment' : 'Add Assessment'} onClose={closeModal}>
          {field('Name', 'name')}
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-select" value={fd.status || ''} onChange={e => setFormData({ ...fd, status: e.target.value })}>
              {['Pending','In Progress','Complete'].map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div className="form-row">{field('Likelihood (1-5)', 'like', 'number')}{field('Impact (1-5)', 'impact', 'number')}</div>
          {field('Date', 'date', 'date')}
          {field('Mitigations', 'miti', 'textarea')}
          {saveBtn(() => {
            const rpn = (fd.like || 1) * (fd.impact || 1)
            isEdit ? updateItem('assessments', d.id, { ...fd, rpn }) : addItem('assessments', { ...fd, rpn })
          })}
        </Modal>
      )
    }

    // BIA
    if (t === 'bia-add' || t === 'bia-edit') {
      return (
        <Modal title={isEdit ? 'Edit BIA' : 'Add BIA'} onClose={closeModal}>
          {field('Department', 'dept', 'select-dept')}
          {field('Financial Impact ($)', 'finImpact', 'number')}
          <div className="form-row">
            {field('Operational Impact', 'opsImpact', 'select-pri')}
            {field('Reputational Impact', 'repImpact', 'select-pri')}
          </div>
          {field('Regulatory Impact', 'regImpact', 'select-pri')}
          {field('Notes', 'notes', 'textarea')}
          {saveBtn(() => isEdit ? updateItem('bia', d.id, fd) : addItem('bia', fd))}
        </Modal>
      )
    }

    // Location
    if (t === 'loc-add' || t === 'loc-edit') {
      return (
        <Modal title={isEdit ? 'Edit Location' : 'Add Location'} onClose={closeModal}>
          {field('Name', 'name')}
          {field('Address', 'addr')}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Type</label>
              <select className="form-select" value={fd.type || ''} onChange={e => setFormData({ ...fd, type: e.target.value })}>
                {['Primary','DR','Branch','Warehouse'].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            {field('Capacity', 'capacity', 'number')}
          </div>
          {saveBtn(() => isEdit ? updateItem('locations', d.id, fd) : addItem('locations', { ...fd, status: 'Active' }))}
        </Modal>
      )
    }

    // Group
    if (t === 'group-add' || t === 'group-edit') {
      return (
        <Modal title={isEdit ? 'Edit Group' : 'Add Group'} onClose={closeModal}>
          {field('Name', 'name')}
          {field('Description', 'desc', 'textarea')}
          {saveBtn(() => isEdit ? updateItem('groups', d.id, fd) : addItem('groups', { ...fd, members: [] }))}
        </Modal>
      )
    }

    // Training
    if (t === 'training-add' || t === 'training-edit') {
      return (
        <Modal title={isEdit ? 'Edit Training' : 'Add Training'} onClose={closeModal}>
          {field('Name', 'name')}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Type</label>
              <select className="form-select" value={fd.type || ''} onChange={e => setFormData({ ...fd, type: e.target.value })}>
                {['Online','Exercise','Technical','In-Person'].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            {field('Frequency', 'freq')}
          </div>
          <div className="form-row">{field('Last', 'last', 'date')}{field('Next', 'next', 'date')}</div>
          {saveBtn(() => isEdit ? updateItem('training', d.id, fd) : addItem('training', { ...fd, status: 'Upcoming', attendees: [] }))}
        </Modal>
      )
    }

    // Equipment
    if (t === 'equip-add' || t === 'equip-edit') {
      return (
        <Modal title={isEdit ? 'Edit Equipment' : 'Add Equipment'} onClose={closeModal}>
          {field('Name', 'name')}
          <div className="form-group">
            <label className="form-label">Type</label>
            <select className="form-select" value={fd.type || ''} onChange={e => setFormData({ ...fd, type: e.target.value })}>
              {EQUIP_TYPES.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div className="form-row">{field('Serial', 'serial')}{field('Location', 'location')}</div>
          {saveBtn(() => isEdit ? updateItem('equipment', d.id, fd) : addItem('equipment', { ...fd, status: 'Active', assigned: '' }))}
        </Modal>
      )
    }

    // Critical Date
    if (t === 'cd-add' || t === 'cd-edit') {
      return (
        <Modal title={isEdit ? 'Edit Critical Date' : 'Add Critical Date'} onClose={closeModal}>
          {field('Name', 'name')}
          {field('Date', 'date', 'date')}
          {field('Department', 'dept')}
          <div className="form-group">
            <label className="form-label">Type</label>
            <select className="form-select" value={fd.type || ''} onChange={e => setFormData({ ...fd, type: e.target.value })}>
              {['Review','Test','Contract','Compliance','Exercise','Deadline'].map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          {saveBtn(() => isEdit ? updateItem('critDates', d.id, fd) : addItem('critDates', fd))}
        </Modal>
      )
    }

    // Task
    if (t === 'task-add') {
      return (
        <Modal title="Add Task" onClose={closeModal}>
          <div className="form-group">
            <label className="form-label">Task Description</label>
            <input className="form-input" value={fd.task || ''} onChange={e => setFormData({ ...fd, task: e.target.value })} />
          </div>
          {saveBtn(() => {
            if (fd.task && d?.phase) {
              update(s => ({
                ...s,
                tasks: { ...s.tasks, [d.phase]: [...s.tasks[d.phase as keyof typeof s.tasks], fd.task] }
              }))
              notify('Task added'); closeModal()
            }
          })}
        </Modal>
      )
    }

    // Issue
    if (t === 'issue-add' || t === 'issue-edit') {
      return (
        <Modal title={isEdit ? 'Edit Issue' : 'Add Issue'} onClose={closeModal}>
          {field('Title', 'title')}
          <div className="form-row">{field('Priority', 'pri', 'select-pri')}{field('Assigned To', 'assigned', 'select-user')}</div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-select" value={fd.status || 'Open'} onChange={e => setFormData({ ...fd, status: e.target.value })}>
              {['Open','In Progress','Resolved'].map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          {field('Description', 'desc', 'textarea')}
          {saveBtn(() => isEdit ? updateItem('issues', d.id, fd) : addItem('issues', { ...fd, created: new Date().toISOString().split('T')[0] }))}
        </Modal>
      )
    }

    // Incident
    if (t === 'incident-add' || t === 'incident-edit') {
      return (
        <Modal title={isEdit ? 'Edit Incident' : 'Log Incident'} onClose={closeModal} size="lg">
          {field('Title', 'title')}
          <div className="form-row">{field('Date', 'date', 'date')}{field('Lead', 'lead', 'select-user')}</div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Severity</label>
              <select className="form-select" value={fd.severity || ''} onChange={e => setFormData({ ...fd, severity: e.target.value })}>
                {['Low','Medium','High','Critical'].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={fd.status || 'Active'} onChange={e => setFormData({ ...fd, status: e.target.value })}>
                {['Active','Closed'].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          </div>
          {field('Description', 'desc', 'textarea')}
          {field('Resolution', 'resolution', 'textarea')}
          {saveBtn(() => isEdit ? updateItem('incidents', d.id, fd) : addItem('incidents', { ...fd }))}
        </Modal>
      )
    }

    // User
    if (t === 'user-add' || t === 'user-edit') {
      return (
        <Modal title={isEdit ? 'Edit User' : 'Add User'} onClose={closeModal}>
          <div className="form-row">{field('First Name', 'fn')}{field('Last Name', 'ln')}</div>
          <div className="form-row">{field('Email', 'email', 'email')}{field('Phone', 'phone')}</div>
          {field('Title', 'title')}
          {field('Role', 'role', 'select-role')}
          {saveBtn(() => isEdit ? updateItem('users', d.id, fd) : addItem('users', { ...fd, active: true }))}
        </Modal>
      )
    }

    // Document (simple)
    if (t === 'doc-add') {
      return (
        <Modal title="Add Document" onClose={closeModal}>
          {field('File Name', 'name')}
          <div className="form-group">
            <label className="form-label">Folder</label>
            <select className="form-select" value={fd.folderId || ''} onChange={e => setFormData({ ...fd, folderId: e.target.value })}>
              {state.documents.folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>
          {saveBtn(() => {
            const fid = fd.folderId || state.documents.folders[0]?.id
            update(s => ({
              ...s,
              documents: {
                folders: s.documents.folders.map(f => f.id === fid ? {
                  ...f, files: [...f.files, { id: String(uid()), name: fd.name, size: 'N/A', date: new Date().toISOString().split('T')[0], author: curUser.id }]
                } : f)
              }
            }))
            notify('Document added'); closeModal()
          })}
        </Modal>
      )
    }

    return null
  }

  // ═══ MAIN LAYOUT ═══
  const pageTitle = PAGES.flatMap(g => g.items).find(i => i.id === page)?.label || page

  return (
    <div className="app">
      {/* Sidebar */}
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="sb-hdr" onClick={() => setPage('landing')} style={{ cursor: 'pointer' }}>
          <img src={theme === 'light' ? '/bedrock-light.svg' : '/bedrock-icon.svg'} alt="Bedrock" />
          <span>BEDROCK</span>
        </div>
        {PAGES.map(group => (
          <div className="nav-group" key={group.group}>
            {!collapsed && <div className="nav-group-title">{group.group}</div>}
            {group.items.map(item => (
              <div
                key={item.id}
                className={`nav-item ${page === item.id ? 'active' : ''}`}
                onClick={() => setPage(item.id)}
                title={item.label}
              >
                {ic(item.icon)}
                <span className="nav-label">{item.label}</span>
              </div>
            ))}
          </div>
        ))}
        <div className="sb-footer">
          <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
            {ic(collapsed ? IC.ChevronR : IC.ChevronL)}
            {!collapsed && <span>Collapse</span>}
          </button>
          {!collapsed && (
            <a href="https://darkrocklabs.com" target="_blank" rel="noopener">
              <DRLLogo /> Dark Rock Labs
            </a>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="main">
        {/* Topbar */}
        <header className="topbar">
          <span className="tb-title">{pageTitle}</span>
          <div className="tb-spacer" />
          <div className="search-box">
            {ic(IC.Search)}
            <input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="tb-btn" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} title="Toggle theme">
            {ic(theme === 'dark' ? IC.Sun : IC.Moon)}
          </button>
          <button className="tb-btn" onClick={() => setAiOpen(!aiOpen)} title="AI Advisor">
            {ic(IC.Sparkle)} AI
          </button>
          <div className="tb-user">
            <div className="tb-avatar">{curUser.fn[0]}{curUser.ln[0]}</div>
            {curUser.fn}
          </div>
        </header>

        {/* Content */}
        <div className="content">
          {renderPage()}
        </div>
      </div>

      {/* Notifications */}
      <div className="notif-container">
        {notifs.map(n => (
          <Notification key={n.id} msg={n.msg} type={n.type} onClose={() => setNotifs(prev => prev.filter(x => x.id !== n.id))} />
        ))}
      </div>

      {/* AI Panel */}
      {aiOpen && (
        <div className="ai-panel">
          <div className="ai-hdr">
            <h4>{ic(IC.Sparkle)} AI Advisor</h4>
            <button className="modal-close" onClick={() => setAiOpen(false)}>×</button>
          </div>
          <div className="ai-msgs" ref={aiRef}>
            {aiMsgs.length === 0 && (
              <div className="t3 tc" style={{ padding: 32 }}>
                Ask me anything about your BCP data, risk posture, or continuity planning.
              </div>
            )}
            {aiMsgs.map((m, i) => (
              <div key={i} className={`ai-msg ${m.role === 'user' ? 'user' : 'ai'}`}>{m.content}</div>
            ))}
            {aiLoading && <div className="ai-msg ai loading">Thinking...</div>}
          </div>
          <div className="ai-input">
            <input
              value={aiInput}
              onChange={e => setAiInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendAi()}
              placeholder="Ask about your BCP..."
            />
            <button onClick={sendAi} disabled={aiLoading || !aiInput.trim()}>Send</button>
          </div>
        </div>
      )}

      {/* Modal */}
      {renderModalContent()}
    </div>
  )
}
