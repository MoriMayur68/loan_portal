import { useEffect, useState } from 'react';
import { getAllUsers, toggleUserStatus } from '../api';
import toast from 'react-hot-toast';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = () => {
    setLoading(true);
    getAllUsers({ page, limit: 10 })
      .then((res) => {
        setUsers(res.data.users || []);
        setTotalPages(res.data.pages || 1);
      })
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const handleToggle = async (id, currentStatus) => {
    try {
      await toggleUserStatus(id);
      toast.success(`User account ${!currentStatus ? 'activated' : 'deactivated'}`);
      setUsers((prev) =>
        prev.map((u) => (u._id === id ? { ...u, isActive: !currentStatus } : u))
      );
    } catch (err) {
      toast.error('Failed to update user status');
    }
  };

  return (
    <div className="admin-loans-page fade-in-up">
      <div className="page-header">
        <div>
          <h1>Borrower Management</h1>
          <p className="page-subtitle">View and manage registered user accounts</p>
        </div>
      </div>

      <div className="glass-card table-section">
        {loading ? (
          <div className="loading-center">
            <div className="spinner" />
          </div>
        ) : users.length === 0 ? (
          <div className="empty-state" style={{ padding: '60px' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>👥</div>
            <p>No registered borrowers found.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Borrower</th>
                  <th>Contact Info</th>
                  <th>Occupation</th>
                  <th>Annual Income</th>
                  <th>Account Status</th>
                  <th>Registered Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            color: '#fff',
                            fontSize: '0.8rem',
                          }}
                        >
                          {u.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <strong>{u.name}</strong>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Role: {u.role}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>{u.email}</div>
                      <small style={{ color: '#64748b' }}>{u.phone || 'No phone'}</small>
                    </td>
                    <td>{u.occupation || 'N/A'}</td>
                    <td>{u.annualIncome ? `₹${u.annualIncome.toLocaleString('en-IN')}` : 'N/A'}</td>
                    <td>
                      <span className={`badge ${u.isActive !== false ? 'badge-approved' : 'badge-rejected'}`}>
                        {u.isActive !== false ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td>{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                    <td>
                      <button
                        className={`btn btn-sm ${u.isActive !== false ? 'btn-danger' : 'btn-success'}`}
                        onClick={() => handleToggle(u._id, u.isActive !== false)}
                      >
                        {u.isActive !== false ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="btn btn-ghost btn-sm"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            ← Previous
          </button>
          <span>Page {page} of {totalPages}</span>
          <button
            className="btn btn-ghost btn-sm"
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default Users;
