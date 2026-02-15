import { useState, useRef } from 'react'
import { gsap } from 'gsap'
import MainMenu from './components/MainMenu.jsx'
import PetGame from './components/PetGame.jsx'

function App() {
    const [screen, setScreen] = useState('menu')
    const containerRef = useRef(null)

    const goToGame = () => {
        gsap.to(containerRef.current, {
            opacity: 0,
            scale: 0.95,
            duration: 0.4,
            ease: 'power2.in',
            onComplete: () => {
                setScreen('game')
                gsap.fromTo(containerRef.current,
                    { opacity: 0, scale: 1.05 },
                    { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' }
                )
            }
        })
    }

    const goToMenu = () => {
        gsap.to(containerRef.current, {
            opacity: 0,
            duration: 0.3,
            ease: 'power2.in',
            onComplete: () => {
                setScreen('menu')
                gsap.fromTo(containerRef.current,
                    { opacity: 0 },
                    { opacity: 1, duration: 0.4, ease: 'power2.out' }
                )
            }
        })
    }

    return (
        <div ref={containerRef} className="w-full h-full">
            {screen === 'menu' ? (
                <MainMenu onPlay={goToGame} />
            ) : (
                <PetGame onBack={goToMenu} />
            )}
        </div>
    )
}

export default App
