"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Calendar,
  LineChart,
  Settings,
  LogOut,
  User,
  MoreVertical,
  Plus
} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuContent, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import Image from 'next/image';
import { useState } from 'react';
import { TradeModal } from '@/components/ui/TradeModal';

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);

  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' });
  };

  return (
    <div className="fixed left-0 top-0 flex h-screen flex-col justify-between border-r border-gray-800 bg-black/50 w-52">
      <div className="px-3 py-6">
        <div className="flex justify-center items-center h-10 rounded-lg bg-gray-800/50">
          <Image
            src="/supatrades.svg"
            alt="SupaTrades Logo"
            width={120}
            height={30}
            priority
          />
        </div>

        <button
          onClick={() => setIsTradeModalOpen(true)}
          className="mt-4 w-full flex items-center justify-center gap-2 rounded-lg px-3 py-2 bg-blue-500/80 text-white transition-all hover:bg-blue-600/90 text-sm font-medium"
        >
          <Plus className="h-4 w-4" />
          Nuevo Trade
        </button>

        <nav className="mt-6 flex flex-1 flex-col">
          <div className="space-y-1">
            <Link
              href="/dashboard"
              className={cn(
                'flex items-center gap-2 rounded-lg px-3 py-2 text-gray-400 transition-all hover:text-gray-300 text-sm',
                pathname === '/dashboard' ? 'bg-gray-800/50 text-gray-300' : 'hover:bg-gray-800/50'
              )}
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              href="/trades"
              className={cn(
                'flex items-center gap-2 rounded-lg px-3 py-2 text-gray-400 transition-all hover:text-gray-300 text-sm',
                pathname === '/trades' ? 'bg-gray-800/50 text-gray-300' : 'hover:bg-gray-800/50'
              )}
            >
              <LineChart className="h-4 w-4" />
              Trades
            </Link>
            <Link
              href="/calendar"
              className={cn(
                'flex items-center gap-2 rounded-lg px-3 py-2 text-gray-400 transition-all hover:text-gray-300 text-sm',
                pathname === '/calendar' ? 'bg-gray-800/50 text-gray-300' : 'hover:bg-gray-800/50'
              )}
            >
              <Calendar className="h-4 w-4" />
              Calendario
            </Link>
            
            <Link
              href="/accounts"
              className={cn(
                'flex items-center gap-2 rounded-lg px-3 py-2 text-gray-400 transition-all hover:text-gray-300 text-sm',
                pathname === '/accounts' ? 'bg-gray-800/50 text-gray-300' : 'hover:bg-gray-800/50'
              )}
            >
              <User className="h-4 w-4" />
              Cuentas
            </Link>
          </div>
        </nav>
      </div>

      <div className="border-t border-gray-800 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-xs font-medium text-white">
                {session?.user?.name?.[0] || 'U'}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-200">
                {session?.user?.name || 'Usuario'}
              </span>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="h-7 w-7 flex items-center justify-center text-gray-400 hover:text-gray-300 rounded-full hover:bg-gray-800/50">
                <MoreVertical className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 bg-gray-900/95 border border-gray-800 text-gray-300">
              <DropdownMenuItem asChild>
                <Link href="/settings" className="flex items-center gap-2 cursor-pointer hover:bg-gray-800/50">
                  <Settings className="h-4 w-4" />
                  <span>Configuración</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-800" />
              <DropdownMenuItem 
                onClick={handleSignOut}
                className="flex items-center gap-2 cursor-pointer text-red-400 hover:bg-red-500/10 focus:bg-red-500/10 focus:text-red-400"
              >
                <LogOut className="h-4 w-4" />
                <span>Cerrar sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <TradeModal
        isOpen={isTradeModalOpen}
        onClose={() => setIsTradeModalOpen(false)}
        onSuccess={() => {}}
      />
    </div>
  );
} 