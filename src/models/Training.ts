export interface Training {
  trainingid: string;
  storenumber: number;
  title: string;
  description?: string;
  category?: string;
  estimatedminutes: number;
  isactive: boolean;
  createdon?: string;
}

export interface CreateTrainingRequest {
  storenumber: number;
  title: string;
  description?: string;
  category?: string;
  estimatedminutes: number;
  isactive: boolean;
}

export interface UpdateTrainingRequest {
  storenumber?: number;
  title?: string;
  description?: string;
  category?: string;
  estimatedminutes?: number;
  isactive?: boolean;
}
