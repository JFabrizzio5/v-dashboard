<template>
  <div>
    <h3 class="text-gray-700 text-3xl font-medium">Cheques</h3>

    <!-- Modal de Bienvenida con Transición -->
    <transition name="fade">
      <div v-if="isWelcomeModalOpen" class="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
        <div class="bg-white p-6 rounded shadow-lg">
          <h4 class="text-lg font-semibold">¡Hola! Bienvenido</h4>
          <p>Te dejo con actualizaciones.</p>
          <div class="flex justify-between">
            <button @click="closeWelcomeModal" class="mt-4 bg-red-500 text-white py-2 px-4 rounded">Dejar de Notificar</button>
            <button @click="closeWelcomeModal" class="mt-4 bg-green-500 text-white py-2 px-4 rounded">Continuar</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Controles solo si hay algún cheque seleccionado -->
    <div v-if="anyChequeSelected" class="mb-4">
      <button @click="generatePDF" class="mr-2 bg-blue-500 text-white py-2 px-4 rounded">Generar PDF</button>
      <button @click="markAsPrinted" class="mr-2 bg-green-500 text-white py-2 px-4 rounded">Marcar como Impreso</button>
      <button @click="markAsReviewed" class="bg-yellow-500 text-white py-2 px-4 rounded">Marcar como Revisado</button>
    </div>

    <div v-if="loading">
      <p>Cargando...</p>
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
              <tr :class="{ 'bg-blue-200': isDetailsVisible(index) }" @click="toggleDetails(index)">
                <td class="px-5 py-1 text-sm bg-white border-b border-gray-200">
                  <input type="checkbox" v-model="cheque.selected" @click.stop />
                </td>
                <td class="px-5 py-5 text-sm bg-white border-b border-gray-200">
                  <p class="text-gray-900 whitespace-nowrap">{{ cheque.estadoPoliza }}</p>
                  <i class="fas fa-bell alert-icon" :class="{ 'animate-pulse': alertActive }" @click.stop="toggleAlert"></i>
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
                  <button @click.stop="toggleDetails(index)" class="text-blue-500">Detalles</button>
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

    <!-- Botón para abrir el modal principal -->
    <button @click="openMainModal" class="mt-4 bg-blue-500 text-white py-2 px-4 rounded">Abrir Modal Principal</button>

    <!-- Modal Principal -->
    <div v-if="isMainModalOpen" class="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
      <div class="bg-white p-6 rounded shadow-lg">
        <h4 class="text-lg font-semibold">Modal Principal</h4>
        <p>Este es el contenido del modal principal.</p>
        <button @click="openSecondaryModal" class="mt-4 bg-green-500 text-white py-2 px-4 rounded">Abrir Modal Secundario</button>
        <button @click="closeMainModal" class="mt-2 bg-red-500 text-white py-2 px-4 rounded">Cerrar Modal</button>
      </div>
    </div>

    <!-- Modal Secundario -->
    <div v-if="isSecondaryModalOpen" class="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
      <div class="bg-white p-6 rounded shadow-lg">
        <h4 class="text-lg font-semibold">Modal Secundario</h4>
        <p>Este es el contenido del modal secundario.</p>
        <button @click="closeSecondaryModal" class="mt-4 bg-red-500 text-white py-2 px-4 rounded">Cerrar Modal Secundario</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'; // Asegúrate de que onMounted está importado
import axios from '@/axios';
import Swal from 'sweetalert2';

const cheques = ref([]);
const loading = ref(true);
const currentPage = ref(1);
const perPage = 10;
const visibleDetailsIndices = ref<number[]>([]);
const alertActive = ref(false);
const selectAll = ref(false);
const isMainModalOpen = ref(false);
const isSecondaryModalOpen = ref(false);
const isWelcomeModalOpen = ref(true); // Modal de bienvenida

// Computed property to check if any cheque is selected
const anyChequeSelected = computed(() => {
  return cheques.value.some(cheque => cheque.selected);
});

const fetchCheques = async (page = 1) => {
  loading.value = true;
  try {
    const response = await axios.get(`/cheques?page=${page}&perPage=${perPage}`);
    if (page === 1) {
      cheques.value = response.data;
    } else {
      cheques.value = [...cheques.value, ...response.data];
    }
    currentPage.value = page;
  } catch (error) {
    console.error('Error al cargar los cheques:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchCheques();
});

const toggleDetails = (index: number) => {
  if (visibleDetailsIndices.value.includes(index)) {
    visibleDetailsIndices.value = visibleDetailsIndices.value.filter(i => i !== index);
  } else {
    visibleDetailsIndices.value.push(index);
  }
};

const isDetailsVisible = (index: number) => {
  return visibleDetailsIndices.value.includes(index);
};

const printSelected = () => {
  const selectedCheques = cheques.value.filter(cheque => cheque.selected);
  if (selectedCheques.length > 0) {
    console.log('Cheques seleccionados:', selectedCheques);
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

const generatePDF = () => {
  Swal.fire('Generar PDF', 'Funcionalidad no implementada.', 'info');
};

const markAsPrinted = () => {
  Swal.fire('Marcar como Impreso', 'Funcionalidad no implementada.', 'info');
};

const markAsReviewed = () => {
  Swal.fire('Marcar como Revisado', 'Funcionalidad no implementada.', 'info');
};

const toggleAlert = () => {
  alertActive.value = !alertActive.value;
};

const toggleSelectAll = () => {
  cheques.value.forEach(cheque => {
    cheque.selected = selectAll.value;
  });
};

// Funciones para los modales
const openMainModal = () => {
  isMainModalOpen.value = true;
};

const closeMainModal = () => {
  isMainModalOpen.value = false;
  isSecondaryModalOpen.value = false; // Cerrar el secundario si está abierto
};

const openSecondaryModal = () => {
  isSecondaryModalOpen.value = true;
};

const closeSecondaryModal = () => {
  isSecondaryModalOpen.value = false;
};

// Función para cerrar el modal de bienvenida
const closeWelcomeModal = () => {
  isWelcomeModalOpen.value = false;
  localStorage.setItem('hideWelcomeModal', 'true'); // Guardar la decisión en el almacenamiento local
};
</script>

<style scoped>
.alert-icon {
  cursor: pointer;
}

/* Estilos para los modales */
.fixed {
  z-index: 1000; /* Asegúrate de que los modales aparezcan por encima */
}

/* Estilos de transición */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active en versiones <2.1.8 */ {
  opacity: 0;
}
</style>
