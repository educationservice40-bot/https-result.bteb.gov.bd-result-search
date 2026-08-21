import { useEffect, useRef, useState } from 'react'
import type { Option } from '../constants'

interface Props {
  value: string
  options: Option[]
  placeholder: string
  disabled?: boolean
  onChange: (value: string) => void
  id?: string
  labelledBy?: string
}

/**
 * A listbox rather than a native `<select>`: the option lists here are built
 * from API data and need to look identical across platforms, which a native
 * control on iOS and Android will not do.
 */
export function Select({
  value,
  options,
  placeholder,
  disabled,
  onChange,
  id,
  labelledBy,
}: Props) {
  const [open, setOpen] = useState(false)
  const wrap = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  // A field that loses its options mid-interaction must not keep a menu open
  // over an empty list.
  useEffect(() => {
    if (disabled) setOpen(false)
  }, [disabled])

  const selected = options.find((o) => o.value === value)

  return (
    <div className="dropdown" ref={wrap}>
      <button
        type="button"
        id={id}
        className="field-control dropdown-button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={labelledBy}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={selected ? undefined : 'dropdown-placeholder'}>
          {selected ? selected.label : placeholder}
        </span>
      </button>

      {open && options.length > 0 && (
        <div className="dropdown-menu" role="listbox">
          {options.map((o) => (
            <div
              key={o.value}
              role="option"
              aria-selected={o.value === value}
              className="dropdown-option"
              onMouseDown={() => {
                onChange(o.value)
                setOpen(false)
              }}
            >
              {o.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
