import { writable, derived } from 'svelte/store';

interface LoadingState {
  isLoading: boolean;
  progress: number;
  stage: string;
  substage?: string;
}

interface LoadingTask {
  id: string;
  name: string;
  weight: number;
  completed: boolean;
}

// Global loading state
export const loadingState = writable<LoadingState>({
  isLoading: false,
  progress: 0,
  stage: 'Ready',
  substage: undefined
});

// Loading tasks queue
export const loadingTasks = writable<LoadingTask[]>([]);

// Derived store for overall progress
export const overallProgress = derived(
  [loadingState, loadingTasks],
  ([state, tasks]) => {
    if (tasks.length === 0) return state.progress;
    
    const totalWeight = tasks.reduce((sum, task) => sum + task.weight, 0);
    const completedWeight = tasks
      .filter(task => task.completed)
      .reduce((sum, task) => sum + task.weight, 0);
    
    return totalWeight > 0 ? (completedWeight / totalWeight) * 100 : 0;
  }
);

// Loading manager functions
export const loadingManager = {
  start(stage: string, substage?: string) {
    loadingState.update(state => ({
      ...state,
      isLoading: true,
      stage,
      substage,
      progress: 0
    }));
  },

  updateProgress(progress: number, substage?: string) {
    loadingState.update(state => ({
      ...state,
      progress: Math.min(100, Math.max(0, progress)),
      substage: substage || state.substage
    }));
  },

  setStage(stage: string, substage?: string) {
    loadingState.update(state => ({
      ...state,
      stage,
      substage
    }));
  },

  addTask(id: string, name: string, weight: number = 1) {
    loadingTasks.update(tasks => [
      ...tasks.filter(task => task.id !== id),
      { id, name, weight, completed: false }
    ]);
  },

  completeTask(id: string) {
    loadingTasks.update(tasks =>
      tasks.map(task =>
        task.id === id ? { ...task, completed: true } : task
      )
    );
  },

  finish() {
    loadingState.update(state => ({
      ...state,
      isLoading: false,
      progress: 100,
      stage: 'Ready',
      substage: undefined
    }));
    loadingTasks.set([]);
  },

  // Quick loading for short operations
  quickLoad(stage: string, duration: number = 1000) {
    this.start(stage);
    
    const steps = 20;
    const stepDuration = duration / steps;
    
    for (let i = 0; i <= steps; i++) {
      setTimeout(() => {
        const progress = (i / steps) * 100;
        this.updateProgress(progress);
        
        if (i === steps) {
          setTimeout(() => this.finish(), 200);
        }
      }, i * stepDuration);
    }
  }
};

// Utility for async operations with loading
export async function withLoading<T>(
  operation: () => Promise<T>,
  stage: string,
  substage?: string
): Promise<T> {
  loadingManager.start(stage, substage);
  
  try {
    const result = await operation();
    loadingManager.finish();
    return result;
  } catch (error) {
    loadingManager.finish();
    throw error;
  }
}
