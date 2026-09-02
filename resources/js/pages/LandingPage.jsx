import { useState } from 'react';
import Header from '../components/Header';
import Home from '../components/Home';
import AuthModal from '../components/AuthModal';

export default function LandingPage() {
    const [authOpen, setAuthOpen] = useState(false);

    return (
        <div className="flex min-h-screen flex-col items-center bg-app px-6 text-ink antialiased">
            <Header onOpenAuth={() => setAuthOpen(true)} />
            <Home />

            {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
        </div>
    );
}
