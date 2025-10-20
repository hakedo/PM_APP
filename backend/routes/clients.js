import express from 'express';
import { Client, ClientProjectAssignment } from '../models/index.js';

const router = express.Router();

// Get all clients
router.get('/', async (req, res, next) => {
  try {
    const clients = await Client.find().sort({ lastName: 1, firstName: 1 });
    res.json(clients);
  } catch (error) {
    next(error);
  }
});

// Get client by ID
router.get('/:id', async (req, res, next) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({
        error: 'Client not found',
        message: `No client found with id: ${req.params.id}`
      });
    }

    res.json(client);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid client ID',
        message: 'The provided client ID is not valid'
      });
    }
    next(error);
  }
});

// Create new client
router.post('/', async (req, res, next) => {
  try {
    const { company, firstName, middleInitial, lastName, phone, email, address, unit, city, state, zip } = req.body;

    // Check if client with this email already exists
    const existingClient = await Client.findOne({ email: email?.toLowerCase() });
    if (existingClient) {
      return res.status(409).json({
        error: 'Client already exists',
        message: 'A client with this email address already exists'
      });
    }

    const client = new Client({
      company: company || '',
      firstName,
      middleInitial: middleInitial || '',
      lastName,
      phone,
      email,
      address,
      unit: unit || '',
      city,
      state,
      zip
    });

    const savedClient = await client.save();
    res.status(201).json(savedClient);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation failed',
        message: error.message,
        details: error.errors
      });
    }
    if (error.code === 11000) {
      return res.status(409).json({
        error: 'Client already exists',
        message: 'A client with this email address already exists'
      });
    }
    next(error);
  }
});

// Update client
router.patch('/:id', async (req, res, next) => {
  try {
    const { company, firstName, middleInitial, lastName, phone, email, address, unit, city, state, zip } = req.body;

    // If email is being updated, check if it's already in use
    if (email) {
      const existingClient = await Client.findOne({
        email: email.toLowerCase(),
        _id: { $ne: req.params.id }
      });
      if (existingClient) {
        return res.status(409).json({
          error: 'Email already in use',
          message: 'Another client is already using this email address'
        });
      }
    }

    const updateData = {};
    if (company !== undefined) updateData.company = company;
    if (firstName !== undefined) updateData.firstName = firstName;
    if (middleInitial !== undefined) updateData.middleInitial = middleInitial;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (phone !== undefined) updateData.phone = phone;
    if (email !== undefined) updateData.email = email;
    if (address !== undefined) updateData.address = address;
    if (unit !== undefined) updateData.unit = unit;
    if (city !== undefined) updateData.city = city;
    if (state !== undefined) updateData.state = state;
    if (zip !== undefined) updateData.zip = zip;

    const client = await Client.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!client) {
      return res.status(404).json({
        error: 'Client not found',
        message: `No client found with id: ${req.params.id}`
      });
    }

    res.json(client);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation failed',
        message: error.message
      });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid client ID',
        message: 'The provided client ID is not valid'
      });
    }
    if (error.code === 11000) {
      return res.status(409).json({
        error: 'Email already in use',
        message: 'Another client is already using this email address'
      });
    }
    next(error);
  }
});

// Delete client
router.delete('/:id', async (req, res, next) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);

    if (!client) {
      return res.status(404).json({
        error: 'Client not found',
        message: `No client found with id: ${req.params.id}`
      });
    }

    // Remove all project assignments for this client
    await ClientProjectAssignment.deleteMany({ clientId: req.params.id });

    res.json({
      message: 'Client deleted successfully',
      client
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid client ID',
        message: 'The provided client ID is not valid'
      });
    }
    next(error);
  }
});

export default router;
