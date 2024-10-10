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
              <th class="px-10 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase bg-gray-100 border-b-2 border-gray-200">
                <input type="checkbox" v-model="selectAll" @change="toggleSelectAll" />
           
              </th>
              <th class="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase bg-gray-100 border-b-2 border-gray-200">Estado Póliza</th>
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
              <tr :class="{ 'bg-blue-200': isDetailsVisible(index) }">
                <td class="px-5 py-1 text-sm bg-white border-b border-gray-200">
                  <span class="mr-2">T-224</span>
                  <input type="checkbox" v-model="cheque.selected" />
                </td>
                <td class="px-5 py-5 text-sm bg-white border-b border-gray-200">
                  <p class="text-gray-900 whitespace-nowrap">{{ cheque.estadoPoliza }}</p>
                  <i class="fas fa-bell alert-icon" :class="{ 'animate-pulse': alertActive }" @click="toggleAlert"></i> <!-- Icono de campanita -->
                </td>
                <td class="px-5 py-5 text-sm bg-white border-b border-gray-200">
                  <p class="text-gray-900 whitespace-nowrap">{{ cheque.Id }}</p>
                </td>
                <td class="px-5 py-5 text-sm bg-white border-b border-gray-200">
                  <p class="text-gray-900 whitespace-nowrap">{{ cheque.tipomov }}</p>
                </td>
                <td class="px-5 py-5 text-sm bg-white border-b border-gray-200">
                  <p class="text-gray-900 whitespace-nowrap">{{ cheque.numcheque }}</p>
                </td>
                <td class="px-5 py-5 text-sm bg-white border-b border-gray-200">
                  <p class="text-gray-900 whitespace-nowrap">{{ cheque.fecha }}</p>
                </td>
                <td class="px-5 py-5 text-sm bg-white border-b border-gray-200">
                  <p class="text-gray-900 whitespace-nowrap">${{ cheque.importecheque }}</p>
                </td>
                <td class="px-5 py-5 text-sm bg-white border-b border-gray-200">
                  <button @click="toggleDetails(index)" class="text-blue-500">Detalles</button>
                </td>
              </tr>
              <tr v-if="isDetailsVisible(index)" class="bg-gray-100">
                <td colspan="8" class="px-5 py-3">
                  <div class="flex items-center space-x-4 mt-2">
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
      <button @click="printSelected" class="mt-2 bg-green-500 text-white py-2 px-4 rounded">Imprimir Seleccionados</button>
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
import Swal from 'sweetalert2'; // Asegúrate de instalar SweetAlert2

const cheques = ref([]); // Inicializa la variable para los cheques
const loading = ref(true); // Estado de carga
const currentPage = ref(1); // Página actual
const perPage = 10; // Cheques por página
const visibleDetailsIndices = ref<number[]>([]); // Índices de detalles visibles
const alertActive = ref(false); // Estado para el parpadeo de alerta
const selectAll = ref(false); // Estado para seleccionar todos los cheques

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
  if (visibleDetailsIndices.value.includes(index)) {
    visibleDetailsIndices.value = visibleDetailsIndices.value.filter(i => i !== index); // Elimina el índice si ya está visible
  } else {
    visibleDetailsIndices.value.push(index); // Agrega el índice a los visibles
  }
};

// Función para verificar si los detalles están visibles
const isDetailsVisible = (index: number) => {
  return visibleDetailsIndices.value.includes(index); // Retorna verdadero o falso
};

// Función para imprimir cheques seleccionados
const printSelected = () => {
  const selectedCheques = cheques.value.filter(cheque => cheque.selected); // Filtra los cheques seleccionados
  if (selectedCheques.length > 0) {
    console.log('Cheques seleccionados:', selectedCheques); // Imprime en consola
    Swal.fire({
      title: 'Cheques Seleccionados',
      text: `Has seleccionado ${selectedCheques.length} cheques.`,
      icon: 'info',
      confirmButtonText: 'Aceptar'
    });
  } else {
    Swal.fire({
      title: 'Sin Selección',
      text: 'No has seleccionado ningún cheque.',
      icon: 'warning',
      confirmButtonText: 'Aceptar'
    });
  }
};

// Función para alternar el estado de alerta
const toggleAlert = () => {
  alertActive.value = !alertActive.value; // Cambia el estado de alerta
};

// Alternar la selección de todos los cheques
const toggleSelectAll = () => {
  cheques.value.forEach(cheque => {
    cheque.selected = selectAll.value; // Selecciona o deselecciona todos
  });
};
</script>

<style scoped>
.alert-icon {
  cursor: pointer; /* Cambia el cursor al pasar el mouse */
}
</style>
