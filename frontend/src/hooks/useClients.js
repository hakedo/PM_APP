import { useState, useEffect } from 'react';
import { clientService } from '../services';

export const useClients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchClients = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await clientService.getAll();
      setClients(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const createClient = async (clientData) => {
    try {
      const newClient = await clientService.create(clientData);
      // Refetch all clients to ensure UI is in sync with backend
      await fetchClients();
      return newClient;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateClient = async (id, clientData) => {
    try {
      const updatedClient = await clientService.update(id, clientData);
      setClients(prev =>
        prev.map(c => (c._id === id ? updatedClient : c))
      );
      return updatedClient;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteClient = async (id) => {
    try {
      await clientService.delete(id);
      setClients(prev => prev.filter(c => c._id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    clients,
    loading,
    error,
    refetch: fetchClients,
    createClient,
    updateClient,
    deleteClient,
  };
};

export const useClient = (id) => {
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchClient = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await clientService.getById(id);
      setClient(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClient();
  }, [id]);

  return {
    client,
    loading,
    error,
    refetch: fetchClient,
  };
};

export default useClients;
