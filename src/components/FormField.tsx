import { ChangeEvent } from 'react';

interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'number' | 'date' | 'textarea' | 'select';
  value: string | number | undefined;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  placeholder?: string;
  required?: boolean;
  options?: { label: string; value: string }[];
}

export default function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required,
  options
}: FormFieldProps) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">
        {label}{required ? ' *' : ''}
      </label>
      {type === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          value={value || ''}
          onChange={onChange}
          placeholder={placeholder}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={3}
          required={required}
        />
      ) : type === 'select' ? (
        <select
          id={name}
          name={name}
          value={value || ''}
          onChange={onChange}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required={required}
        >
          <option value="">Select...</option>
          {options?.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value ?? ''}
          onChange={onChange}
          placeholder={placeholder}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required={required}
        />
      )}
    </div>
  );
}
