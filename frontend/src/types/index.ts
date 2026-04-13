export interface Lot {
  id: number;
  lot_uid: string;
  warehouse_id: number;
  storage_date: string;
  status: string;
}

export interface SensorReading {
  id: number;
  warehouse_id: number;
  temperature: number;
  humidity: number;
  recorded_at: string;
}

export interface Alert {
  id: number;
  warehouse_id: number;
  lot_id: number | null;
  alert_type: string;
  message: string;
  email_sent: boolean;
  created_at: string;
}
