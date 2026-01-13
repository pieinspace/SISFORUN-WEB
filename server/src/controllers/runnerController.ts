import { Request, Response } from 'express';

export const getRunners = async (_req: Request, res: Response) => {
  // Data pelari dengan pangkat TNI (sesuai dengan frontend mock data)
  const sample = [
    { id: "RUN-2024-001", name: 'Mayor Budi Hartono', rank: 'Mayor', distanceKm: 14.52, targetKm: 14.0, status: 'validated', totalDistance: 287.5, totalSessions: 45 },
    { id: "RUN-2024-002", name: 'Letda Rinto Wijaya', rank: 'Letda', distanceKm: 14.08, targetKm: 14.0, status: 'validated', totalDistance: 245.2, totalSessions: 38 },
    { id: "RUN-2024-003", name: 'Lettu Agus Supriyanto', rank: 'Lettu', distanceKm: 14.33, targetKm: 14.0, status: 'pending', totalDistance: 142.8, totalSessions: 22 },
    { id: "RUN-2024-004", name: 'Kapten Siti Nurhaliza', rank: 'Kapten', distanceKm: 15.21, targetKm: 14.0, status: 'validated', totalDistance: 312.4, totalSessions: 52 },
    { id: "RUN-2024-005", name: 'Sersan Mayor Hendra', rank: 'Sersan Mayor', distanceKm: 14.01, targetKm: 14.0, status: 'validated', totalDistance: 98.6, totalSessions: 15 },
    { id: "RUN-2024-006", name: 'Sersan Adi Pratama', rank: 'Sersan', distanceKm: 8.5, targetKm: 14.0, status: 'in_progress', totalDistance: 52.3, totalSessions: 8 },
    { id: "RUN-2024-007", name: 'Kopral Endang Sutisna', rank: 'Kopral', distanceKm: 16.45, targetKm: 14.0, status: 'validated', totalDistance: 425.8, totalSessions: 67 },
    { id: "RUN-2024-008", name: 'Prajurit Bambang Irawan', rank: 'Prajurit', distanceKm: 14.88, targetKm: 14.0, status: 'pending', totalDistance: 198.2, totalSessions: 31 }
  ];

  res.json({ data: sample });
};
