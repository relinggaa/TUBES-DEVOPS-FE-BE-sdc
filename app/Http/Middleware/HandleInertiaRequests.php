<?php

namespace App\Http\Middleware;

use App\Models\AppSetting;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user() ? [
                    'id'       => $request->user()->id,
                    'username' => $request->user()->username,
                    'role'     => $request->user()->role,
                    'gambar'   => $request->user()->gambar,
                    'status'   => $request->user()->status,
                ] : null,
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error'   => $request->session()->get('error'),
            ],
            'appLogo' => (function () {
                try { return AppSetting::get('logo'); }
                catch (\Exception $e) { return null; }
            })(),
            'appName' => (function () {
                try { return AppSetting::get('app_name', 'Sagara Daily Checkup'); }
                catch (\Exception $e) { return 'Sagara Daily Checkup'; }
            })(),
        ];
    }
}
