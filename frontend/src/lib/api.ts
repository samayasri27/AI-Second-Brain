// Real API integration with FastAPI backend

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface DashboardStats {
  totalDocs: number;
  totalTasks: number;
  upcomingDeadlines: number;
  recentTopics: string[];
}

export interface Activity {
  id: string;
  type: 'upload' | 'task' | 'chat';
  title: string;
  timestamp: string;
  description?: string;
}

export interface Task {
  id: string;
  title: string;
  dueDate: string;
  status: 'pending' | 'completed' | 'overdue';
  linkedDoc?: string;
  category: 'today' | 'upcoming' | 'overdue' | 'done';
  document_id?: number;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  category: 'projects' | 'areas' | 'resources' | 'archives';
  uploadedAt: string;
  size?: string;
  path?: string;
  tags?: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Document[];
  timestamp: string;
}

export interface UserProfile {
  name: string;
  template: string;
  focusAreas: string[];
  progress: {
    docsProcessed: number;
    tasksCompleted: number;
    chatSessions: number;
  };
}

export interface Insight {
  id: string;
  type: 'reflection' | 'suggestion' | 'pattern' | 'achievement';
  title: string;
  content: string;
  date: string;
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'topic' | 'document' | 'task';
  connections: number;
  x?: number;
  y?: number;
}

// Helper function to categorize tasks
function categorizeTask(task: any): Task['category'] {
  if (task.status === 'completed') return 'done';
  
  const dueDate = new Date(task.due_date);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  if (dueDate < today) return 'overdue';
  if (dueDate < tomorrow) return 'today';
  return 'upcoming';
}

// API functions
export const api = {
  getDashboard: async (): Promise<{ stats: DashboardStats; activities: Activity[] }> => {
    const response = await fetch(`${API_BASE_URL}/dashboard/stats`);
    if (!response.ok) throw new Error('Failed to fetch dashboard data');
    return response.json();
  },

  getTasks: async (): Promise<Task[]> => {
    const response = await fetch(`${API_BASE_URL}/tasks`);
    if (!response.ok) throw new Error('Failed to fetch tasks');
    const tasks = await response.json();
    
    return tasks.map((task: any) => ({
      id: task.id.toString(),
      title: task.title,
      dueDate: task.due_date,
      status: task.status,
      linkedDoc: task.document_id ? `doc_${task.document_id}` : undefined,
      category: categorizeTask(task),
      document_id: task.document_id
    }));
  },

  updateTask: async (id: string, updates: Partial<Task>): Promise<Task> => {
    const response = await fetch(`${API_BASE_URL}/task/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: updates.status })
    });
    
    if (!response.ok) throw new Error('Failed to update task');
    const task = await response.json();
    
    return {
      id: task.id.toString(),
      title: task.title,
      dueDate: task.due_date,
      status: task.status,
      linkedDoc: task.document_id ? `doc_${task.document_id}` : undefined,
      category: categorizeTask(task),
      document_id: task.document_id
    };
  },

  getDocuments: async (): Promise<Document[]> => {
    const response = await fetch(`${API_BASE_URL}/documents`);
    if (!response.ok) throw new Error('Failed to fetch documents');
    return response.json();
  },

  uploadDocument: async (file: File, category: Document['category']): Promise<Document> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', file.name.split('.')[0]);
      
      console.log('Uploading to:', `${API_BASE_URL}/upload_doc`);
      console.log('File:', file.name, 'Size:', file.size);
      
      const response = await fetch(`${API_BASE_URL}/upload_doc`, {
        method: 'POST',
        body: formData
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const error = await response.text();
        console.error('Upload error:', error);
        throw new Error(`Failed to upload document: ${error}`);
      }
      
      const result = await response.json();
      console.log('Upload result:', result);
      
      // Map PARA type to category
      const paraTypeMap: Record<string, Document['category']> = {
        'Projects': 'projects',
        'Areas': 'areas',
        'Resources': 'resources',
        'Archives': 'archives'
      };
      
      return {
        id: result.doc_id.toString(),
        name: result.title,
        type: file.name.split('.').pop() || 'unknown',
        category: paraTypeMap[result.para_type] || 'resources',
        uploadedAt: new Date().toISOString().split('T')[0],
        size: `${(file.size / 1024).toFixed(1)} KB`,
        tags: result.topics || []
      };
    } catch (error) {
      console.error('Upload exception:', error);
      throw error;
    }
  },

  askBrain: async (question: string): Promise<ChatMessage> => {
    const response = await fetch(`${API_BASE_URL}/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question })
    });
    
    if (!response.ok) throw new Error('Failed to get response');
    const result = await response.json();
    
    // Fetch source documents if available
    let sources: Document[] = [];
    if (result.sources && result.sources.length > 0) {
      const allDocs = await api.getDocuments();
      sources = allDocs.filter(doc => 
        result.sources.includes(parseInt(doc.id))
      );
    }
    
    return {
      id: Date.now().toString(),
      role: 'assistant',
      content: result.answer,
      sources,
      timestamp: new Date().toISOString()
    };
  },

  getProfile: async (): Promise<UserProfile> => {
    // This would come from backend user management in future
    // For now, calculate from existing data
    const [docs, tasks] = await Promise.all([
      api.getDocuments(),
      api.getTasks()
    ]);
    
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    
    return {
      name: 'User',
      template: 'Student Template',
      focusAreas: ['Machine Learning', 'Web Development', 'Product Design', 'Research Methods'],
      progress: {
        docsProcessed: docs.length,
        tasksCompleted: completedTasks,
        chatSessions: 0 // Would track this in backend
      }
    };
  },

  ingestFolder: async (folderPath?: string): Promise<any> => {
    const formData = new FormData();
    if (folderPath) {
      formData.append('folder_path', folderPath);
    }
    
    const response = await fetch(`${API_BASE_URL}/ingest/folder`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) throw new Error('Failed to ingest folder');
    return response.json();
  },

  previewFolderIngestion: async (folderPath?: string): Promise<any> => {
    const url = new URL(`${API_BASE_URL}/ingest/preview`);
    if (folderPath) {
      url.searchParams.append('folder_path', folderPath);
    }
    
    const response = await fetch(url.toString());
    if (!response.ok) throw new Error('Failed to preview folder');
    return response.json();
  },

  getInsights: async (): Promise<any[]> => {
    const response = await fetch(`${API_BASE_URL}/insights`);
    if (!response.ok) throw new Error('Failed to fetch insights');
    return response.json();
  }
};
