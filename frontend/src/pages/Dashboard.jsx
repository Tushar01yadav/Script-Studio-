import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { 
  PlusIcon, 
  TrashIcon, 
  ArrowRightIcon, 
  VideoCameraIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  
  // Admin-only state
  const [activeTab, setActiveTab] = useState('projects');
  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);

  // Fetch all user projects on mount
  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (err) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    setRequestsLoading(true);
    try {
      const res = await api.get('/auth/admin/requests');
      setRequests(res.data);
    } catch (err) {
      toast.error('Failed to load access requests');
    } finally {
      setRequestsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    if (user && user.email === 'admin@scriptstudio.com') {
      fetchRequests();
    }
  }, [user]);

  const handleApproveRequest = async (id) => {
    try {
      await api.post(`/auth/admin/requests/${id}/approve`);
      toast.success('User access request approved!');
      setRequests(requests.filter(r => r.id !== id));
    } catch (err) {
      toast.error('Failed to approve user');
    }
  };

  const handleRejectRequest = async (id) => {
    if (!window.confirm('Are you sure you want to reject and remove this request?')) return;
    try {
      await api.post(`/auth/admin/requests/${id}/reject`);
      toast.success('User access request rejected!');
      setRequests(requests.filter(r => r.id !== id));
    } catch (err) {
      toast.error('Failed to reject user');
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      return toast.error('Project title is required');
    }
    
    try {
      const res = await api.post('/projects', { title: newTitle });
      toast.success('Project created successfully!');
      setIsModalOpen(false);
      setNewTitle('');
      // Redirect to the transcript page for this project
      navigate(`/transcript?project=${res.data.id}`);
    } catch (err) {
      toast.error('Failed to create project');
    }
  };

  const handleDeleteProject = async (id, e) => {
    e.stopPropagation(); // Avoid triggering card click
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    
    try {
      await api.delete(`/projects/${id}`);
      toast.success('Project deleted successfully');
      setProjects(projects.filter(p => p.id !== id));
    } catch (err) {
      toast.error('Failed to delete project');
    }
  };

  const handleProjectClick = (project) => {
    // Navigate directly to transcript page for this project
    navigate(`/transcript?project=${project.id}`);
  };

  return (
    <div className="space-y-8">
      {/* Header section with Create New Button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-white">Your Workspace</h2>
          <p className="mt-1 text-sm text-gray-400">Manage, create, and refine your YouTube scripts and scene plans.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-550/10 hover:from-indigo-500 hover:to-violet-500 transition-all duration-200 w-full sm:w-auto shrink-0"
        >
          <PlusIcon className="h-5 w-5" />
          New Project
        </button>
      </div>

      {/* Admin Tab Switcher */}
      {user && user.email === 'admin@scriptstudio.com' && (
        <div className="flex border-b border-gray-800">
          <button
            onClick={() => setActiveTab('projects')}
            className={`px-6 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'projects'
                ? 'border-indigo-500 text-white font-extrabold'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Projects
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-6 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'requests'
                ? 'border-indigo-500 text-white font-extrabold'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Access Requests
            {requests.length > 0 && (
              <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-bold text-red-400 border border-red-500/30">
                {requests.length}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Conditional rendering based on active tab */}
      {activeTab === 'requests' ? (
        requestsLoading ? (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
          </div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-800 bg-[#0d1222]/30 py-24 text-center">
            <CheckIcon className="h-12 w-12 text-emerald-500 mb-4" />
            <h3 className="text-xl font-bold text-white">No pending requests</h3>
            <p className="mt-1 text-sm text-gray-400 max-w-xs">All Google sign-ins have been approved or processed.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-800 bg-[#0d1222]/80">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-800 text-xs font-bold uppercase tracking-wider text-gray-400 bg-gray-950/20">
                  <th className="p-4 sm:p-6">Name</th>
                  <th className="p-4 sm:p-6">Email Address</th>
                  <th className="p-4 sm:p-6">Requested At</th>
                  <th className="p-4 sm:p-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 text-sm text-gray-300">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-800/10 transition-colors">
                    <td className="p-4 sm:p-6 font-semibold text-white">{req.name}</td>
                    <td className="p-4 sm:p-6 font-mono text-xs">{req.email}</td>
                    <td className="p-4 sm:p-6 text-gray-400">
                      {new Date(req.created_at).toLocaleDateString()} {new Date(req.created_at).toLocaleTimeString()}
                    </td>
                    <td className="p-4 sm:p-6 text-right">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => handleApproveRequest(req.id)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 cursor-pointer transition-all animate-pulse"
                          title="Approve User Access"
                        >
                          <CheckIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleRejectRequest(req.id)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 cursor-pointer transition-all"
                          title="Reject/Remove Request"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        /* Projects List grid layout */
        loading ? (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-800 bg-[#0d1222]/30 py-24 text-center">
            <VideoCameraIcon className="h-16 w-16 text-gray-600 mb-4" />
            <h3 className="text-xl font-bold text-white">No projects found</h3>
            <p className="mt-1 text-sm text-gray-400 max-w-xs">Create your first script studio project and start generating content.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-6 flex items-center gap-2 rounded-lg bg-gray-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-700 transition-all cursor-pointer"
            >
              Create Project
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => handleProjectClick(project)}
                className="group relative cursor-pointer rounded-xl border border-gray-800/80 bg-[#0d1222]/80 p-3.5 sm:p-6 transition-all duration-300 hover:border-indigo-500/40 hover:bg-[#11172a] hover:shadow-xl hover:-translate-y-1 min-w-0"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20 group-hover:text-white transition-all">
                    <VideoCameraIcon className="h-4 w-4 sm:h-6 sm:w-6" />
                  </div>
                  <button
                    onClick={(e) => handleDeleteProject(project.id, e)}
                    className="rounded-lg p-1 text-gray-500 hover:bg-red-500/10 hover:text-red-400 transition-all cursor-pointer"
                    title="Delete Project"
                  >
                    <TrashIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                </div>

                <div className="mt-3 sm:mt-4">
                  <h3 className="truncate text-sm sm:text-lg font-bold text-white group-hover:text-indigo-400 transition-all">
                    {project.title}
                  </h3>
                  <p className="mt-0.5 sm:mt-1 truncate text-[10px] sm:text-xs text-gray-400">
                    {project.youtube_url ? project.youtube_url : 'No YouTube Link'}
                  </p>
                </div>

                <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-2 sm:items-center justify-between border-t border-gray-800/60 pt-3 sm:pt-4 text-[10px] sm:text-xs text-gray-455">
                  <span className="truncate">Updated {new Date(project.updated_at).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1 font-semibold text-indigo-400 group-hover:translate-x-1 transition-transform self-end sm:self-auto">
                    Open
                    <ArrowRightIcon className="h-3 w-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-gray-800 bg-[#0d1222] p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">Create New Project</h3>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">Project Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2.5 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  placeholder="My YouTube Video Script"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setNewTitle('');
                  }}
                  className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-semibold text-gray-300 hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white hover:from-indigo-500 hover:to-violet-500"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
