import { useState, useEffect } from 'react';
import FormField from './FormField';
import { Applicant, APPLICANT_STATUSES, CreateApplicantRequest } from '../models/Applicant';

interface ApplicantFormProps {
  applicant?: Applicant | null;
  storeNumber: number;
  onSubmit: (data: CreateApplicantRequest) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const STATUS_OPTIONS = APPLICANT_STATUSES.map((s) => ({ label: s, value: s }));

export default function ApplicantForm({
  applicant,
  storeNumber,
  onSubmit,
  onCancel,
  isSubmitting = false
}: ApplicantFormProps) {
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    positionapplied: '',
    source: '',
    status: 'Applied' as string,
    resumeurl: '',
    interviewdate: '',
    hireddate: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (applicant) {
      setFormData({
        firstname: applicant.firstname ?? '',
        lastname: applicant.lastname ?? '',
        email: applicant.email ?? '',
        phone: applicant.phone ?? '',
        positionapplied: applicant.positionapplied ?? '',
        source: applicant.source ?? '',
        status: applicant.status ?? 'Applied',
        resumeurl: applicant.resumeurl ?? '',
        interviewdate: applicant.interviewdate ?? '',
        hireddate: applicant.hireddate ?? ''
      });
    } else {
      setFormData({
        firstname: '',
        lastname: '',
        email: '',
        phone: '',
        positionapplied: '',
        source: '',
        status: 'Applied',
        resumeurl: '',
        interviewdate: '',
        hireddate: ''
      });
    }
  }, [applicant]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!formData.firstname.trim()) next.firstname = 'First name is required';
    if (!formData.lastname.trim()) next.lastname = 'Last name is required';
    if (!formData.email.trim()) next.email = 'Email is required';
    if (!formData.positionapplied.trim()) next.positionapplied = 'Position applied is required';
    if (formData.status && !APPLICANT_STATUSES.includes(formData.status as any)) {
      next.status = 'Invalid status';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      storenumber: storeNumber,
      firstname: formData.firstname.trim(),
      lastname: formData.lastname.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim() || null,
      positionapplied: formData.positionapplied.trim(),
      source: formData.source.trim() || null,
      status: formData.status,
      resumeurl: formData.resumeurl.trim() || null,
      interviewdate: formData.interviewdate.trim() || null,
      hireddate: formData.hireddate.trim() || null
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="First name"
          name="firstname"
          type="text"
          value={formData.firstname}
          onChange={handleChange}
          required
        />
        <FormField
          label="Last name"
          name="lastname"
          type="text"
          value={formData.lastname}
          onChange={handleChange}
          required
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Email"
          name="email"
          type="text"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <FormField
          label="Phone"
          name="phone"
          type="text"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Optional"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Position applied"
          name="positionapplied"
          type="text"
          value={formData.positionapplied}
          onChange={handleChange}
          required
        />
        <FormField
          label="Source"
          name="source"
          type="text"
          value={formData.source}
          onChange={handleChange}
          placeholder="Optional"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Interview date"
          name="interviewdate"
          type="date"
          value={formData.interviewdate}
          onChange={handleChange}
        />
        <FormField
          label="Hired date"
          name="hireddate"
          type="date"
          value={formData.hireddate}
          onChange={handleChange}
        />
      </div>
      <FormField
        label="Status"
        name="status"
        type="select"
        value={formData.status}
        onChange={handleChange}
        options={STATUS_OPTIONS}
      />
      <FormField
        label="Resume URL"
        name="resumeurl"
        type="text"
        value={formData.resumeurl}
        onChange={handleChange}
        placeholder="Optional URL"
      />
      {errors.general && (
        <p className="text-sm text-red-600">{errors.general}</p>
      )}
      <div className="flex justify-end gap-2 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : applicant ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
}
