import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import supabaseData from '../services/supabaseData';

const TasksContext = createContext(null);

export const TasksProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [taskHistory, setTaskHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabaseData.getTaskCatalog();
      if (fetchError) throw fetchError;
      setTasks(data || []);
    } catch (e) {
      console.error('Failed to load tasks:', e);
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadTaskHistory = useCallback(async (userId) => {
    if (!userId) return;
    try {
      const { data, error: fetchError } = await supabaseData.getUserTaskHistory(userId);
      if (fetchError) throw fetchError;
      setTaskHistory(data || []);
    } catch (e) {
      console.error('Failed to load task history:', e);
    }
  }, []);

  const refreshTasks = useCallback(async () => {
    await loadTasks();
  }, [loadTasks]);

  const refreshTaskHistory = useCallback(async (userId) => {
    await loadTaskHistory(userId);
  }, [loadTaskHistory]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Task analytics
  const getTasksByCategory = useCallback(() => {
    const categories = {};
    tasks.forEach(task => {
      const category = task.category || 'General';
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(task);
    });
    return categories;
  }, [tasks]);

  const getTasksByPriority = useCallback(() => {
    return tasks.sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }, [tasks]);

  const getCompletedTasksToday = useCallback((userId) => {
    if (!userId) return [];
    const today = new Date().toISOString().slice(0, 10);
    return taskHistory.filter(task => 
      task.user_id === userId && 
      task.completion_date === today
    );
  }, [taskHistory]);

  const getTotalEarningsToday = useCallback((userId) => {
    const todayTasks = getCompletedTasksToday(userId);
    return todayTasks.reduce((total, task) => total + (task.earnings || 0), 0);
  }, [getCompletedTasksToday]);

  const canCompleteTask = useCallback((taskId, userId) => {
    if (!userId) return false;
    const today = new Date().toISOString().slice(0, 10);
    const alreadyCompleted = taskHistory.some(task => 
      task.user_id === userId && 
      task.app_id === taskId && 
      task.completion_date === today
    );
    return !alreadyCompleted;
  }, [taskHistory]);

  return (
    <TasksContext.Provider value={{
      tasks,
      taskHistory,
      loading,
      error,
      refreshTasks,
      refreshTaskHistory,
      loadTaskHistory,
      getTasksByCategory,
      getTasksByPriority,
      getCompletedTasksToday,
      getTotalEarningsToday,
      canCompleteTask
    }}>
      {children}
    </TasksContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TasksContext);
  if (!context) {
    throw new Error('useTasks must be used within a TasksProvider');
  }
  return context;
};
