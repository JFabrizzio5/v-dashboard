<template>
  <div>
    <h3 class="text-gray-700 text-3xl font-medium">Cheques</h3>

    <div v-if="loading">
      <p>Cargando...</p> <!-- Mensaje de carga -->
    </div>

    <div v-else-if="cheques.length > 0">
      <div class="overflow-x-auto">
        <table class="min-w-full leading-normal">
          <thead>
            <tr>
              <th class="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase bg-gray-100 border-b-2 border-gray-200">ID</th>
              <th class="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase bg-gray-100 border-b-2 border-gray-200">Tipo de Movimiento</th>
              <th class="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase bg-gray-100 border-b-2 border-gray-200">Número de Cheque</th>
              <th class="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase bg-gray-100 border-b-2 border-gray-200">Fecha</th>
              <th class="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase bg-gray-100 border-b-2 border-gray-200">Importe</th>
              <th class="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase bg-gray-100 border-b-2 border-gray-200">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="(cheque, index) in cheques" :key="cheque._id">
              <tr :class="[{ 'bg-blue-200': isDetailsVisible(index) }, 'border-b border-gray-200']">
                <td class="px-5 py-5 text-sm bg-white">
                  <p class="text-gray-900 whitespace-nowrap">{{ cheque.Id }}</p>
                </td>
                <td class="px-5 py-5 text-sm bg-white">
                  <p class="text-gray-900 whitespace-nowrap">{{ cheque.tipomov }}</p>
                </td>
                <td class="px-5 py-5 text-sm bg-white">
                  <p class="text-gray-900 whitespace-nowrap">{{ cheque.numcheque }}</p>
                </td>
                <td class="px-5 py-5 text-sm bg-white">
                  <p class="text-gray-900 whitespace-nowrap">{{ cheque.fecha }}</p>
                </td>
                <td class="px-5 py-5 text-sm bg-white">
                  <p class="text-gray-900 whitespace-nowrap">${{ cheque.importecheque }}</p>
                </td>
                <td class="px-5 py-5 text-sm bg-white">
                  <button @click="toggleDetails(index)" class="text-blue-500">Detalles</button>
                </td>
              </tr>
              <tr v-if="isDetailsVisible(index)" class="bg-gray-100">
                <td colspan="6" class="px-5 py-3">
                  <div class="flex items-center space-x-4">
                    <button class="flex items-center text-gray-600">
                      <i class="fas fa-file-pdf mr-2"></i> PDF Póliza
                    </button>
                    <button class="flex items-center text-gray-600">
                      <i class="fas fa-dollar-sign mr-2"></i> Pago
                    </button>
                    <button class="flex items-center text-gray-600">
                      <i class="fas fa-notes-medical mr-2"></i> Nota(s)
                    </button>
                    <button class="flex items-center text-gray-600">
                      <i class="fas fa-docs mr-2"></i> Doc. Adicionales
                    </button>
                    <button class="flex items-center text-gray-600">
                      <i class="fas fa-file-invoice mr-2"></i> Facturas
                    </button>
                    <button class="flex items-center text-gray-600">
                      <i class="fas fa-edit mr-2"></i> Editar
                    </button>
                    <button class="flex items-center text-gray-600">
                      <i class="fas fa-trash-alt mr-2"></i> Eliminar Cheque
                    </button>
                  </div>
                  <p><strong>RFC:</strong> {{ cheque.rfc }}</p>
                  <p><strong>Tipo de Operación:</strong> {{ cheque.tipoopera }}</p>
                  <p><strong>Beneficiario:</strong> {{ cheque.Beneficiario }}</p>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
      <button @click="fetchCheques(currentPage + 1)" class="mt-4 bg-blue-500 text-white py-2 px-4 rounded">Cargar más</button>
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
const visibleDetailsIndices = ref<number[]>([]); // Índices de detalles visibles

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

// Función para alternar la visibilidad de los detalles
const toggleDetails = (index: number) => {
  const idx = visibleDetailsIndices.value.indexOf(index);
  if (idx !== -1) {
    // Si ya está visible, lo quita
    visibleDetailsIndices.value.splice(idx, 1);
  } else {
    // Si no está visible, lo agrega
    visibleDetailsIndices.value.push(index);
  }
};

// Función para verificar si los detalles de una fila deben ser visibles
const isDetailsVisible = (index: number) => {
  return visibleDetailsIndices.value.includes(index);
};
</script>
