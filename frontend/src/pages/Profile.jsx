import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile, changePassword } from '../api';
import toast from 'react-hot-toast';
import './Profile.css';

const Profile = () => {
  const { user, setUser } = useAuth();
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '', phone: user?.phone || '',
    address: user?.address || '', occupation: user?.occupation || '',
    annualIncome: user?.annualIncome || '',
    gender: user?.gender || 'Prefer not to say',
  });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [profileLoading, setProfileLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const res = await updateProfile(profileForm);
      setUser(res.data);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePwChange = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) return toast.error('Passwords do not match');
    if (pwForm.newPassword.length < 6) return toast.error('Minimum 6 characters');
    setPwLoading(true);
    try {
      await changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed successfully!');
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="profile-page fade-in-up">
      <h1 className="profile-title">My Profile</h1>

      <div className="profile-grid">
        {/* Avatar + Info */}
        <div className="glass-card profile-avatar-card">
          <div className="avatar-big">{user?.name?.[0]?.toUpperCase() || 'U'}</div>
          <div className="avatar-name">{user?.name}</div>
          <div className="avatar-email">{user?.email}</div>
          <div className="avatar-role">
            <span className="badge badge-active">{user?.role}</span>
          </div>
          <div className="avatar-info-list">
            {user?.gender && <div className="avatar-info-row"><span>👤</span>{user.gender}</div>}
            {user?.phone && <div className="avatar-info-row"><span>📞</span>{user.phone}</div>}
            {user?.address && <div className="avatar-info-row"><span>📍</span>{user.address}</div>}
            {user?.occupation && <div className="avatar-info-row"><span>💼</span>{user.occupation}</div>}
          </div>
        </div>

        {/* Edit Profile */}
        <div className="profile-forms">
          <div className="glass-card profile-form-card">
            <h2 className="form-section-title">Edit Profile</h2>
            <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input id="prof-name" type="text" className="form-input" value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input id="prof-phone" type="tel" className="form-input" value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} />
                </div>
              </div>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select id="prof-gender" className="form-input" value={profileForm.gender}
                    onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}>
                    <option value="Prefer not to say">Prefer not to say</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Address</label>
                  <input id="prof-address" type="text" className="form-input" value={profileForm.address}
                    onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })} />
                </div>
              </div>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Occupation</label>
                  <input id="prof-occupation" type="text" className="form-input" value={profileForm.occupation}
                    onChange={(e) => setProfileForm({ ...profileForm, occupation: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Annual Income (₹)</label>
                  <input id="prof-income" type="number" className="form-input" value={profileForm.annualIncome}
                    onChange={(e) => setProfileForm({ ...profileForm, annualIncome: e.target.value })} />
                </div>
              </div>
              <button id="prof-save" type="submit" className="btn btn-primary" disabled={profileLoading}>
                {profileLoading ? 'Saving...' : '💾 Save Changes'}
              </button>
            </form>
          </div>

          <div className="glass-card profile-form-card">
            <h2 className="form-section-title">Change Password</h2>
            <form onSubmit={handlePwChange} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input id="pw-current" type="password" className="form-input" value={pwForm.currentPassword}
                  onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input id="pw-new" type="password" className="form-input" value={pwForm.newPassword}
                  onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input id="pw-confirm" type="password" className="form-input" value={pwForm.confirm}
                  onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })} required />
              </div>
              <button id="pw-save" type="submit" className="btn btn-outline" disabled={pwLoading}>
                {pwLoading ? 'Updating...' : '🔒 Change Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
