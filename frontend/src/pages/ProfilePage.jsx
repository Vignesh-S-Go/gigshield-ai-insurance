import { ArrowLeft, DollarSign, Phone, User, Clock, Edit2, Activity, TrendingUp, Truck, Star } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Modal from '../components/Modal'
import { userApi } from '../api/userApi'
import useStore from '../store/useStore'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user } = useStore()
  const [profile, setProfile] = useState(null)
  const [worker, setWorker] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editingProfile, setEditingProfile] = useState(false)
  const [formData, setFormData] = useState({ name: '', platform: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user?.phone) {
      fetchProfile()
      const interval = setInterval(fetchProfile, 10000)
      return () => clearInterval(interval)
    }
  }, [user?.phone])

  useEffect(() => {
    if (profile?.isWorking) {
      const earningsInterval = setInterval(() => {
        simulateEarnings()
      }, 5000)
      return () => clearInterval(earningsInterval)
    }
  }, [profile?.isWorking])

  const fetchProfile = async () => {
    try {
      const res = await userApi.getUser(user.phone)
      if (res.success) {
        setProfile(res.data)
        setFormData({ name: res.data.name, platform: res.data.platform || 'Zomato' })
      }
      if (user?.workerId) {
        const workerRes = await fetch(`http://localhost:8000/api/workers/${user.workerId}`).then(r => r.json())
        if (workerRes.success) setWorker(workerRes.data)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const simulateEarnings = async () => {
    if (!profile?.isWorking || !profile?.id) return
    try {
      const amount = Math.random() * 15 + 5
      const res = await userApi.updateEarnings(profile.id, amount, null)
      if (res.success) setProfile(res.data)
    } catch (e) {
      console.error('Earnings update failed:', e)
    }
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      const res = await userApi.updateUser({ id: profile.id, name: formData.name, platform: formData.platform })
      if (res.success) {
        setProfile(res.data)
        setEditingProfile(false)
      }
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleToggleWork = async () => {
    try {
      const res = await userApi.toggleWork(profile.id, !profile.isWorking)
      if (res.success) setProfile(res.data)
    } catch (error) {
      console.error('Error toggling work:', error)
    }
  }

  const getRiskBadge = () => {
    const score = worker?.riskScore || profile?.riskScore || 0.5
    if (score < 0.4) return { label: 'Safe', color: 'text-success-500 bg-success-500/10' }
    if (score < 0.7) return { label: 'Medium', color: 'text-warning-500 bg-warning-500/10' }
    return { label: 'High', color: 'text-danger-500 bg-danger-500/10' }
  }

  const getAIInsight = () => {
    if (profile?.isWorking) {
      return "You're earning steadily. Maintain consistency to maximize weekly income."
    }
    return 'Start working to earn! Your hourly rate is currently competitive.'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  const riskBadge = getRiskBadge()

  return (
    <div className="animate-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-dark-400 hover:text-primary-500 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="glass-card rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center text-white text-2xl font-bold">
              {profile?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-dark-900 dark:text-white">{profile?.name}</h2>
              <p className="text-sm text-dark-400 capitalize">{profile?.role}</p>
            </div>
          </div>
          <button onClick={() => setEditingProfile(true)} className="btn-primary flex items-center gap-2">
            <Edit2 className="w-4 h-4" /> Edit
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-dark-50 dark:bg-dark-800/50">
            <Phone className="w-5 h-5 text-primary-500" />
            <div>
              <p className="text-xs text-dark-400">Phone</p>
              <p className="font-semibold text-dark-800 dark:text-dark-200">{profile?.phone}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-dark-50 dark:bg-dark-800/50">
            <Truck className="w-5 h-5 text-primary-500" />
            <div>
              <p className="text-xs text-dark-400">Platform</p>
              <p className="font-semibold text-dark-800 dark:text-dark-200">{profile?.platform || worker?.deliveryPlatform || 'Zomato'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-dark-50 dark:bg-dark-800/50">
            <Star className="w-5 h-5 text-warning-500" />
            <div>
              <p className="text-xs text-dark-400">Rating</p>
              <p className="font-semibold text-dark-800 dark:text-dark-200">{worker?.avgRating || profile?.rating || 4.5} ★</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-dark-50 dark:bg-dark-800/50">
            <Activity className="w-5 h-5 text-danger-500" />
            <div>
              <p className="text-xs text-dark-400">Risk Status</p>
              <span className={`text-xs font-bold px-2 py-1 rounded ${riskBadge.color}`}>{riskBadge.label}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 rounded-xl bg-dark-50 dark:bg-dark-800/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${profile?.isWorking ? 'bg-success-500 animate-pulse' : 'bg-dark-400'}`}></div>
            <span className="font-semibold text-dark-800 dark:text-dark-200">
              {profile?.isWorking ? 'Currently Working' : 'Not Working'}
            </span>
          </div>
          <button
            onClick={handleToggleWork}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${profile?.isWorking ? 'bg-success-500' : 'bg-dark-300'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${profile?.isWorking ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="glass-card rounded-2xl p-5 border-l-4 border-success-500">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-success-500" />
            <span className="text-sm text-dark-400">Today Earnings</span>
          </div>
          <p className="text-2xl font-bold text-success-600 dark:text-success-400">
            ₹{(profile?.todayEarnings || 0).toLocaleString()}
          </p>
        </div>

        <div className="glass-card rounded-2xl p-5 border-l-4 border-primary-500">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-primary-500" />
            <span className="text-sm text-dark-400">Weekly Earnings</span>
          </div>
          <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
            ₹{(profile?.weeklyEarnings || 0).toLocaleString()}
          </p>
        </div>

        <div className="glass-card rounded-2xl p-5 border-l-4 border-warning-500">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-5 h-5 text-warning-500" />
            <span className="text-sm text-dark-400">Total Earnings</span>
          </div>
          <p className="text-2xl font-bold text-warning-600 dark:text-warning-400">
            ₹{(profile?.totalEarnings || 0).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-5 h-5 text-primary-500" />
          <h3 className="text-lg font-bold text-dark-800 dark:text-dark-200">AI Insight</h3>
        </div>
        <p className="text-dark-600 dark:text-dark-300">{getAIInsight()}</p>
      </div>

      <Modal isOpen={editingProfile} onClose={() => setEditingProfile(false)} title="Edit Profile">
        <div className="space-y-4">
          <div>
            <label className="text-sm text-dark-400 mb-1 block">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-dark-900 dark:text-white"
            />
          </div>
          <div>
            <label className="text-sm text-dark-400 mb-1 block">Platform</label>
            <select
              value={formData.platform}
              onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-dark-900 dark:text-white"
            >
              <option value="Zomato">Zomato</option>
              <option value="Swiggy">Swiggy</option>
            </select>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setEditingProfile(false)} className="flex-1 px-4 py-2 rounded-lg border border-dark-200 dark:border-dark-700 text-dark-600 dark:text-dark-400">
              Cancel
            </button>
            <button onClick={handleSaveProfile} disabled={saving} className="flex-1 btn-primary">
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
