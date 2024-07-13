export type Computer = {
  id: number;
  mac: string;
  name: string;
  info: ComputerInfo;
  updatedAt: string;
}

export type ComputerInfo = {
  hostname: string;
  mac: string;
  ip: string;
  arch: string[];
  machine: string;
  processor: string;
  system: string;
  release: string;
  version: string;
  cpu: CPU;
  memory: Memory;
  disks: Disk[];
  boot_time: number;
  users: User[];
  sensors: Sensors;
  linux: Linux;
  system_full: string;
  laboratoryCode?: string;
}

export type CPU = {
  count: number;
  min_freq: number;
  max_freq: number;
}

export type Disk = {
  device: string;
  mountpoint: string;
  type: string;
  total: number;
  used: number;
  free: number;
}

export type Linux = {
  name: string;
  id: string;
  pretty_name: string;
  version_id: string;
  version: string;
  version_codename: string;
  id_like: string;
  home_url: string;
  support_url: string;
  bug_report_url: string;
  privacy_policy_url: string;
  ubuntu_codename: string;
}

export type Memory = {
  total: number;
  total_swap: number;
}

export type Sensors = {
  [key: string]: { [key: string]: TempInfo };
}

export type TempInfo = {
  current: number;
  high: number | null;
  critical: number | null;
}

export type User = {
  name: string;
  terminal: string;
  host: string;
  started: number;
  pid: number;
}
