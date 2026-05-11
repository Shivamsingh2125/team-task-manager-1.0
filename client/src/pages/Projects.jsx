import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, Edit, Users, FolderKanban } from 'lucide-react';
import { motion } from 'framer-motion';

const Projects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectTasks, setProjectTasks] = useState([]);
  const [newProject, setNewProject] = useState({ title: '', description: '', members: [] });
  const [joinCode, setJoinCode] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get('/api/projects');
      setProjects(response.data);
    } catch (err) {
      console.error('Failed to fetch projects', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/projects', newProject);
      fetchProjects();
      setShowModal(false);
      setNewProject({ title: '', description: '', members: [] });
    } catch (err) {
      alert('Failed to create project');
    }
  };

  const handleJoinProject = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/projects/join', { joinCode });
      fetchProjects();
      setShowJoinModal(false);
      setJoinCode('');
      alert('Successfully joined project!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to join project');
    }
  };

  const fetchProjectTasks = async (projectId) => {
    try {
      const response = await axios.get('/api/tasks');
      const filteredTasks = response.data.filter(task => task.project?._id === projectId);
      setProjectTasks(filteredTasks);
    } catch (err) {
      console.error('Failed to fetch tasks', err);
    }
  };

  const handleGenerateCode = async (projectId) => {
    try {
      await axios.put(`/api/projects/${projectId}/generate-code`);
      fetchProjects();
    } catch (err) {
      alert('Failed to generate code');
    }
  };

  const handleDeleteProject = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await axios.delete(`/api/projects/${id}`);
        fetchProjects();
      } catch (err) {
        alert('Failed to delete project');
      }
    }
  };

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      <header className="flex justify-between items-center" style={{ marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Projects</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage your team projects and members.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowJoinModal(true)}
            className="flex items-center gap-2" 
            style={{
              background: 'var(--glass)',
              padding: '12px 24px',
              borderRadius: '12px',
              fontWeight: 600,
              color: 'white',
              border: '1px solid var(--border)'
            }}
          >
            <Users size={20} /> Join Project
          </button>
          {user?.role === 'Admin' && (
            <button 
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2" 
              style={{
                background: 'var(--primary)',
                padding: '12px 24px',
                borderRadius: '12px',
                fontWeight: 600,
                color: 'white'
              }}
            >
              <Plus size={20} /> Create New Project
            </button>
          )}
        </div>
      </header>

      {loading ? (
        <p>Loading projects...</p>
      ) : projects.length === 0 ? (
        <div className="glass-card" style={{ padding: '80px', textAlign: 'center' }}>
          <FolderKanban size={48} style={{ color: 'var(--text-muted)', marginBottom: '20px' }} />
          <h3>No projects found</h3>
          <p style={{ color: 'var(--text-muted)' }}>Get started by creating your first project.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {projects.map((project) => (
            <motion.div 
              key={project._id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card" 
              style={{ padding: '24px' }}
            >
              <div className="flex justify-between items-start" style={{ marginBottom: '15px' }}>
                <h3 style={{ fontSize: '1.25rem' }}>{project.title}</h3>
                <div className="flex gap-2">
                  {user?.role === 'Admin' && (
                    <button 
                      onClick={() => {
                        setSelectedProject(project);
                        fetchProjectTasks(project._id);
                        setShowMembersModal(true);
                      }}
                      className="icon-btn" 
                      title="View Members"
                    >
                      <Users size={16} />
                    </button>
                  )}
                  {user?.role === 'Admin' && (
                    <>
                      <button className="icon-btn"><Edit size={16} /></button>
                      <button onClick={() => handleDeleteProject(project._id)} className="icon-btn danger"><Trash2 size={16} /></button>
                    </>
                  )}
                </div>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px', minHeight: '60px' }}>
                {project.description}
              </p>
              <div className="flex items-center justify-between" style={{ borderTop: '1px solid var(--border)', paddingTop: '15px' }}>
                <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  <Users size={16} />
                  <span>{project.members.length} Members</span>
                </div>
                {user?.role === 'Admin' && (
                  project.joinCode ? (
                    <div style={{ fontSize: '0.8rem', background: 'var(--glass)', padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      Code: <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{project.joinCode}</span>
                      <button onClick={() => handleGenerateCode(project._id)} title="Refresh Code" style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>↺</button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleGenerateCode(project._id)}
                      style={{ fontSize: '0.8rem', color: 'var(--primary)', textDecoration: 'underline' }}
                    >
                      Generate Code
                    </button>
                  )
                )}
                <button style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem' }}>View Tasks</button>
              </div>
            </motion.div>
          ))}
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
            <h2 style={{ marginBottom: '20px' }}>Create Project</h2>
            <form onSubmit={handleCreateProject}>
              <div style={{ marginBottom: '15px' }}>
                <label className="label">Project Title</label>
                <input 
                  type="text" 
                  className="input" 
                  value={newProject.title}
                  onChange={(e) => setNewProject({...newProject, title: e.target.value})}
                  required 
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label className="label">Description</label>
                <textarea 
                  className="input" 
                  rows="4"
                  value={newProject.description}
                  onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                  required 
                ></textarea>
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost">Cancel</button>
                <button type="submit" className="btn btn-primary">Create Project</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      {showJoinModal && (
        <div className="modal-overlay">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card modal-content" 
            style={{ width: '100%', maxWidth: '400px', padding: '30px' }}
          >
            <h2 style={{ marginBottom: '10px' }}>Join Project</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '0.9rem' }}>
              Enter the join code provided by your team administrator.
            </p>
            <form onSubmit={handleJoinProject}>
              <div style={{ marginBottom: '20px' }}>
                <label className="label">Join Code</label>
                <input 
                  type="text" 
                  className="input" 
                  placeholder="E.g. X5Y7Z2"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  required 
                />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowJoinModal(false)} className="btn btn-ghost">Cancel</button>
                <button type="submit" className="btn btn-primary">Join Team</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      {showMembersModal && selectedProject && (
        <div className="modal-overlay">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card modal-content" 
            style={{ width: '100%', maxWidth: '500px', padding: '30px' }}
          >
            <div className="flex justify-between items-center" style={{ marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.5rem' }}>Team Members</h2>
              <button onClick={() => setShowMembersModal(false)} className="btn btn-ghost" style={{ padding: '5px' }}>✕</button>
            </div>
            <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '0.9rem' }}>
              Project: <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{selectedProject.title}</span>
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', overflowY: 'auto', paddingRight: '10px' }}>
              <div style={{ padding: '12px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                <div className="flex items-center gap-3">
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>
                    {selectedProject.owner.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {selectedProject.owner.name}
                      <span style={{ fontSize: '0.7rem', padding: '2px 8px', background: 'var(--primary)', borderRadius: '10px', color: 'white' }}>Admin</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{selectedProject.owner.email}</div>
                  </div>
                </div>
              </div>

              {selectedProject.members.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 20px', border: '2px dashed var(--border)', borderRadius: '12px' }}>
                  <p>No members have joined yet.</p>
                  <p style={{ fontSize: '0.8rem' }}>Share the join code with your team!</p>
                </div>
              ) : (
                selectedProject.members.map((member) => (
                  <div key={member._id} className="flex items-center gap-3" style={{ background: 'var(--glass)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--glass)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-main)', fontWeight: 700, border: '1px solid var(--border)' }}>
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600 }}>{member.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{member.email}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)' }}>
                        {projectTasks.filter(t => t.assignedTo?._id === member._id).length}
                      </div>
                      <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Tasks</div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="flex justify-end mt-6" style={{ marginTop: '20px' }}>
              <button onClick={() => setShowMembersModal(false)} className="btn btn-primary" style={{ width: '100%' }}>Done</button>
            </div>
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
        .icon-btn {
          background: var(--glass); padding: 8px; border-radius: 8px; color: var(--text-muted);
        }
        .icon-btn:hover { color: var(--text-main); background: var(--border); }
        .icon-btn.danger:hover { color: var(--danger); }
        .btn { padding: 10px 20px; border-radius: 10px; font-weight: 600; transition: all 0.3s; }
        .btn-ghost { background: transparent; color: var(--text-muted); }
        .btn-ghost:hover { background: var(--glass); color: var(--text-main); }
        .btn-primary { background: var(--primary); color: white; }
        .btn-primary:hover { background: var(--primary-hover); }
      `}} />
    </div>
  );
};

export default Projects;
