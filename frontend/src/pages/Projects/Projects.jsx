import { useState, useEffect } from 'react';
import Modal from '../../components/Modal/Modal';
import './Projects.css';

function Projects() {
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [projects, setProjects] = useState([]);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('http://localhost:5050/projects');
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const handleAddProject = () => {
    setIsAddingProject(true);
  };

  const handleCloseModal = () => {
    setIsAddingProject(false);
    setNewProject({ title: '', description: '', startDate: '', endDate: '' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProject(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5050/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProject),
      });

      if (response.ok) {
        handleCloseModal();
        fetchProjects();
      }
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  return (
    <div className="projects-container">
      <div className="projects-header">
        <h1>Projects</h1>
        <button 
          className="add-project-button"
          onClick={handleAddProject}
        >
          + Add Project
        </button>
      </div>
      <div className="projects-list">
        {projects.map(project => (
          <div key={project._id} className="project-item">
            <h3>{project.title}</h3>
            <p>{project.description}</p>
            <div className="project-dates">
              <span>Start: {new Date(project.startDate).toLocaleDateString()}</span>
              {project.endDate && (
                <span>End: {new Date(project.endDate).toLocaleDateString()}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal 
        isOpen={isAddingProject}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
      >
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Add New Project</h2>
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Project Name<span className="text-red-600 ml-1">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={newProject.title}
            onChange={handleInputChange}
            placeholder="Enter project name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description<span className="text-red-600 ml-1">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={newProject.description}
            onChange={handleInputChange}
            placeholder="Brief project description"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-24 resize-none"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
            Start Date<span className="text-red-600 ml-1">*</span>
          </label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={newProject.startDate}
            onChange={handleInputChange}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            value={newProject.endDate}
            onChange={handleInputChange}
            min={newProject.startDate || new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <button 
            type="button" 
            onClick={handleCloseModal}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button 
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Create Project
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default Projects;