"use client";

import { FormControl } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
interface Representante {
  id: string;
  name: string;
}

interface RepreEscolaSelectProps {
  representantes: Representante[];
  onValueChange: (value: string) => void;
  defaultValue: string;
}

const RepreEscolaSelect = ({
  representantes,
  onValueChange,
  defaultValue,
}: RepreEscolaSelectProps) => {
  return (
    <Select onValueChange={onValueChange} defaultValue={defaultValue}>
      <FormControl>
        <SelectTrigger>
          <SelectValue placeholder="Representante" />
        </SelectTrigger>
      </FormControl>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Representantes</SelectLabel>
          {representantes.map((representante) => (
            <SelectItem key={representante.id} value={representante.id}>
              {representante.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default RepreEscolaSelect;
