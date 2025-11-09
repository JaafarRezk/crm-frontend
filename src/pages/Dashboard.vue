<template>
  <AppLayout>
    <div class="p-6 space-y-8">

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-white shadow rounded-xl p-4 border">
          <h3 class="text-sm text-gray-500">Total Clients</h3>
          <p class="text-2xl font-bold text-blue-600">{{ totalClients }}</p>
        </div>

        <div class="bg-white shadow rounded-xl p-4 border">
          <h3 class="text-sm text-gray-500">Clients Needing Follow-up Today</h3>
          <p class="text-2xl font-bold text-green-600">{{ followUpToday }}</p>
        </div>

        <div class="bg-white shadow rounded-xl p-4 border">
          <h3 class="text-sm text-gray-500">Avg Communication per Client</h3>
          <p class="text-2xl font-bold text-yellow-600">{{ avgCommunication }}</p>
        </div>

        <div class="bg-white shadow rounded-xl p-4 border">
          <h3 class="text-sm text-gray-500">Tasks Overdue</h3>
          <p class="text-2xl font-bold text-red-600">{{ tasksOverdue }}</p>
        </div>
      </div>

      <!-- Top 5 Sales Reps -->
      <div class="bg-white rounded-xl p-6 shadow border">
        <h2 class="text-xl font-semibold mb-4">Top 5 Sales Representatives</h2>
        <table class="w-full text-left border-t">
          <thead>
            <tr class="border-b bg-gray-50">
              <th class="py-2 px-3">Name</th>
              <th class="py-2 px-3">Active Clients</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="rep in topSalesReps"
              :key="rep.id"
              class="border-b hover:bg-gray-50"
            >
              <td class="py-2 px-3">{{ rep.name }}</td>
              <td class="py-2 px-3 font-semibold text-blue-600">{{ rep.clients_count }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Clients Needing Follow-up -->
      <div class="bg-white rounded-xl p-6 shadow border">
        <h2 class="text-xl font-semibold mb-4">Clients Needing Follow-up</h2>
        <ul class="divide-y divide-gray-200">
          <li
            v-for="client in clientsNeedingFollowUp"
            :key="client.id"
            class="py-3 flex justify-between"
          >
            <span>{{ client.name }}</span>
            <span class="text-sm text-gray-500">
              {{ client.last_communication_at || "No communication yet" }}
            </span>
          </li>
        </ul>
      </div>

      <!-- Communication Trends (Line Chart) -->
      <div v-if="communicationsData.length" class="bg-white rounded-xl p-6 shadow border">
        <h2 class="text-xl font-semibold mb-4">Communications Trends (Last 7 Days)</h2>
        <canvas id="communicationsChart"></canvas>
      </div>

    </div>
  </AppLayout>
</template>

<script setup>
import { onMounted, computed } from "vue";
import AppLayout from "../layouts/AppLayout.vue";
import { useDashboardStore } from "../stores/dashboard";
import Chart from "chart.js/auto";

const dashboard = useDashboardStore();

onMounted(async () => {
  await dashboard.fetchSummary();

  // Chart
  if (dashboard.summary?.communications_trends) {
    const ctx = document.getElementById("communicationsChart").getContext("2d");
    new Chart(ctx, {
      type: "line",
      data: {
        labels: Object.keys(dashboard.summary.communications_trends),
        datasets: [{
          label: "Communications",
          data: Object.values(dashboard.summary.communications_trends),
          borderColor: "rgb(37, 99, 235)",
          backgroundColor: "rgba(37, 99, 235, 0.1)",
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false }
        }
      }
    });
  }
});

// Computed helpers
const totalClients = computed(() => Object.values(dashboard.summary?.clients_by_status || {}).reduce((a,b)=>a+b, 0));
const topSalesReps = computed(() => dashboard.summary?.top_sales_reps || []);
const clientsNeedingFollowUp = computed(() => dashboard.summary?.clients_needing_follow_up || []);
const followUpToday = computed(() => dashboard.summary?.clients_needing_follow_up?.length || 0);
const avgCommunication = computed(() => dashboard.summary?.avg_communication_frequency?.avg_per_client?.toFixed(2) || 0);
const tasksOverdue = computed(() => Object.values(dashboard.summary?.tasks_overdue_per_user || {}).reduce((a,b)=>a+b,0));
const communicationsData = computed(() => Object.entries(dashboard.summary?.communications_trends || {}));
</script>

