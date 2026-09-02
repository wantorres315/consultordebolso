<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        if (! Auth::attempt($credentials, $request->boolean('remember'))) {
            return response()->json([
                'message' => 'As credenciais informadas não conferem com nossos registros.',
            ], 422);
        }

        $request->session()->regenerate();

        return response()->json(['user' => Auth::user()->load('account')]);
    }

    public function logout(Request $request)
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->noContent();
    }

    public function user(Request $request)
    {
        return response()->json([
            'user' => $request->user()->load('account'),
            'impersonating' => $request->session()->has('impersonator_id'),
        ]);
    }
}
