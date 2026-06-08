<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureMekanik
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!Auth::check()) {
            return redirect()->route('mekanik.login')
                ->with('error', 'Anda harus login terlebih dahulu.');
        }

        if (Auth::user()->role !== 'Mekanik') {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
            
            return redirect()->route('mekanik.login')
                ->with('error', 'Anda tidak memiliki akses sebagai mekanik.');
        }

        return $next($request);
    }
}
