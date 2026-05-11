import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Plus, CheckSquare, Clock, AlertCircle, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

const Tasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]); // This would be fetched in a real app
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState({ 
    title: '', description: '', project: '', assignedTo: '', dueDate: '', status: 'To Do' 
  });

  useEffect(() => {
    fetchTasks();
    if (user?.role === 'Admin') {
      fetchProjects();
      // fetchUsers(); // Mocking for now
    }
  }, []);

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

  const fetchProjects = async () => {
    try {
      const response = await axios.get('/api/projects');
      setProjects(response.data);
    } catch (err) {
      console.error('Failed to fetch projects', err);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/tasks', newTask);
      fetchTasks();
      setShowModal(false);
      setNewTask({ title: '', description: '', project: '', assignedTo: '', dueDate: '', status: 'To Do' });
    } catch (err) {
      alert('Failed to create task');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.patch(`/api/tasks/${id}`, { status: newStatus });
      fetchTasks();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'var(--success)';
      case 'In Progress': return 'var(--warning)';
      default: return 'var(--text-muted)';
    }
  };

  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.project?.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      <header className="flex justify-between items-center" style={{ marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Tasks</h1>
          <p style={{ color: 'var(--text-muted)' }}>Track and manage your team assignments.</p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 btn btn-ghost" style={{ background: 'var(--glass)', padding: '0 15px' }}>
            <Filter size={18} />
            <input 
              type="text" 
              placeholder="Search tasks..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'white', padding: '10px 0' }}
            />
          </div>
          {user?.role === 'Admin' && (
            <button 
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 btn btn-primary"
            >
              <Plus size={20} /> New Task
            </button>
          )}
        </div>
      </header>

      {loading ? (
        <p>Loading tasks...</p>
      ) : (
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--glass)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '20px' }}>Task</th>
                <th style={{ padding: '20px' }}>Project</th>
                <th style={{ padding: '20px' }}>Status</th>
                <th style={{ padding: '20px' }}>Due Date</th>
                <th style={{ padding: '20px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task) => (
                <tr key={task._id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '20px' }}>
                    <div style={{ fontWeight: 600 }}>{task.title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{task.description.substring(0, 40)}...</div>
                  </td>
                  <td style={{ padding: '20px' }}>
                    <span style={{ fontSize: '0.9rem', padding: '4px 10px', borderRadius: '8px', background: 'var(--glass)' }}>
                      {task.project?.title}
                    </span>
                  </td>
                  <td style={{ padding: '20px' }}>
                    <div className="flex items-center gap-2" style={{ color: getStatusColor(task.status) }}>
                      {task.status === 'Completed' ? <CheckSquare size={16} /> : <Clock size={16} />}
                      <span style={{ fontWeight: 500 }}>{task.status}</span>
                    </div>
                  </td>
                  <td style={{ padding: '20px', color: 'var(--text-muted)' }}>
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
                  </td>
                  <td style={{ padding: '20px' }}>
                    <select 
                      value={task.status}
                      onChange={(e) => handleStatusChange(task._id, e.target.value)}
                      style={{
                        padding: '6px 12px',
                        background: 'var(--bg-dark)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        color: 'white',
                        fontSize: '0.8rem'
                      }}
                    >
                      <option value="To Do">To Do</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {tasks.length === 0 && (
            <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No tasks assigned.</p>
          )}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card modal-content" 
            style={{ width: '100%', maxWidth: '500px', padding: '30px' }}
          >
            <h2 style={{ marginBottom: '20px' }}>Create Task</h2>
            <form onSubmit={handleCreateTask}>
              <div style={{ marginBottom: '15px' }}>
                <label className="label">Task Title</label>
                <input 
                  type="text" 
                  className="input" 
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  required 
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label className="label">Project</label>
                <select 
                  className="input"
                  value={newTask.project}
                  onChange={(e) => setNewTask({...newTask, project: e.target.value})}
                  required
                >
                  <option value="">Select Project</option>
                  {projects.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label className="label">Due Date</label>
                <input 
                  type="date" 
                  className="input"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label className="label">Description</label>
                <textarea 
                  className="input" 
                  rows="3"
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  required 
                ></textarea>
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost">Cancel</button>
                <button type="submit" className="btn btn-primary">Create Task</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .label { display: block; margin-bottom: 8px; color: var(--text-muted); font-size: 0.9rem; }
        .input {
          width: 100%; padding: 12px; background: var(--glass); border: 1px solid var(--border);
          border-radius: 10px; color: white; font-family: inherit;
        }
        .modal-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7);
          display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px;
        }
        .btn { padding: 10px 20px; border-radius: 10px; font-weight: 600; transition: all 0.3s; }
        .btn-ghost { background: transparent; color: var(--text-muted); }
        .btn-primary { background: var(--primary); color: white; }
      `}} />
    </div>
  );
};

export default Tasks;
