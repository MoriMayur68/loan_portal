import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStats, getAllLoans } from '../api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import './Dashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const formatCurrency = (v) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v || 0);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentLoans, setRecentLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getDashboardStats(), getAllLoans({ limit: 5 })])
      .then(([statsRes, loansRes]) => {
        setStats(statsRes.data);
        setRecentLoans(loansRes.data.loans || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="loading-center">
        <div className="spinner" />
      </div>
    );
  }

  const doughnutData = {
    labels: ['Active', 'Pending', 'Approved', 'Rejected', 'Closed'],
    datasets: [
      {
        data: [
          stats?.activeLoans || 0,
          stats?.pendingLoans || 0,
          stats?.approvedLoans || 0,
          stats?.rejectedLoans || 0,
          stats?.closedLoans || 0,
        ],
        backgroundColor: ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#64748b'],
        borderWidth: 0,
      },
    ],
  };

  const purposeLabels = (stats?.loansByPurpose || []).map((p) => p._id);
  const purposeCounts = (stats?.loansByPurpose || []).map((p) => p.count);

  const barData = {
    labels: purposeLabels.length ? purposeLabels : ['Personal', 'Business', 'Home', 'Education'],
    datasets: [
      {
        label: 'Applications',
        data: purposeCounts.length ? purposeCounts : [0, 0, 0, 0],
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
        borderRadius: 6,
      },
    ],
  };

  return (
    <div className="admin-dashboard fade-in-up">
      <div className="page-header">
        <div>
          <h1>Executive Dashboard</h1>
          <p className="page-subtitle">Real-time loan portfolio and operations telemetry</p>
        </div>
        <div className="header-actions">
          <Link to="/loans" className="btn btn-primary">
            Review Applications ({stats?.pendingLoans || 0})
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="admin-stats-grid">
        <div className="stat-card blue">
          <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.15)' }}>📋</div>
          <div className="stat-value">{stats?.totalLoans || 0}</div>
          <div className="stat-label">Total Applications</div>
        </div>

        <div className="stat-card yellow">
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)' }}>⏳</div>
          <div className="stat-value">{stats?.pendingLoans || 0}</div>
          <div className="stat-label">Pending Approval</div>
        </div>

        <div className="stat-card green">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)' }}>💸</div>
          <div className="stat-value">{formatCurrency(stats?.totalDisbursed)}</div>
          <div className="stat-label">Total Disbursed</div>
        </div>

        <div className="stat-card purple">
          <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.15)' }}>💰</div>
          <div className="stat-value">{formatCurrency(stats?.totalCollected)}</div>
          <div className="stat-label">Total Collections</div>
        </div>

        <div className="stat-card blue">
          <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.15)' }}>👥</div>
          <div className="stat-value">{stats?.totalUsers || 0}</div>
          <div className="stat-label">Registered Borrowers</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        <div className="glass-card chart-card">
          <h3>Loan Status Distribution</h3>
          <div className="doughnut-container">
            <Doughnut
              data={doughnutData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'bottom', labels: { color: '#94a3b8' } },
                },
              }}
            />
          </div>
        </div>

        <div className="glass-card chart-card">
          <h3>Applications by Purpose</h3>
          <div className="bar-container">
            <Bar
              data={barData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                },
                scales: {
                  x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                  y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Recent Applications Table */}
      <div className="glass-card table-section">
        <div className="table-header">
          <h3>Recent Loan Applications</h3>
          <Link to="/loans" className="btn btn-ghost btn-sm">View All</Link>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Loan No</th>
                <th>Borrower</th>
                <th>Amount</th>
                <th>Purpose</th>
                <th>Tenure</th>
                <th>Status</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentLoans.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '30px' }}>
                    No loan applications found
                  </td>
                </tr>
              ) : (
                recentLoans.map((loan) => (
                  <tr key={loan._id}>
                    <td><strong>{loan.loanNumber}</strong></td>
                    <td>{loan.userId?.name || 'N/A'}</td>
                    <td style={{ color: '#f1f5f9', fontWeight: 600 }}>₹{loan.amount?.toLocaleString('en-IN')}</td>
                    <td>{loan.purpose}</td>
                    <td>{loan.tenure} mo</td>
                    <td><span className={`badge badge-${loan.status}`}>{loan.status}</span></td>
                    <td>{new Date(loan.createdAt).toLocaleDateString('en-IN')}</td>
                    <td>
                      <Link to={`/loans/${loan._id}`} className="btn btn-ghost btn-sm">
                        Review →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
