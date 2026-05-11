import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  ListTodo, 
  Calendar,
  Plus
} from 'lucide-react';
import { motion } from 'framer-motion';

const StatCard = ({ icon: Icon, title, value, color, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="glass-card" 
    style={{ padding: '24px', flex: 1, minWidth: '200px' }}
  >
    <div className="flex items-center gap-4">
      <div style={{ 
        padding: '12px', 
        borderRadius: '12px', 
        background: `rgba(${color}, 0.1)`, 
        color: `rgb(${color})` 
      }}>
        <Icon size={24} />
      </div>
      <div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{title}</p>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 700 }}>{value}</h2>
      </div>
    </div>
  </motion.div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get('/api/tasks');
        setTasks(response.data);
      } catch (err) {
        console.error('Failed to fetch tasks', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'Completed').length,
    pending: tasks.filter(t => t.status !== 'Completed').length,
    overdue: tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Completed').length
  };

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      <header className="flex justify-between items-center" style={{ marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>
            Hello, <span className="gradient-text">{user?.name.split(' ')[0]}</span> 👋
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Here's what's happening with your projects today.</p>
        </div>
        {user?.role === 'Admin' && (
          <button className="flex items-center gap-2" style={{
            background: 'var(--primary)',
            padding: '12px 24px',
            borderRadius: '12px',
            fontWeight: 600,
            color: 'white'
          }}>
            <Plus size={20} /> Create Project
          </button>
        )}
      </header>

      <div className="flex gap-4" style={{ flexWrap: 'wrap', marginBottom: '40px' }}>
        <StatCard icon={ListTodo} title="Total Tasks" value={stats.total} color="99, 102, 241" delay={0.1} />
        <StatCard icon={CheckCircle} title="Completed" value={stats.completed} color="16, 185, 129" delay={0.2} />
        <StatCard icon={Clock} title="Pending" value={stats.pending} color="245, 158, 11" delay={0.3} />
        <StatCard icon={AlertCircle} title="Overdue" value={stats.overdue} color="239, 68, 68" delay={0.4} />
      </div>

      <div className="flex gap-6" style={{ flexDirection: window.innerWidth < 1000 ? 'column' : 'row' }}>
        <div style={{ flex: 2 }}>
          <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Calendar size={20} className="primary" /> Your Recent Tasks
          </h3>
          <div className="glass-card" style={{ padding: '20px' }}>
            {loading ? (
              <p>Loading tasks...</p>
            ) : tasks.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>No tasks found.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {tasks.slice(0, 5).map((task) => (
                  <div key={task._id} className="task-item" style={{
                    padding: '15px',
                    borderRadius: '12px',
                    background: 'var(--glass)',
                    display: 'flex',
                    justifyContent: 'between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <h4 style={{ marginBottom: '4px' }}>{task.title}</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{task.project?.title}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span style={{ 
                        fontSize: '0.75rem', 
                        padding: '4px 10px', 
                        borderRadius: '20px',
                        background: task.status === 'Completed' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                        color: task.status === 'Completed' ? 'var(--success)' : 'var(--warning)'
                      }}>
                        {task.status}
                      </span>
                      {task.dueDate && (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <h3 style={{ marginBottom: '20px' }}>Quick Actions</h3>
          <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button style={{ 
              padding: '12px', 
              textAlign: 'left', 
              background: 'var(--glass)', 
              borderRadius: '10px', 
              color: 'var(--text-main)',
              width: '100%'
            }}>
              View All Projects
            </button>
            <button style={{ 
              padding: '12px', 
              textAlign: 'left', 
              background: 'var(--glass)', 
              borderRadius: '10px', 
              color: 'var(--text-main)',
              width: '100%'
            }}>
              Team Members
            </button>
            <button style={{ 
              padding: '12px', 
              textAlign: 'left', 
              background: 'var(--glass)', 
              borderRadius: '10px', 
              color: 'var(--text-main)',
              width: '100%'
            }}>
              Activity Logs
            </button>
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        .primary { color: var(--primary); }
        .task-item { transition: transform 0.2s ease; cursor: pointer; }
        .task-item:hover { transform: translateX(5px); background: rgba(255, 255, 255, 0.1) !important; }
      `}} />
    </div>
  );
};

export default Dashboard;
