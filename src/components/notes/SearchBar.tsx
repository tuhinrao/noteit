"use client";

import SearchIcon from "@mui/icons-material/Search";
import { InputAdornment, TextField } from "@mui/material";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({ value, onChange, placeholder }: SearchBarProps) {
  return (
    <TextField
      fullWidth
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      size="small"
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        ),
      }}
    />
  );
}