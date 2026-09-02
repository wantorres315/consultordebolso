<?php

use App\Http\Controllers\SeoController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/sitemap.xml', [SeoController::class, 'index']);
Route::get('/robots.txt', [SeoController::class, 'robots']);

Route::get('/{any}', function () {
    return view('welcome');
})->where('any', '^(?!api).*$');
