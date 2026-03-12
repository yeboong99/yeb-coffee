"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface CapsuleSearchProps {
  onSearch?: (query: string) => void;
}

export function CapsuleSearch({ onSearch }: CapsuleSearchProps) {
  const [query, setQuery] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    onSearch?.(e.target.value);
  };

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        value={query}
        onChange={handleChange}
        placeholder="캡슐 이름으로 검색..."
        className="pl-9"
      />
    </div>
  );
}
