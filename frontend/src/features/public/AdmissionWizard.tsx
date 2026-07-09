import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHostels, getRooms, submitRequest } from '@/services/publicAdmission';
import type { AdmissionRequestCreateDTO } from '@/types';
import { getToken as getRecaptchaToken } from '@/utils/recaptcha';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

const AdmissionWizard: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<AdmissionRequestCreateDTO>({});
  const [hostels, setHostels] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    getHostels().then(res => {
      if (res.data && res.data.length > 0) {
        setHostels(res.data);
      } else {
        setHostels([
          { hostelCode: 'H1', name: 'sri sai ram ladies hostel h1' },
          { hostelCode: 'H2', name: 'sri sai ram ladies hostel h2' },
          { hostelCode: 'H3', name: 'sri sai ram ladies hostel h3' },
          { hostelCode: 'H4', name: 'sri sai ram ladies hostel h4' }
        ]);
      }
    }).catch(() => {
      setHostels([
        { hostelCode: 'H1', name: 'sri sai ram ladies hostel h1' },
        { hostelCode: 'H2', name: 'sri sai ram ladies hostel h2' },
        { hostelCode: 'H3', name: 'sri sai ram ladies hostel h3' },
        { hostelCode: 'H4', name: 'sri sai ram ladies hostel h4' }
      ]);
    });
  }, []);

  useEffect(() => {
    if (!formData.hostelCode) {
      setRooms([]);
      return;
    }
    const selectedHostel = hostels.find(h => h.hostelCode === formData.hostelCode);
    const hostelId = selectedHostel?.id;
    if (hostelId) {
      getRooms(hostelId).then(res => {
        setRooms(res.data || []);
      }).catch(() => setRooms([]));
    } else {
      // Hostel found by code but no numeric id yet — fetch all hostels fresh
      import('@/services/publicAdmission').then(({ getHostels, getRooms: fetchRooms }) => {
        getHostels().then(res => {
          const freshHostels: any[] = res.data || [];
          setHostels(freshHostels);
          const fresh = freshHostels.find((h: any) => h.hostelCode === formData.hostelCode);
          if (fresh?.id) {
            fetchRooms(fresh.id).then(r => setRooms(r.data || [])).catch(() => setRooms([]));
          } else {
            setRooms([]);
          }
        }).catch(() => setRooms([]));
      });
    }
  }, [formData.hostelCode, hostels]);

  const updateState = (updates: Partial<AdmissionRequestCreateDTO>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    const newErrors: Record<string, string> = {};
    if (!formData.studentName?.trim()) newErrors.studentName = 'Student Name is required';

    if (!formData.aadhaarNumber?.trim()) {
      newErrors.aadhaarNumber = 'Aadhaar Number is required';
    } else if (!/^\d{12}$/.test(formData.aadhaarNumber.trim())) {
      newErrors.aadhaarNumber = 'Aadhaar must be exactly 12 digits';
    }

    if (!formData.phone?.trim()) {
      newErrors.phone = 'Phone Number is required';
    } else if (!/^\d{10}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Phone number must be exactly 10 digits';
    }

    if (!formData.parentPhone?.trim()) {
      newErrors.parentPhone = 'Parent Phone Number is required';
    } else if (!/^\d{10}$/.test(formData.parentPhone.trim())) {
      newErrors.parentPhone = 'Parent Phone number must be exactly 10 digits';
    } else if (formData.phone?.trim() === formData.parentPhone.trim()) {
      newErrors.parentPhone = 'Parent phone number must be different from student phone number';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.fatherName?.trim()) newErrors.fatherName = "Father's Name is required";
    if (!formData.address?.trim()) newErrors.address = 'Full Address is required';
    if (!formData.hostelCode?.trim()) newErrors.hostelCode = 'Hostel selection is required';
    if (!formData.roomNumber?.trim()) newErrors.roomNumber = 'Room selection is required';

    setFieldErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      setIsSubmitting(true);
      const token = await getRecaptchaToken();
      const payload = {
        ...formData,
        studentName: formData.studentName?.trim(),
        aadhaarNumber: formData.aadhaarNumber?.trim(),
        phone: formData.phone?.trim(),
        parentPhone: formData.parentPhone?.trim(),
        email: formData.email?.trim(),
        fatherName: formData.fatherName?.trim(),
        address: formData.address?.trim(),
        recaptchaToken: token
      };
      await submitRequest(payload);
      const firstName = formData.studentName?.trim().split(' ')[0] || '';
      toast.success(`Thanks for submitting the form ${firstName}!`);
      navigate('/admission/success', { state: { firstName } });
    } catch (err: any) {
      if (err.response?.status === 429) {
        toast.error('You have submitted too many requests. Please try again after some time.', { duration: 5000 });
      } else {
        const data = err.response?.data;
        let errorMsg = data?.message || data?.error || 'Submission failed. Please try again.';
        if (data?.details) {
          if (typeof data.details === 'object') {
            // It's a map of field -> error
            const messages = Object.values(data.details).join(', ');
            errorMsg += ` - ${messages}`;

            // We can also set them as field errors on the frontend!
            setFieldErrors(prev => ({ ...prev, ...(data.details as Record<string, string>) }));
          } else {
            errorMsg += ` - ${data.details}`;
          }
        }
        toast.error(errorMsg, { duration: 5000 });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Allow body to scroll for this public page (global CSS sets overflow:hidden for app layout)
  useEffect(() => {
    document.documentElement.style.overflow = 'auto';
    document.body.style.overflow = 'auto';
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground py-4 sm:py-10 px-2 sm:px-4 flex items-center justify-center relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute top-[60%] -right-[10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px]" />
      </div>

      <div className="w-full max-w-3xl mx-auto bg-card text-card-foreground shadow-2xl rounded-2xl border z-10 overflow-hidden relative backdrop-blur-xl">
        <div className="bg-primary/10 border-b px-4 sm:px-8 py-6 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary">Sri Sai Ram Ladies Hostel</h1>
          <p className="text-muted-foreground text-sm mt-2">Complete the form below to submit your application.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-8 space-y-8 sm:space-y-10">

          {/* Section 1: Personal Info */}
          <div>
            <h2 className="text-lg font-semibold text-foreground border-b pb-2 mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">Student Name *</label>
                <input
                  type="text"
                  autoComplete="name"
                  value={formData.studentName ?? ''}
                  onChange={e => updateState({ studentName: e.target.value })}
                  className={`w-full px-4 py-2.5 bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all ${fieldErrors.studentName ? 'border-destructive focus:ring-destructive' : 'border-input'}`}
                  placeholder="Enter full name"
                />
                {fieldErrors.studentName && <p className="text-destructive text-xs mt-1.5 font-medium">{fieldErrors.studentName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">Email Address</label>
                <input
                  type="text"
                  autoComplete="off"
                  value={formData.email ?? ''}
                  onChange={e => updateState({ email: e.target.value })}
                  className={`w-full px-4 py-2.5 bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all ${fieldErrors.email ? 'border-destructive focus:ring-destructive' : 'border-input'}`}
                  placeholder="student@example.com"
                />
                {fieldErrors.email && <p className="text-destructive text-xs mt-1.5 font-medium">{fieldErrors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">Aadhaar *</label>
                <input
                  type="text"
                  autoComplete="off"
                  inputMode="numeric"
                  maxLength={12}
                  value={formData.aadhaarNumber ?? ''}
                  onChange={e => updateState({ aadhaarNumber: e.target.value })}
                  className={`w-full px-4 py-2.5 bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all ${fieldErrors.aadhaarNumber ? 'border-destructive focus:ring-destructive' : 'border-input'}`}
                  placeholder="Enter 12-digit Aadhaar number"
                />
                {fieldErrors.aadhaarNumber && <p className="text-destructive text-xs mt-1.5 font-medium">{fieldErrors.aadhaarNumber}</p>}
              </div>
            </div>
          </div>

          {/* Section 2: Contact Details */}
          <div>
            <h2 className="text-lg font-semibold text-foreground border-b pb-2 mb-4">Contact Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">Phone Number *</label>
                <input
                  type="text"
                  autoComplete="off"
                  inputMode="numeric"
                  maxLength={10}
                  value={formData.phone ?? ''}
                  onChange={e => updateState({ phone: e.target.value })}
                  className={`w-full px-4 py-2.5 bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all ${fieldErrors.phone ? 'border-destructive focus:ring-destructive' : 'border-input'}`}
                  placeholder="9876543210"
                />
                {fieldErrors.phone && <p className="text-destructive text-xs mt-1.5 font-medium">{fieldErrors.phone}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">Parent Phone Number *</label>
                <input
                  type="text"
                  autoComplete="off"
                  inputMode="numeric"
                  maxLength={10}
                  value={formData.parentPhone ?? ''}
                  onChange={e => updateState({ parentPhone: e.target.value })}
                  className={`w-full px-4 py-2.5 bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all ${fieldErrors.parentPhone ? 'border-destructive focus:ring-destructive' : 'border-input'}`}
                  placeholder="9876543210"
                />
                {fieldErrors.parentPhone && <p className="text-destructive text-xs mt-1.5 font-medium">{fieldErrors.parentPhone}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">Father's Name *</label>
                <input
                  type="text"
                  autoComplete="off"
                  value={formData.fatherName ?? ''}
                  onChange={e => updateState({ fatherName: e.target.value })}
                  className={`w-full px-4 py-2.5 bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all ${fieldErrors.fatherName ? 'border-destructive focus:ring-destructive' : 'border-input'}`}
                  placeholder="Enter father's name"
                />
                {fieldErrors.fatherName && <p className="text-destructive text-xs mt-1.5 font-medium">{fieldErrors.fatherName}</p>}
              </div>
            </div>
          </div>

          {/* Section 3: Address */}
          <div>
            <h2 className="text-lg font-semibold text-foreground border-b pb-2 mb-4">Address</h2>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">Full Address *</label>
              <textarea
                value={formData.address ?? ''}
                onChange={e => updateState({ address: e.target.value })}
                rows={3}
                className={`w-full px-4 py-2.5 bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-none transition-all ${fieldErrors.address ? 'border-destructive focus:ring-destructive' : 'border-input'}`}
                placeholder="Enter complete residential address"
              />
              {fieldErrors.address && <p className="text-destructive text-xs mt-1.5 font-medium">{fieldErrors.address}</p>}
            </div>
          </div>

          {/* Section 4: Hostel Preference */}
          <div>
            <h2 className="text-lg font-semibold text-foreground border-b pb-2 mb-4">Hostel Preference</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">Select Preferred Hostel *</label>
                <select
                  value={formData.hostelCode ?? ''}
                  onChange={e => updateState({ hostelCode: e.target.value, roomNumber: '' })}
                  className={`w-full px-4 py-2.5 bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all ${fieldErrors.hostelCode ? 'border-destructive focus:ring-destructive' : 'border-input'}`}
                >
                  <option value="">-- Choose a Hostel --</option>
                  {hostels.map(h => (
                    <option key={h.hostelCode} value={h.hostelCode}>{h.name}</option>
                  ))}
                </select>
                {fieldErrors.hostelCode && <p className="text-destructive text-xs mt-1.5 font-medium">{fieldErrors.hostelCode}</p>}
              </div>

              {formData.hostelCode && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">Select Preferred Room Type / Number *</label>
                  <select
                    value={formData.roomNumber ?? ''}
                    onChange={e => updateState({ roomNumber: e.target.value })}
                    className={`w-full px-4 py-2.5 bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all ${fieldErrors.roomNumber ? 'border-destructive focus:ring-destructive' : 'border-input'}`}
                  >
                    <option value="">-- Choose a Room --</option>
                    {rooms.map(r => (
                      <option key={r.roomNumber} value={r.roomNumber} disabled={r.vacantBeds === 0}>
                        {r.roomNumber} (Capacity: {r.capacity}, Available: {r.vacantBeds})
                      </option>
                    ))}
                  </select>
                  {fieldErrors.roomNumber && <p className="text-destructive text-xs mt-1.5 font-medium">{fieldErrors.roomNumber}</p>}
                  <p className="text-xs text-muted-foreground mt-2">* Bed assignment will be done automatically by the administration upon approval.</p>
                </motion.div>
              )}
            </div>
          </div>

          <div className="pt-6 flex justify-end border-t">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 shadow-md transition-all disabled:opacity-50 w-full sm:w-auto"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdmissionWizard;

