export interface User {
  id: string; fn: string; ln: string; email: string; phone: string;
  title: string; role: string; dept: string; active: boolean;
}

export interface Role { id: string; label: string; perms: string[]; }

export interface Process {
  id: string; name: string; pri: string;
  rto: 'Same Day' | '1 Day' | '2-5 Days' | '6+ Days';
  rpo: string; mtd: string; strat: string;
  status: string; deps: string[]; workaround: string;
}

export interface Department {
  id: string; name: string; lead: string;
  headcount: number; processes: Process[];
}

export interface Technology {
  id: string; name: string; tier: string; type: string;
  rpo: string; vendor: string; dept: string; status: string;
}

export interface Vendor {
  id: string; name: string; critical: boolean; sla: string;
  contact: string; phone: string; email: string; contract: string;
}

export interface Threat {
  id: string; name: string; cat: string;
  like: number; impact: number; rpn: number; trend: string;
}

export interface Assessment {
  id: string; name: string; status: string;
  like: number; impact: number; rpn: number;
  miti: string; date: string; reviewer: string;
}

export interface BIA {
  id: string; dept: string; process: string;
  finImpact: number; opsImpact: string;
  repImpact: string; regImpact: string; notes: string;
}

export interface Incident {
  id: string; title: string; date: string; severity: string;
  status: string; lead: string; desc: string; resolution: string;
}

export interface Issue {
  id: string; title: string; status: string; pri: string;
  dept: string; assigned: string; created: string; desc: string;
}

export interface Location {
  id: string; name: string; addr: string; type: string;
  capacity: number; status: string;
}

export interface Group {
  id: string; name: string; desc: string; members: string[];
}

export interface Training {
  id: string; name: string; type: string; freq: string;
  last: string; next: string; status: string; attendees: string[];
}

export interface CriticalDate {
  id: string; name: string; date: string; dept: string; type: string;
}

export interface TaskPhases {
  early: string[]; immed: string[]; short: string[]; long: string[];
}

export interface Company {
  name: string; addr: string; city: string; state: string;
  zip: string; phone: string; industry: string;
  employees: number; fiscalStart: string;
}

export interface CustomQuestion { id: string; q: string; }

export interface DocFile {
  id: string; name: string; size: string; date: string; author: string;
}

export interface DocFolder {
  id: string; name: string; files: DocFile[];
}

export interface Equipment {
  id: string; name: string; type: string; serial: string;
  location: string; status: string; assigned: string;
}

export interface AppState {
  company: Company;
  users: User[];
  departments: Department[];
  technologies: Technology[];
  vendors: Vendor[];
  threats: Threat[];
  assessments: Assessment[];
  bia: BIA[];
  locations: Location[];
  groups: Group[];
  documents: { folders: DocFolder[] };
  training: Training[];
  critDates: CriticalDate[];
  tasks: TaskPhases;
  issues: Issue[];
  incidents: Incident[];
  equipment: Equipment[];
  customQuestions: CustomQuestion[];
}

export interface ModalState {
  show: boolean;
  type: string | null;
  data: any;
}

export interface NotifItem {
  id: number;
  msg: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

export interface AiMessage {
  role: 'user' | 'ai';
  content: string;
}
