export function enterFullscreen() {
    const element = document.documentElement;
    const request =
        element.requestFullscreen ||
        element.webkitRequestFullscreen ||
        element.msRequestFullscreen;

    if (!request) return;

    try {
        const result = request.call(element);
        if (result?.catch) result.catch(() => {});
    } catch {
        // Fullscreen can be denied (no user gesture, unsupported, embedded
        // iframe without permission) — the on-screen overlay works fine on
        // its own either way, so just skip it silently.
    }
}

export function exitFullscreen() {
    const isFullscreen = document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement;

    if (!isFullscreen) return;

    const exit =
        document.exitFullscreen ||
        document.webkitExitFullscreen ||
        document.msExitFullscreen;

    if (!exit) return;

    try {
        const result = exit.call(document);
        if (result?.catch) result.catch(() => {});
    } catch {
        // Ignore — nothing useful to do if the browser refuses.
    }
}
