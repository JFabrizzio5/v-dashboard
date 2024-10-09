<template>
  <div>
    <h3 class="text-gray-700 text-3xl font-medium">
      Cheques
    </h3>
    
    <div v-if="loading">
      <p>Cargando...</p> <!-- Mensaje de carga -->
    </div>
    
    <div v-else-if="cheques.length > 0">
      <div v-for="cheque in cheques" :key="cheque._id" class="mt-4">
        <p><strong>ID:</strong> {{ cheque.Id }}</p>
        <p><strong>Tipo de Movimiento:</strong> {{ cheque.tipomov }}</p>
        <p><strong>Número de Cheque:</strong> {{ cheque.numcheque }}</p>
        <p><strong>Fecha:</strong> {{ cheque.fecha }}</p>
        <p><strong>Importe:</strong> ${{ cheque.importecheque }}</p>
        <p><strong>Beneficiario:</strong> {{ cheque.Beneficiario }}</p>
        <p><strong>Tipo de Operación:</strong> {{ cheque.tipoopera }}</p>
        <p><strong>RFC:</strong> {{ cheque.rfc }}</p>
        <hr />
      </div>
      <button @click="fetchCheques(currentPage + 1)">Cargar más</button> <!-- Corregido: se agregó el paréntesis de cierre -->
    </div>
    
    <div v-else>
      <p>No se encontraron cheques.</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import axios from '@/axios'; // Importa la configuración de Axios

const cheques = ref([]); // Inicializa la variable para los cheques
const loading = ref(true); // Estado de carga
const currentPage = ref(1); // Página actual
const perPage = 10; // Cheques por página

// Función para obtener cheques desde la API
const fetchCheques = async (page = 1) => {
  loading.value = true; // Inicia el estado de carga
  try {
    const response = await axios.get(`/cheques?page=${page}&perPage=${perPage}`); // Asegúrate de que tu API soporte la paginación
    if (page === 1) {
      cheques.value = response.data; // Asigna los cheques solo en la primera carga
    } else {
      cheques.value = [...cheques.value, ...response.data]; // Agrega los cheques a los ya existentes
    }
    currentPage.value = page; // Actualiza la página actual
  } catch (error) {
    console.error('Error al cargar los cheques:', error); // Manejo de errores
  } finally {
    loading.value = false; // Finaliza el estado de carga
  }
};

// Llama a la función de carga de cheques al montar el componente
onMounted(() => {
  fetchCheques(); // Obtiene los cheques al cargar
});
</script>
