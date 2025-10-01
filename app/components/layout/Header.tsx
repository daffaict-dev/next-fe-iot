"use client";

import { User, LogOut, Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface User {
  id: number;
  username: string;
  created_at: string;
  updated_at: string;
}

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
}

export function Header({ user, onLogout }: HeaderProps) {
  return (
    <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-gray-800/40 px-4 lg:px-6">
      {/* Spacer untuk mobile - sejajarkan dengan sidebar toggle */}
      <div className="w-12 lg:hidden" />
      
      <div className="flex-1">
        <h1 className="text-lg lg:text-xl font-semibold text-white">Dashboard</h1>
      </div>
      
      <div className="flex items-center gap-2 lg:gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-9 w-9 lg:h-10 lg:w-10 text-gray-400 hover:text-white"
        >
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="relative h-8 w-8 lg:h-9 lg:w-9 rounded-full"
            >
              <User className="h-4 w-4 lg:h-4 lg:w-4 text-gray-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.username}</p>
                <p className="text-xs leading-none text-gray-600">
                  User ID: {user?.id}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout} className="text-red-600 cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}