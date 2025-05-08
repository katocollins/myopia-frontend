// src/pages/Doctor/DoctorDashboard.jsx
import React, { useEffect } from 'react';
import { Users, Image, Stethoscope, Activity, RefreshCw } from 'lucide-react';
import { Pie, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
import { usePatientStore } from '../../stores/patientStore';
import { useImageStore } from '../../stores/imageStore';
import { useDiagnosisStore } from '../../stores/diagnosisStore';
import { useUiStore } from '../../stores/uiStore';
import { Link } from 'react-router-dom';

// Register Chart.js components
ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const DoctorDashboard = () => {
  const {
    patientCount,
    activePatientCount,
    patientsByGender,
    getPatientCount,
    getActivePatientCount,
    getPatientsByGender,
  } = usePatientStore();
  const { imageCount, getImageCount } = useImageStore();
  const {
    diagnosisCount,
    patientsBySeverity,
    diagnosesBySeverity,
    recentDiagnoses,
    getDiagnosisCount,
    getPatientsBySeverity,
    getDiagnosesBySeverity,
    getRecentDiagnoses,
  } = useDiagnosisStore();
  const { showToast } = useUiStore();

  const fetchData = async () => {
    try {
      await Promise.all([
        getPatientCount(),
        getActivePatientCount(),
        getPatientsByGender(),
        getImageCount(),
        getDiagnosisCount(),
        getPatientsBySeverity(),
        getDiagnosesBySeverity(),
        getRecentDiagnoses(5),
      ]);
    } catch (error) {
      showToast('Failed to load dashboard data', 'error');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Pie Chart Data (Patients by Severity)
  const pieChartData = {
    labels: ['Normal', 'Low', 'Medium', 'High', 'Severe'],
    datasets: [
      {
        data: [
          patientsBySeverity.normal || 0,
          patientsBySeverity.low || 0,
          patientsBySeverity.medium || 0,
          patientsBySeverity.high || 0,
          patientsBySeverity.severe || 0,
        ],
        backgroundColor: ['#22C55E', '#EAB308', '#F97316', '#EF4444', '#B91C1C'],
        hoverBackgroundColor: ['#16A34A', '#CA8A04', '#EA580C', '#DC2626', '#991B1B'],
      },
    ],
  };

  // Bar Chart Data (Diagnoses by Severity)
  const barChartData = {
    labels: ['Normal', 'Low', 'Medium', 'High', 'Severe'],
    datasets: [
      {
        label: 'Diagnoses',
        data: [
          diagnosesBySeverity.normal || 0,
          diagnosesBySeverity.low || 0,
          diagnosesBySeverity.medium || 0,
          diagnosesBySeverity.high || 0,
          diagnosesBySeverity.severe || 0,
        ],
        backgroundColor: '#10B981',
        hoverBackgroundColor: '#059669',
      },
    ],
  };

  // Donut Chart Data (Patients by Gender)
  const donutChartData = {
    labels: ['Male', 'Female', 'Other'],
    datasets: [
      {
        data: [
          patientsByGender.male || 0,
          patientsByGender.female || 0,
          patientsByGender.other || 0,
        ],
        backgroundColor: ['#10B981', '#EC4899', '#6B7280'],
        hoverBackgroundColor: ['#059669', '#DB2777', '#4B5563'],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' },
      tooltip: { enabled: true },
    },
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">Doctor Dashboard</h1>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 focus:outline-none"
          aria-label="Refresh Data"
        >
          <RefreshCw className="w-5 h-5" />
          <span className="hidden md:inline">Refresh</span>
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Patients"
          value={patientCount}
          icon={Users}
          color="bg-primary-500"
        />
        <StatCard
          title="Active Patients"
          value={activePatientCount}
          icon={Activity}
          color="bg-success"
        />
        <StatCard
          title="Total Images"
          value={imageCount}
          icon={Image}
          color="bg-blue-500"
        />
        <StatCard
          title="Total Diagnoses"
          value={diagnosisCount}
          icon={Stethoscope}
          color="bg-purple-500"
        />
      </div>

      {/* Charts and Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Pie and Donut Charts */}
        <div className="flex flex-col gap-6">
          <ChartCard title="Patients by Severity">
            <div className="h-64">
              <Pie data={pieChartData} options={chartOptions} />
            </div>
          </ChartCard>
          <ChartCard title="Patients by Gender">
            <div className="h-64">
              <Doughnut data={donutChartData} options={chartOptions} />
            </div>
          </ChartCard>
        </div>

        {/* Right Column: Bar Chart and Table */}
        <div className="flex flex-col gap-6">
          <ChartCard title="Diagnoses by Severity">
            <div className="h-64">
              <Bar data={barChartData} options={chartOptions} />
            </div>
          </ChartCard>
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Diagnoses</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-gray-600">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 px-4 text-left">Patient</th>
                    <th className="py-2 px-4 text-left">Severity</th>
                    <th className="py-2 px-4 text-left">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentDiagnoses.map((diagnosis) => (
                    <tr key={diagnosis.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-4">{diagnosis.patientName}</td>
                      <td className="py-2 px-4">{diagnosis.severity_level}</td>
                      <td className="py-2 px-4">
                        {new Date(diagnosis.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Link
              to="/doctor/diagnoses"
              className="mt-4 inline-block text-primary-500 hover:underline"
            >
              View All Diagnoses
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white shadow-md rounded-lg p-6 flex items-center gap-4 animate-fade-in">
    <div className={`p-3 rounded-full ${color} text-white`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <h3 className="text-sm font-medium text-gray-600">{title}</h3>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

// Chart Card Component
const ChartCard = ({ title, children }) => (
  <div className="bg-white shadow-md rounded-lg p-6 animate-fade-in">
    <h2 className="text-lg font-semibold text-gray-800 mb-4">{title}</h2>
    {children}
  </div>
);

export default DoctorDashboard;
