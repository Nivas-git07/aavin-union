import * as Select from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import type { ReactNode } from "react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  icon?: ReactNode;
  disabled?: boolean;
}

// Radix reserves an empty item value for clearing the selection.
const ALL_OPTION = "__all__";

export function SelectField({
  label,
  value,
  options,
  onChange,
  icon,
  disabled = false,
}: SelectFieldProps) {
  return (
    <Select.Root
      value={value || ALL_OPTION}
      onValueChange={(next) => onChange(next === ALL_OPTION ? "" : next)}
      disabled={disabled}
    >
      <Select.Trigger
        className="select-trigger"
        aria-label={label}
        value={value}
      >
        {icon && (
          <span className="select-trigger-icon" aria-hidden="true">
            {icon}
          </span>
        )}
        <Select.Value>
          {options.find((option) => option.value === value)?.label ||
            "Choose an option"}
        </Select.Value>
        <Select.Icon className="select-chevron">
          <ChevronDown size={15} />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content
          className="select-menu"
          position="popper"
          align="start"
          sideOffset={8}
          collisionPadding={12}
        >
          <Select.ScrollUpButton className="select-scroll">
            <ChevronUp size={15} />
          </Select.ScrollUpButton>
          <Select.Viewport className="select-viewport">
            <Select.Group>
              <Select.Label className="select-menu-label">{label}</Select.Label>
              {options.map((option) => (
                <Select.Item
                  className="select-option"
                  key={option.value}
                  value={option.value || ALL_OPTION}
                >
                  <Select.ItemText>{option.label}</Select.ItemText>
                  <Select.ItemIndicator className="select-check">
                    <Check size={16} />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Group>
          </Select.Viewport>
          <Select.ScrollDownButton className="select-scroll">
            <ChevronDown size={15} />
          </Select.ScrollDownButton>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
