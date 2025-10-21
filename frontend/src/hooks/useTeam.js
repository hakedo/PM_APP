import { useState, useEffect } from 'react';
import { teamService } from '../services';

export const useTeam = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTeamMembers = async (status = null) => {
    try {
      setLoading(true);
      setError(null);
      const data = await teamService.getAll(status);
      setTeamMembers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const createTeamMember = async (teamMemberData) => {
    try {
      const newMember = await teamService.create(teamMemberData);
      await fetchTeamMembers();
      return newMember;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateTeamMember = async (id, teamMemberData) => {
    try {
      const updatedMember = await teamService.update(id, teamMemberData);
      setTeamMembers(prev =>
        prev.map(m => (m._id === id ? updatedMember : m))
      );
      return updatedMember;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteTeamMember = async (id) => {
    try {
      await teamService.delete(id);
      setTeamMembers(prev => prev.filter(m => m._id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    teamMembers,
    loading,
    error,
    refetch: fetchTeamMembers,
    createTeamMember,
    updateTeamMember,
    deleteTeamMember,
  };
};

export const useTeamMember = (id) => {
  const [teamMember, setTeamMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTeamMember = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await teamService.getById(id);
      setTeamMember(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamMember();
  }, [id]);

  const updateTeamMember = async (teamMemberData) => {
    try {
      const updated = await teamService.update(id, teamMemberData);
      setTeamMember(updated);
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    teamMember,
    loading,
    error,
    refetch: fetchTeamMember,
    updateTeamMember,
  };
};
