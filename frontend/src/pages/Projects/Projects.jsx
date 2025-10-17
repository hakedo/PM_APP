import { useState, useEffect } from 'react';
import Modal from '../../components/Modal/Modal';
import './Projects.css';

function Projects() {
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [projects, setProjects] = useState([]);
  const [newProject, setNewProject] = useState({
    title: '',
    description: ''
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
    setNewProject({ title: '', description: '' });
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
          </div>
        ))}
      </div>

      <Modal 
        isOpen={isAddingProject}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
      >
        <h2>Add New Project</h2>
        <div className="form-group">
          <label htmlFor="title">Project Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={newProject.title}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={newProject.description}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-buttons">
          <button type="button" onClick={handleCloseModal}>Cancel</button>
          <button type="submit">Create Project</button>
        </div>
      </Modal>
    </div>
  );
}

export default Projects;