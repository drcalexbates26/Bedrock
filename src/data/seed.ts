import type { AppState } from '../types'

export const ROLES = [
  { id: 'admin', label: 'Administrator', perms: ['dashboard','departments','processes','technologies','vendors','threats','assessments','bia','locations','groups','documents','training','critdates','tasks','issues','incidents','settings','users','roles','ai','reports','equipment','calendar','custom_questions'] },
  { id: 'program_manager', label: 'Program Manager', perms: ['dashboard','departments','processes','technologies','vendors','threats','assessments','bia','locations','groups','documents','training','critdates','tasks','issues','incidents','settings','ai','reports','equipment','calendar','custom_questions'] },
  { id: 'crisis_team', label: 'Crisis Team', perms: ['dashboard','departments_view','processes_view','technologies_view','vendors_view','threats_view','assessments_view','bia_view','locations_view','groups_view','documents_view','training_view','critdates_view','tasks_view','issues_view','incidents_view','ai','reports','equipment_view','calendar'] },
  { id: 'employee', label: 'Employee', perms: ['dashboard','documents_view','training_view','calendar'] },
]

export const EQUIP_TYPES = [
  'Laptop', 'Desktop', 'Server', 'Router', 'Switch', 'Firewall',
  'UPS', 'Generator', 'Printer', 'Phone', 'Tablet', 'Monitor',
  'Access Point', 'NAS', 'SAN', 'Load Balancer',
]

