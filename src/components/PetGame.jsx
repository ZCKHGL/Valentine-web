import { useEffect, useRef, useState, useCallback } from 'react'
import { gsap } from 'gsap'
import useDogSprite from '../hooks/useDogSprite.js'
import sweetMessages from '../data/sweetMessages.js'
import './PetGame.css'

export default function PetGame({ onBack }) {
    const { state, spriteUrl, triggerInteraction, triggerPet } = useDogSprite()
    const [message, setMessage] = useState(null)
    const [loveMeter, setLoveMeter] = useState(0)
    const [showHint, setShowHint] = useState(true)
    const [heartsEmoji, setHeartsEmoji] = useState([])

    const dogContainerRef = useRef(null)
    const speechRef = useRef(null)
    const audioRef = useRef(null)
    const containerRef = useRef(null)
    const lastMessageIdx = useRef(-1)
    const heartIdCounter = useRef(0)

    // Entrance animation
    useEffect(() => {
        gsap.fromTo(containerRef.current,
            { opacity: 0 },
            { opacity: 1, duration: 0.5, ease: 'power2.out' }
        )
    }, [])

    // Hide hint after first interaction
    useEffect(() => {
        if (state !== 'idle' && showHint) {
            setShowHint(false)
        }
    }, [state, showHint])

    // Show speech bubble when barking starts
    useEffect(() => {
        if (state === 'barking') {
            // Play bark sound (first 1 second only)
            playBark()

            // Pick a random message (avoid repeating)
            let idx
            do {
                idx = Math.floor(Math.random() * sweetMessages.length)
            } while (idx === lastMessageIdx.current && sweetMessages.length > 1)
            lastMessageIdx.current = idx
            setMessage(sweetMessages[idx])

            // Increase love meter
            setLoveMeter(prev => Math.min(prev + 8, 100))

            // Spawn floating hearts
            spawnInteractionHearts()

            // Animate speech bubble
            setTimeout(() => {
                if (speechRef.current) {
                    gsap.fromTo(speechRef.current,
                        { scale: 0, opacity: 0, y: 10 },
                        { scale: 1, opacity: 1, y: 0, duration: 0.35, ease: 'back.out(2)' }
                    )
                }
            }, 200)
        }

        if (state === 'idle' && message) {
            // Fade out speech bubble
            if (speechRef.current) {
                gsap.to(speechRef.current, {
                    scale: 0.8,
                    opacity: 0,
                    duration: 0.3,
                    ease: 'power2.in',
                    onComplete: () => setMessage(null),
                })
            } else {
                const timer = setTimeout(() => setMessage(null), 300)
                return () => clearTimeout(timer)
            }
        }
    }, [state])

    const playBark = () => {
        try {
            if (audioRef.current) {
                audioRef.current.pause()
                audioRef.current.currentTime = 0
            }
            const audio = new Audio('./assets/bark.mp3')
            audioRef.current = audio
            audio.volume = 0.6
            audio.play().catch(() => { })

            // Stop after 1 second
            setTimeout(() => {
                if (audioRef.current === audio) {
                    gsap.to(audio, {
                        volume: 0, duration: 0.15, onComplete: () => {
                            audio.pause()
                        }
                    })
                }
            }, 850)
        } catch (e) {
            // Audio may fail on some browsers without user gesture
        }
    }

    const spawnInteractionHearts = () => {
        const emojis = ['💕', '💗', '💖', '❤️', '🩷']
        const newHearts = []

        for (let i = 0; i < 5; i++) {
            newHearts.push({
                id: heartIdCounter.current++,
                emoji: emojis[Math.floor(Math.random() * emojis.length)],
                x: 40 + Math.random() * 20,
                delay: i * 0.1,
            })
        }

        setHeartsEmoji(prev => [...prev, ...newHearts])

        // Clean up after animation
        setTimeout(() => {
            setHeartsEmoji(prev => prev.filter(h => !newHearts.find(nh => nh.id === h.id)))
        }, 2000)
    }

    const handleDogTap = useCallback((e) => {
        e.preventDefault()
        e.stopPropagation()

        const rect = dogContainerRef.current?.getBoundingClientRect()
        if (!rect) return

        // Get touch/click position relative to dog
        const clientY = e.touches ? e.touches[0].clientY : e.clientY
        const relY = (clientY - rect.top) / rect.height

        // If touching top 40% of the dog = petting (head area)
        if (relY < 0.4) {
            triggerPet()
        } else {
            triggerInteraction()
        }
    }, [triggerInteraction, triggerPet])

    const handleTouchMove = useCallback((e) => {
        e.preventDefault()
        // Touch move on dog = petting
        const rect = dogContainerRef.current?.getBoundingClientRect()
        if (!rect) return

        const touch = e.touches[0]
        const isOverDog = (
            touch.clientX >= rect.left &&
            touch.clientX <= rect.right &&
            touch.clientY >= rect.top &&
            touch.clientY <= rect.bottom
        )

        if (isOverDog) {
            triggerPet()
        }
    }, [triggerPet])

    return (
        <div ref={containerRef} className="game-container">
            {/* Scene wrapper - contains bg + dog in same coordinate space */}
            <div className="game-scene">
                {/* Pixel art background */}
                <img src="./assets/background.png" alt="Room" className="bg-image" />

                {/* Dark overlay for contrast */}
                <div className="game-overlay" />

                {/* Floating interaction hearts */}
                {heartsEmoji.map(h => (
                    <FloatingHeart key={h.id} emoji={h.emoji} x={h.x} delay={h.delay} />
                ))}

                {/* Dog area - positioned relative to scene/bg */}
                <div className="dog-area">
                    {/* Speech bubble */}
                    {message && (
                        <div ref={speechRef} className="speech-bubble">
                            <span>{message}</span>
                            <div className="speech-tail" />
                        </div>
                    )}

                    {/* Dog sprite */}
                    <div
                        ref={dogContainerRef}
                        className={`dog-sprite-container ${state !== 'idle' ? 'active' : ''}`}
                        onTouchStart={handleDogTap}
                        onTouchMove={handleTouchMove}
                        onClick={handleDogTap}
                    >
                        <img
                            src={spriteUrl}
                            alt="Puppy"
                            className="dog-sprite"
                            draggable={false}
                        />

                        {/* Interaction glow */}
                        {state !== 'idle' && <div className="interaction-glow" />}
                    </div>

                    {/* Tap hint */}
                    {showHint && (
                        <div className="tap-hint">
                            <span className="tap-hint-icon">👆</span>
                            <span>Tap or pet me!</span>
                        </div>
                    )}
                </div>
            </div>

            {/* UI overlay - stays viewport-relative */}
            {/* Back button */}
            <button className="back-button" onClick={onBack}>
                <span>← Back</span>
            </button>

            {/* Love meter */}
            <div className="love-meter-container">
                <div className="love-meter-label">💕 Love</div>
                <div className="love-meter-track">
                    <div
                        className="love-meter-fill"
                        style={{ width: `${loveMeter}%` }}
                    />
                </div>
                <span className="love-meter-value">{loveMeter}%</span>
            </div>

            {/* Status text */}
            <div className="status-bar">
                {state === 'idle' && <span className="status-text idle-text">💤 Chillin'...</span>}
                {state === 'rotating' && <span className="status-text rotate-text">🔄 Spin spin!</span>}
                {state === 'barking' && <span className="status-text bark-text">🐶 Woof!</span>}
            </div>
        </div>
    )
}

// Floating heart component
function FloatingHeart({ emoji, x, delay }) {
    const ref = useRef(null)

    useEffect(() => {
        if (!ref.current) return

        gsap.fromTo(ref.current,
            { y: 0, opacity: 1, scale: 0.5 },
            {
                y: -120,
                opacity: 0,
                scale: 1.5,
                duration: 1.5,
                delay: delay,
                ease: 'power1.out',
            }
        )
    }, [delay])

    return (
        <span
            ref={ref}
            className="interaction-heart"
            style={{ left: `${x}%` }}
        >
            {emoji}
        </span>
    )
}
