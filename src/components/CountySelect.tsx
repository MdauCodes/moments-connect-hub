import { useMemo, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { KENYA_COUNTY_NAMES_NAIROBI_FIRST } from "@/data/kenyaCounties";

interface CountySelectProps {
  value: string;
  onChange: (county: string) => void;
  required?: boolean;
  placeholder?: string;
  className?: string;
  id?: string;
}

/** Searchable Kenya county picker (47 counties, Nairobi first). */
export function CountySelect({
  value,
  onChange,
  required,
  placeholder = "Select county…",
  className,
  id,
}: CountySelectProps) {
  const [open, setOpen] = useState(false);
  const counties = useMemo(() => KENYA_COUNTIES, []);

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            id={id}
            type="button"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "flex w-full items-center justify-between rounded-lg border border-border bg-background px-4 py-3 text-left text-sm transition focus:outline-none focus:ring-2 focus:ring-primary/20",
              !value && "text-muted-foreground",
              className,
            )}
          >
            <span className="truncate">{value || placeholder}</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search county…" />
            <CommandList>
              <CommandEmpty>No county found.</CommandEmpty>
              <CommandGroup>
                {counties.map((c) => (
                  <CommandItem
                    key={c}
                    value={c}
                    onSelect={() => {
                      onChange(c);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === c ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {c}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {/* Hidden native input so the surrounding form picks up required-state and submits the value. */}
      {required !== undefined && (
        <input
          tabIndex={-1}
          aria-hidden
          required={required}
          value={value}
          onChange={() => {}}
          style={{
            opacity: 0,
            height: 0,
            width: 0,
            position: "absolute",
            pointerEvents: "none",
          }}
        />
      )}
    </>
  );
}
