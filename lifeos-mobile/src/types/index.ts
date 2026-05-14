export interface User {
  _id: string;
  name: string;
  email: string;
  token: string;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  dueAt?: string;
  priority: 'Low' | 'Medium' | 'High';
  type: 'task' | 'habit' | 'goal';
  recurring?: 'daily' | 'weekly' | 'monthly' | null;
  completed: boolean;
  source: 'manual' | 'voice' | 'chat' | 'ai';
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  extractedTasks?: Task[];
}

