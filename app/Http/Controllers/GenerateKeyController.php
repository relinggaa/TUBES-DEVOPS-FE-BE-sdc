<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GenerateKeyController extends Controller
{
 
    public function index(Request $request)
    {
        $query = User::whereNotNull('key')
            ->select('id', 'username', 'role', 'key', 'gambar', 'created_at');
        
        // Search filter
        if ($request->has('search') && $request->search !== null && $request->search !== '') {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('username', 'like', '%' . $search . '%')
                  ->orWhere('key', 'like', '%' . $search . '%');
            });
        }
        
        // Role filter
        if ($request->has('filter_role') && $request->filter_role !== null && $request->filter_role !== 'all') {
            $query->where('role', $request->filter_role);
        }
        
        $users = $query->orderBy('created_at', 'desc')
            ->paginate(5)
            ->appends($request->only(['search', 'filter_role']));

        return Inertia::render('Admin/GenerateKey', [
            'users' => $users,
            'filters' => [
                'search' => $request->search ?? '',
                'filter_role' => $request->filter_role ?? 'all'
            ]
        ]);
    }

 
    public function store(Request $request)
    {
        $validated = $request->validate([
            'username' => 'required|string|max:255|unique:users,username',
            'role' => 'required|in:Admin,Mekanik,Driver',
            'key' => 'required|string|size:8|unique:users,key',
        ]);

        User::create($validated);

    

        return redirect()->route('generate-key.index')
            ->with('success', 'User berhasil ditambahkan!');
    }


    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);
        
        $validated = $request->validate([
            'username' => 'required|string|max:255|unique:users,username,' . $id,
            'role' => 'required|in:Admin,Mekanik,Driver',
            'key' => 'required|string|size:8|unique:users,key,' . $id,
        ]);

        $user->update($validated);


        return redirect()->route('generate-key.index')
            ->with('success', 'User berhasil diupdate!');
    }

    public function destroy(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $user->delete();

   

        return redirect()->route('generate-key.index')
            ->with('success', 'User berhasil dihapus!');
    }

  
}
