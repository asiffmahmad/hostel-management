import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHostels, getRooms, submitRequest } from '@/services/publicAdmission';
import type { AdmissionRequestCreateDTO } from '@/types';
import { getToken as getRecaptchaToken } from '@/utils/recaptcha';
import { toast } from 'react-hot-toast';

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
    if (formData.hostelCode) {
      const selectedHostel = hostels.find(h => h.hostelCode === formData.hostelCode);
      if (selectedHostel && selectedHostel.id) {
        getRooms(selectedHostel.id).then(res => {
          setRooms(res.data || []);
        }).catch(() => {
          setRooms([]);
        });
      } else {
        setRooms([]);
      }
    } else {
      setRooms([]);
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

  return (
    <div className="h-[100dvh] overflow-y-auto bg-gray-50 py-4 sm:py-10 px-2 sm:px-4">
      <div className="w-full max-w-3xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden">
        <div className="bg-primary px-4 sm:px-8 py-4 sm:py-6 text-white text-center">
          <h1 className="text-xl sm:text-2xl font-bold">sri sai ram ladies Hostel</h1>
          <p className="text-primary-foreground/80 text-sm mt-1">Complete the form below to submit your application.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-8 space-y-6 sm:space-y-8">

          {/* Section 1: Personal Info */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-black">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student Name *</label>
                <input
                  type="text"
                  value={formData.studentName ?? ''}
                  onChange={e => updateState({ studentName: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-md focus:ring-primary focus:border-primary outline-none ${fieldErrors.studentName ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Enter full name"
                />
                {fieldErrors.studentName && <p className="text-red-500 text-xs mt-1">{fieldErrors.studentName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={formData.email ?? ''}
                  onChange={e => updateState({ email: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-md focus:ring-primary focus:border-primary outline-none ${fieldErrors.email ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="student@example.com"
                />
                {fieldErrors.email && <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Aadhaar *</label>
                <input
                  type="text"
                  value={formData.aadhaarNumber ?? ''}
                  onChange={e => updateState({ aadhaarNumber: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-md focus:ring-primary focus:border-primary outline-none ${fieldErrors.aadhaarNumber ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Enter 12-digit Aadhaar number"
                />
                {fieldErrors.aadhaarNumber && <p className="text-red-500 text-xs mt-1">{fieldErrors.aadhaarNumber}</p>}
              </div>
            </div>
          </div>

          {/* Section 2: Contact Details */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Contact Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-black">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  value={formData.phone ?? ''}
                  onChange={e => updateState({ phone: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-md focus:ring-primary focus:border-primary outline-none ${fieldErrors.phone ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="9876543210"
                />
                {fieldErrors.phone && <p className="text-red-500 text-xs mt-1">{fieldErrors.phone}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parent Phone Number *</label>
                <input
                  type="tel"
                  value={formData.parentPhone ?? ''}
                  onChange={e => updateState({ parentPhone: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-md focus:ring-primary focus:border-primary outline-none ${fieldErrors.parentPhone ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="9876543210"
                />
                {fieldErrors.parentPhone && <p className="text-red-500 text-xs mt-1">{fieldErrors.parentPhone}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Father's Name *</label>
                <input
                  type="text"
                  value={formData.fatherName ?? ''}
                  onChange={e => updateState({ fatherName: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-md focus:ring-primary focus:border-primary outline-none ${fieldErrors.fatherName ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Enter father's name"
                />
                {fieldErrors.fatherName && <p className="text-red-500 text-xs mt-1">{fieldErrors.fatherName}</p>}
              </div>
            </div>
          </div>

          {/* Section 3: Address */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Address</h2>
            <div className="text-black">
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Address *</label>
              <textarea
                value={formData.address ?? ''}
                onChange={e => updateState({ address: e.target.value })}
                rows={3}
                className={`w-full px-4 py-2 border rounded-md focus:ring-primary focus:border-primary outline-none resize-none ${fieldErrors.address ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter complete residential address"
              />
              {fieldErrors.address && <p className="text-red-500 text-xs mt-1">{fieldErrors.address}</p>}
            </div>
          </div>

          {/* Section 4: Hostel Preference */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Hostel Preference</h2>
            <div className="space-y-4 text-black">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Preferred Hostel *</label>
                <select
                  value={formData.hostelCode ?? ''}
                  onChange={e => updateState({ hostelCode: e.target.value, roomNumber: '' })}
                  className={`w-full px-4 py-2 border rounded-md focus:ring-primary focus:border-primary outline-none bg-white ${fieldErrors.hostelCode ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">-- Choose a Hostel --</option>
                  {hostels.map(h => (
                    <option key={h.hostelCode} value={h.hostelCode}>{h.name}</option>
                  ))}
                </select>
                {fieldErrors.hostelCode && <p className="text-red-500 text-xs mt-1">{fieldErrors.hostelCode}</p>}
              </div>

              {formData.hostelCode && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Preferred Room Type / Number *</label>
                  <select
                    value={formData.roomNumber ?? ''}
                    onChange={e => updateState({ roomNumber: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-md focus:ring-primary focus:border-primary outline-none bg-white ${fieldErrors.roomNumber ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <option value="">-- Choose a Room --</option>
                    {rooms.map(r => (
                      <option key={r.roomNumber} value={r.roomNumber} disabled={r.vacantBeds === 0}>
                        {r.roomNumber} (Capacity: {r.capacity}, Available: {r.vacantBeds})
                      </option>
                    ))}
                  </select>
                  {fieldErrors.roomNumber && <p className="text-red-500 text-xs mt-1">{fieldErrors.roomNumber}</p>}
                  <p className="text-xs text-gray-500 mt-2">* Bed assignment will be done automatically by the administration upon approval.</p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-primary text-white rounded-md font-semibold hover:bg-primary/90 shadow-sm transition-colors"
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

