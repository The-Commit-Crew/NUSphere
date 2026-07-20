
import { useState } from 'react'

function PasswordInput({ name, value, onChange, placeholder = '••••••••', label = 'Password' }) {
  const [show, setShow] = useState(false)

  return (
    <div className="flex flex-col gap-1">
      <label style={{ color: '#1A1512', fontSize: '13px' }} className="font-medium">
        {label}
      </label>
      <div className="relative">
        <input
          name={name}
          type={show ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required
          style={{ border: '1px solid #E8E0D8', color: '#1A1512', backgroundColor: '#FAFAF8' }}
          className="px-3 py-2 rounded-lg text-sm outline-none w-full pr-12"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium"
          style={{ color: '#9A8880' }}
        >
          {show ? 'Hide' : 'Show'}
        </button>
      </div>
    </div>
  )
}

export default PasswordInput