// src/axios.ts
import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://127.0.0.1:8000/api', // Cambia esto a la URL base de tu API
});

// Puedes agregar interceptores o configuraciones adicionales aquí si es necesario

export default instance;
