export interface Farmer {
  id?: string;
  user_id?: string;
  name: string;
  email?: string;
  location: string;
  address: string;
  crop_type: string;
  lat: number;
  lon: number;
  created_at?: string;
  profile_image_url?: string;
  updated_at?: string;
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  description: string;
  windSpeed: number;
  rainfall: number;
  icon: string;
  cityName: string;
}

export interface NDVIData {
  ndvi: number;
  health: string;
  color: string;
  classification: string;
  timestamp: string;
}

export interface AIAnalysis {
  recommendations: string[];
  alert_level: 'normal' | 'warning' | 'critical';
  irrigation_needed: boolean;
  health_status: string;
  score: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

export const CROP_TYPES = [
  'wheat', 'rice', 'paddy', 'cotton', 'sugarcane', 'maize', 
  'soybean', 'groundnut', 'sunflower', 'tomato', 'onion', 
  'potato', 'chilli', 'turmeric', 'banana', 'mango'
];
