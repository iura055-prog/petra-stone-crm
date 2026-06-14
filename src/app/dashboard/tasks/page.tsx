'use client';

import { useState } from 'react';

interface Task {
  id: number;
  title: string;
  completed: boolean;
  clientName: string;
  createdAt: string;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('petra_tasks');
      if (saved) return JSON.parse(saved);
      const defaultTasks: Task[] = [
        { id: 1, title: 'Сделать замер', completed: false, clientName: '', createdAt: new Date().toISOString().split('T')[0] },
        { id: 2, title: 'Отправить смету', completed: false, clientName: '', createdAt: new Date().toISOString().split('T')[0] },
        { id: 3, title: 'Позвонить клиенту', completed: true, clientName: '', createdAt: new Date().toISOString().split('T')[0] },
        { id: 4, title: 'Подготовить образцы камня', completed: false, clientName: '', createdAt: new Date().toISOString().split('T')[0] },
      ];
      localStorage.setItem('petra_tasks', JSON.stringify(defaultTasks));
      return defaultTasks;
    }
    return [];
  });

  const [newTitle, setNewTitle] = useState('');
  const [newClient, setNewClient] = useState('');

  const saveTasks = (t: Task[]) => {
    setTasks(t);
    localStorage.setItem('petra_tasks', JSON.stringify(t));
  };

  const toggleTask = (id: number) => {
    saveTasks(tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const addTask = () => {
    if (!newTitle.trim()) return;
    const task: Task = { id: Date.now(), title: newTitle, completed: false, clientName: newClient, createdAt: new Date().toISOString().split('T')[0] };
    saveTasks([task, ...tasks]);
    setNewTitle('');
    setNewClient('');
  };

  const deleteTask = (id: number) => saveTasks(tasks.filter((t) => t.id !== id));

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl text-[#F5F0E8] font-display" style={{ fontFamily: 'DM Serif Display, serif' }}>Задачи</h1>
          <p className="text-[#C4A882]/70 mt-1" style={{ fontFamily: 'DM Sans, sans-serif' }}>{completedCount}/{tasks.length} выполнено</p>
        </div>
      </div>

      <div className="bg-[#0F0B05] border border-[#C4A882]/10 rounded-xl p-4 mb-6 flex gap-2">
        <input className="flex-1 px-3 py-2.5 bg-[#1A1208] border border-[#C4A882]/20 rounded-lg text-[#F5F0E8] text-sm placeholder-[#C4A882]/30" placeholder="Новая задача..." value={newTitle} onChange={(e) => setNewTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addTask()} />
        <input className="w-40 px-3 py-2.5 bg-[#1A1208] border border-[#C4A882]/20 rounded-lg text-[#F5F0E8] text-sm placeholder-[#C4A882]/30" placeholder="Клиент" value={newClient} onChange={(e) => setNewClient(e.target.value)} />
        <button onClick={addTask} className="bg-[#E86C2F] text-white px-5 py-2.5 rounded-lg text-sm hover:bg-[#E86C2F]/90 transition-all">Добавить</button>
      </div>

      {tasks.length === 0 ? (
        <p className="text-[#C4A882]/40 text-center py-8">Нет задач</p>
      ) : (
        <div className="space-y-1">
          {tasks.map((task) => (
            <div key={task.id} className={`flex items-center gap-3 p-3 rounded-lg transition-all ${task.completed ? 'opacity-50' : ''}`}>
              <button onClick={() => toggleTask(task.id)} className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-all ${task.completed ? 'bg-[#E86C2F] border-[#E86C2F]' : 'border-[#C4A882]/30'}`}>
                {task.completed && <span className="text-white text-xs">✓</span>}
              </button>
              <div className="flex-1">
                <p className={`text-sm ${task.completed ? 'text-[#C4A882]/30 line-through' : 'text-[#F5F0E8]'}`}>{task.title}</p>
                {task.clientName && <p className="text-[#C4A882]/40 text-xs">{task.clientName}</p>}
              </div>
              <button onClick={() => deleteTask(task.id)} className="text-red-400/20 hover:text-red-400 text-sm">✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}