export function makeSeed(): AppState {
  return {
    company: {
      name: 'Acme Corporation',
      addr: '100 Main Street',
      city: 'Springfield',
      state: 'IL',
      zip: '62704',
      phone: '(217) 555-0100',
      industry: 'Technology',
      employees: 250,
      fiscalStart: 'January',
    },
    users: [
      { id: 'u1', fn: 'Alex', ln: 'Morgan', email: 'alex.morgan@acme.com', phone: '(217) 555-0101', title: 'BCP Director', role: 'admin', dept: 'd1', active: true },
      { id: 'u2', fn: 'Jordan', ln: 'Lee', email: 'jordan.lee@acme.com', phone: '(217) 555-0102', title: 'Program Manager', role: 'program_manager', dept: 'd1', active: true },
      { id: 'u3', fn: 'Casey', ln: 'Rivera', email: 'casey.rivera@acme.com', phone: '(217) 555-0103', title: 'IT Manager', role: 'crisis_team', dept: 'd2', active: true },
      { id: 'u4', fn: 'Taylor', ln: 'Chen', email: 'taylor.chen@acme.com', phone: '(217) 555-0104', title: 'HR Director', role: 'crisis_team', dept: 'd3', active: true },
      { id: 'u5', fn: 'Morgan', ln: 'Patel', email: 'morgan.patel@acme.com', phone: '(217) 555-0105', title: 'Finance Manager', role: 'employee', dept: 'd4', active: true },
    ],
    departments: [
      {
        id: 'd1', name: 'Executive', lead: 'u1', headcount: 12,
        processes: [
          { id: 'p1', name: 'Strategic Planning', pri: 'Critical', rto: 'Same Day', rpo: '1 Hour', mtd: '4 Hours', strat: 'Failover to DR site', status: 'Active', deps: ['Email System', 'ERP'], workaround: 'Manual coordination via phone tree' },
          { id: 'p2', name: 'Board Communications', pri: 'High', rto: '1 Day', rpo: '4 Hours', mtd: '24 Hours', strat: 'Backup email + phone', status: 'Active', deps: ['Email System'], workaround: 'Direct phone calls' },
        ],
      },
      {
        id: 'd2', name: 'Information Technology', lead: 'u3', headcount: 45,
        processes: [
          { id: 'p3', name: 'Network Operations', pri: 'Critical', rto: 'Same Day', rpo: '15 Minutes', mtd: '2 Hours', strat: 'Redundant infrastructure', status: 'Active', deps: ['Core Switches', 'Firewalls'], workaround: 'Cellular hotspots' },
          { id: 'p4', name: 'Help Desk', pri: 'Medium', rto: '1 Day', rpo: '1 Hour', mtd: '8 Hours', strat: 'Remote support tools', status: 'Active', deps: ['Ticketing System'], workaround: 'Phone-based support' },
          { id: 'p5', name: 'Database Administration', pri: 'Critical', rto: 'Same Day', rpo: '5 Minutes', mtd: '1 Hour', strat: 'Real-time replication', status: 'Active', deps: ['Primary DB', 'Backup Systems'], workaround: 'Read-only replicas' },
        ],
      },
      {
        id: 'd3', name: 'Human Resources', lead: 'u4', headcount: 18,
        processes: [
          { id: 'p6', name: 'Payroll Processing', pri: 'Critical', rto: '1 Day', rpo: '1 Hour', mtd: '48 Hours', strat: 'Cloud payroll backup', status: 'Active', deps: ['HRIS', 'Banking Portal'], workaround: 'Manual check processing' },
          { id: 'p7', name: 'Employee Records', pri: 'Medium', rto: '2-5 Days', rpo: '24 Hours', mtd: '5 Days', strat: 'Cloud backup', status: 'Active', deps: ['HRIS'], workaround: 'Paper records' },
        ],
      },
      {
        id: 'd4', name: 'Finance', lead: 'u5', headcount: 22,
        processes: [
          { id: 'p8', name: 'Accounts Payable', pri: 'High', rto: '1 Day', rpo: '4 Hours', mtd: '24 Hours', strat: 'ERP cloud failover', status: 'Active', deps: ['ERP', 'Banking Portal'], workaround: 'Manual check writing' },
          { id: 'p9', name: 'Financial Reporting', pri: 'Medium', rto: '2-5 Days', rpo: '24 Hours', mtd: '5 Days', strat: 'Spreadsheet backup', status: 'Active', deps: ['ERP', 'BI Tools'], workaround: 'Manual spreadsheets' },
        ],
      },
    ],
    technologies: [
      { id: 't1', name: 'Microsoft 365', tier: 'Tier 1', type: 'SaaS', rpo: '15 Minutes', vendor: 'v1', dept: 'd2', status: 'Active' },
      { id: 't2', name: 'SAP ERP', tier: 'Tier 1', type: 'On-Premise', rpo: '1 Hour', vendor: 'v2', dept: 'd2', status: 'Active' },
      { id: 't3', name: 'Cisco Network', tier: 'Tier 1', type: 'Hardware', rpo: 'N/A', vendor: 'v3', dept: 'd2', status: 'Active' },
      { id: 't4', name: 'Workday HRIS', tier: 'Tier 2', type: 'SaaS', rpo: '4 Hours', vendor: 'v4', dept: 'd3', status: 'Active' },
      { id: 't5', name: 'Salesforce CRM', tier: 'Tier 2', type: 'SaaS', rpo: '1 Hour', vendor: 'v5', dept: 'd4', status: 'Active' },
      { id: 't6', name: 'AWS Cloud', tier: 'Tier 1', type: 'IaaS', rpo: '5 Minutes', vendor: 'v6', dept: 'd2', status: 'Active' },
    ],
    vendors: [
      { id: 'v1', name: 'Microsoft', critical: true, sla: '99.9%', contact: 'Enterprise Support', phone: '(800) 642-7676', email: 'support@microsoft.com', contract: '2025-12-31' },
      { id: 'v2', name: 'SAP', critical: true, sla: '99.5%', contact: 'Premium Support', phone: '(800) 872-1727', email: 'support@sap.com', contract: '2026-06-30' },
      { id: 'v3', name: 'Cisco', critical: true, sla: '99.9%', contact: 'TAC', phone: '(800) 553-2447', email: 'tac@cisco.com', contract: '2026-03-31' },
      { id: 'v4', name: 'Workday', critical: false, sla: '99.5%', contact: 'Customer Care', phone: '(877) 967-5329', email: 'support@workday.com', contract: '2025-09-30' },
      { id: 'v5', name: 'Salesforce', critical: false, sla: '99.9%', contact: 'Success Manager', phone: '(800) 667-6389', email: 'support@salesforce.com', contract: '2026-01-15' },
      { id: 'v6', name: 'Amazon Web Services', critical: true, sla: '99.99%', contact: 'Enterprise Support', phone: '(206) 266-4064', email: 'aws-support@amazon.com', contract: '2026-12-31' },
    ],
    threats: [
      { id: 'th1', name: 'Ransomware Attack', cat: 'Cyber', like: 4, impact: 5, rpn: 20, trend: 'up' },
      { id: 'th2', name: 'Power Outage', cat: 'Infrastructure', like: 3, impact: 4, rpn: 12, trend: 'stable' },
      { id: 'th3', name: 'Flood', cat: 'Natural', like: 2, impact: 5, rpn: 10, trend: 'up' },
      { id: 'th4', name: 'Pandemic', cat: 'Health', like: 3, impact: 4, rpn: 12, trend: 'down' },
      { id: 'th5', name: 'Supply Chain Disruption', cat: 'Operational', like: 3, impact: 3, rpn: 9, trend: 'up' },
      { id: 'th6', name: 'Data Breach', cat: 'Cyber', like: 4, impact: 5, rpn: 20, trend: 'up' },
      { id: 'th7', name: 'Earthquake', cat: 'Natural', like: 1, impact: 5, rpn: 5, trend: 'stable' },
      { id: 'th8', name: 'Key Person Loss', cat: 'Personnel', like: 3, impact: 3, rpn: 9, trend: 'stable' },
    ],
    assessments: [
      { id: 'a1', name: 'Annual BCP Review', status: 'Complete', like: 2, impact: 3, rpn: 6, miti: 'Regular updates, quarterly reviews', date: '2025-01-15', reviewer: 'u1' },
      { id: 'a2', name: 'IT DR Assessment', status: 'In Progress', like: 3, impact: 4, rpn: 12, miti: 'Redundant systems, backup testing', date: '2025-03-01', reviewer: 'u3' },
      { id: 'a3', name: 'Vendor Risk Review', status: 'Pending', like: 2, impact: 3, rpn: 6, miti: 'Dual-vendor strategy', date: '2025-06-01', reviewer: 'u2' },
    ],
    bia: [
      { id: 'b1', dept: 'd1', process: 'p1', finImpact: 500000, opsImpact: 'Critical', repImpact: 'High', regImpact: 'Medium', notes: 'Board-level visibility' },
      { id: 'b2', dept: 'd2', process: 'p3', finImpact: 1000000, opsImpact: 'Critical', repImpact: 'Critical', regImpact: 'High', notes: 'All operations depend on network' },
      { id: 'b3', dept: 'd3', process: 'p6', finImpact: 250000, opsImpact: 'High', repImpact: 'Medium', regImpact: 'Critical', notes: 'Legal compliance for payroll' },
      { id: 'b4', dept: 'd4', process: 'p8', finImpact: 750000, opsImpact: 'High', repImpact: 'High', regImpact: 'Medium', notes: 'Vendor payment obligations' },
    ],
    locations: [
      { id: 'l1', name: 'HQ - Springfield', addr: '100 Main St, Springfield, IL 62704', type: 'Primary', capacity: 200, status: 'Active' },
      { id: 'l2', name: 'DR Site - Chicago', addr: '500 Lake Shore Dr, Chicago, IL 60611', type: 'DR', capacity: 100, status: 'Active' },
      { id: 'l3', name: 'Branch - Peoria', addr: '200 Adams St, Peoria, IL 61602', type: 'Branch', capacity: 50, status: 'Active' },
    ],
    groups: [
      { id: 'g1', name: 'Crisis Management Team', desc: 'Senior leadership crisis response', members: ['u1', 'u2', 'u3', 'u4'] },
      { id: 'g2', name: 'IT Recovery Team', desc: 'Technical recovery operations', members: ['u3'] },
      { id: 'g3', name: 'Communications Team', desc: 'Internal and external communications', members: ['u1', 'u4'] },
    ],
    documents: {
      folders: [
        { id: 'f1', name: 'Plans', files: [
          { id: 'doc1', name: 'Business Continuity Plan 2025.pdf', size: '2.4 MB', date: '2025-01-15', author: 'u1' },
          { id: 'doc2', name: 'IT Disaster Recovery Plan.pdf', size: '1.8 MB', date: '2025-02-01', author: 'u3' },
        ]},
        { id: 'f2', name: 'Procedures', files: [
          { id: 'doc3', name: 'Incident Response SOP.pdf', size: '890 KB', date: '2025-01-20', author: 'u2' },
          { id: 'doc4', name: 'Emergency Evacuation Guide.pdf', size: '1.1 MB', date: '2024-11-15', author: 'u4' },
        ]},
        { id: 'f3', name: 'Templates', files: [
          { id: 'doc5', name: 'BIA Template.xlsx', size: '340 KB', date: '2024-12-01', author: 'u2' },
        ]},
      ],
    },
    training: [
      { id: 'tr1', name: 'BCP Awareness Training', type: 'Online', freq: 'Annual', last: '2025-01-10', next: '2026-01-10', status: 'Current', attendees: ['u1','u2','u3','u4','u5'] },
      { id: 'tr2', name: 'Tabletop Exercise - Ransomware', type: 'Exercise', freq: 'Semi-Annual', last: '2025-02-15', next: '2025-08-15', status: 'Current', attendees: ['u1','u2','u3'] },
      { id: 'tr3', name: 'IT DR Failover Test', type: 'Technical', freq: 'Quarterly', last: '2025-03-01', next: '2025-06-01', status: 'Upcoming', attendees: ['u3'] },
    ],
    critDates: [
      { id: 'cd1', name: 'Annual Plan Review', date: '2025-06-15', dept: 'Executive', type: 'Review' },
      { id: 'cd2', name: 'DR Test Window', date: '2025-07-01', dept: 'IT', type: 'Test' },
      { id: 'cd3', name: 'Vendor Contract Renewal - SAP', date: '2026-06-30', dept: 'IT', type: 'Contract' },
      { id: 'cd4', name: 'Insurance Policy Renewal', date: '2025-09-01', dept: 'Finance', type: 'Contract' },
      { id: 'cd5', name: 'Regulatory Audit', date: '2025-10-15', dept: 'Executive', type: 'Compliance' },
      { id: 'cd6', name: 'Tabletop Exercise', date: '2025-08-15', dept: 'Executive', type: 'Exercise' },
    ],
    tasks: {
      early: [
        'Activate phone tree for all department leads',
        'Notify Crisis Management Team',
        'Secure all facilities and restrict access',
        'Begin situation assessment and documentation',
        'Contact insurance provider',
      ],
      immed: [
        'Establish command center (primary or alternate)',
        'Deploy IT recovery team to assess systems',
        'Activate vendor emergency support contracts',
        'Begin employee accountability check',
        'Initiate communications plan',
        'Assess damage and document findings',
        'Activate DR site if primary is compromised',
      ],
      short: [
        'Restore Tier 1 systems and validate',
        'Resume critical business processes',
        'Implement temporary workarounds for non-critical functions',
        'Continue stakeholder communications',
        'Begin detailed damage assessment',
        'Coordinate with vendors on restoration timelines',
      ],
      long: [
        'Restore all remaining systems',
        'Return to normal operations',
        'Conduct post-incident review',
        'Update BCP based on lessons learned',
        'File insurance claims with documentation',
        'Debrief all teams and document improvements',
      ],
    },
    issues: [
      { id: 'i1', title: 'DR site generator needs maintenance', status: 'Open', pri: 'High', dept: 'd2', assigned: 'u3', created: '2025-02-01', desc: 'Annual generator maintenance overdue by 2 months' },
      { id: 'i2', title: 'Missing BIA for Marketing dept', status: 'Open', pri: 'Medium', dept: 'd1', assigned: 'u2', created: '2025-01-15', desc: 'Marketing department BIA has not been completed' },
      { id: 'i3', title: 'Outdated emergency contact list', status: 'Resolved', pri: 'Low', dept: 'd3', assigned: 'u4', created: '2024-12-01', desc: 'Contact list updated with new hires' },
    ],
    incidents: [
      { id: 'inc1', title: 'Power Outage - Springfield HQ', date: '2025-01-05', severity: 'Medium', status: 'Closed', lead: 'u3', desc: 'Utility power failure lasting 4 hours. Generator activated successfully. No data loss.', resolution: 'UPS and generator performed as expected. Added monitoring alerts.' },
      { id: 'inc2', title: 'Phishing Campaign Detected', date: '2025-02-10', severity: 'High', status: 'Closed', lead: 'u3', desc: 'Targeted phishing emails sent to finance team. 2 users clicked links.', resolution: 'Credentials reset, additional training deployed, email filters updated.' },
    ],
    equipment: [],
    customQuestions: [],
  }
}
