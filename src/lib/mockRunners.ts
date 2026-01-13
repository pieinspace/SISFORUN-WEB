// Unified mock runner data with TNI ranks
export interface Runner {
  id: string;
  name: string;
  rank: string;
  email: string;
  totalSessions: number;
  totalDistance: number;
  targetStatus: "achieved" | "in_progress" | "not_started";
  joinDate: string;
  distance?: number;
  time?: string;
  pace?: string;
  achievedDate?: string;
  validationStatus?: "validated" | "pending";
}

export const MOCK_RUNNERS: Runner[] = [
  {
    id: "RUN-2024-001",
    name: "Mayor Budi Hartono",
    rank: "Mayor",
    email: "budi.hartono@tni.mil.id",
    totalSessions: 6,
    totalDistance: 87.5,
    targetStatus: "achieved",
    joinDate: "01 Des 2025",
    distance: 14.52,
    time: "1:23:45",
    pace: "5:45/km",
    achievedDate: "09 Jan 2026",
    validationStatus: "validated",
  },
  {
    id: "RUN-2024-002",
    name: "Letda Rinto Wijaya",
    rank: "Letda",
    email: "rinto.wijaya@tni.mil.id",
    totalSessions: 5,
    totalDistance: 65.2,
    targetStatus: "achieved",
    joinDate: "15 Nov 2025",
    distance: 14.08,
    time: "1:27:12",
    pace: "6:12/km",
    achievedDate: "09 Jan 2026",
    validationStatus: "validated",
  },
  {
    id: "RUN-2024-003",
    name: "Lettu Agus Supriyanto",
    rank: "Lettu",
    email: "agus.supriyanto@tni.mil.id",
    totalSessions: 4,
    totalDistance: 52.8,
    targetStatus: "in_progress",
    joinDate: "20 Des 2025",
    distance: 14.33,
    time: "1:25:18",
    pace: "5:58/km",
    achievedDate: "08 Jan 2026",
    validationStatus: "pending",
  },
  {
    id: "RUN-2024-004",
    name: "Kapten Siti Nurhaliza",
    rank: "Kapten",
    email: "siti.nurhaliza@tni.mil.id",
    totalSessions: 7,
    totalDistance: 92.4,
    targetStatus: "achieved",
    joinDate: "05 Okt 2025",
    distance: 15.21,
    time: "1:23:36",
    pace: "5:30/km",
    achievedDate: "08 Jan 2026",
    validationStatus: "validated",
  },
  {
    id: "RUN-2024-005",
    name: "Sersan Mayor Hendra",
    rank: "Sersan Mayor",
    email: "hendra@tni.mil.id",
    totalSessions: 5,
    totalDistance: 70.6,
    targetStatus: "in_progress",
    joinDate: "28 Des 2025",
    distance: 14.01,
    time: "1:29:50",
    pace: "6:25/km",
    achievedDate: "07 Jan 2026",
    validationStatus: "validated",
  },
  {
    id: "RUN-2024-006",
    name: "Sersan Adi Pratama",
    rank: "Sersan",
    email: "adi.pratama@tni.mil.id",
    totalSessions: 3,
    totalDistance: 42.3,
    targetStatus: "not_started",
    joinDate: "02 Jan 2026",
    distance: 8.5,
    pace: "6:30/km",
    validationStatus: "pending",
  },
  {
    id: "RUN-2024-007",
    name: "Kopral Endang Sutisna",
    rank: "Kopral",
    email: "endang.sutisna@tni.mil.id",
    totalSessions: 6,
    totalDistance: 84.8,
    targetStatus: "achieved",
    joinDate: "01 Sep 2025",
    distance: 16.45,
    time: "1:28:22",
    pace: "5:22/km",
    achievedDate: "06 Jan 2026",
    validationStatus: "validated",
  },
  {
    id: "RUN-2024-008",
    name: "Prajurit Bambang Irawan",
    rank: "Prajurit",
    email: "bambang.irawan@tni.mil.id",
    totalSessions: 4,
    totalDistance: 58.2,
    targetStatus: "in_progress",
    joinDate: "10 Nov 2025",
    distance: 14.88,
    time: "1:31:15",
    pace: "6:08/km",
    validationStatus: "pending",
  },
];
