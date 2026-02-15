import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import './MainMenu.css'

export default function MainMenu({ onPlay }) {
    const containerRef = useRef(null)
    const titleRef = useRef(null)
    const subtitleRef = useRef(null)
    const buttonRef = useRef(null)
    const heartsRef = useRef(null)
    const dogRef = useRef(null)

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Title animation
            gsap.fromTo(titleRef.current,
                { y: -40, opacity: 0, scale: 0.8 },
                { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: 'back.out(1.5)', delay: 0.2 }
            )

            // Subtitle
            gsap.fromTo(subtitleRef.current,
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out', delay: 0.6 }
            )

            // Dog bounce in
            gsap.fromTo(dogRef.current,
                { scale: 0, rotation: -15 },
                { scale: 1, rotation: 0, duration: 0.7, ease: 'elastic.out(1, 0.5)', delay: 0.4 }
            )

            // Continuous dog float
            gsap.to(dogRef.current, {
                y: -8,
                duration: 1.5,
                ease: 'sine.inOut',
                yoyo: true,
                repeat: -1,
            })

            // Button entrance
            gsap.fromTo(buttonRef.current,
                { scale: 0, opacity: 0 },
                { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(2)', delay: 0.9 }
            )

            // Button pulse
            gsap.to(buttonRef.current, {
                scale: 1.05,
                duration: 0.8,
                ease: 'sine.inOut',
                yoyo: true,
                repeat: -1,
                delay: 1.4,
            })

            // Floating hearts
            createFloatingHearts()
        }, containerRef)

        return () => ctx.revert()
    }, [])

    const createFloatingHearts = () => {
        const hearts = heartsRef.current
        if (!hearts) return

        const heartEmojis = ['💕', '💗', '💖', '💝', '🩷', '❤️', '🐾', '✨']

        for (let i = 0; i < 15; i++) {
            const heart = document.createElement('span')
            heart.className = 'floating-heart'
            heart.textContent = heartEmojis[Math.floor(Math.random() * heartEmojis.length)]
            heart.style.left = `${Math.random() * 100}%`
            heart.style.fontSize = `${14 + Math.random() * 20}px`
            hearts.appendChild(heart)

            animateHeart(heart, i)
        }
    }

    const animateHeart = (heart, delay) => {
        const startY = window.innerHeight + 20
        const endY = -50
        const duration = 4 + Math.random() * 4

        gsap.set(heart, { y: startY, opacity: 0 })

        gsap.to(heart, {
            y: endY,
            opacity: 0.8,
            duration: duration,
            delay: delay * 0.3,
            ease: 'none',
            repeat: -1,
            repeatDelay: Math.random() * 2,
            onRepeat: () => {
                gsap.set(heart, {
                    x: (Math.random() - 0.5) * 40,
                    left: `${Math.random() * 100}%`
                })
            }
        })

        // Side-to-side sway
        gsap.to(heart, {
            x: `+=${20 + Math.random() * 30}`,
            duration: 2 + Math.random() * 2,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
        })
    }

    return (
        <div ref={containerRef} className="menu-container">
            {/* Floating hearts background */}
            <div ref={heartsRef} className="hearts-layer" />

            {/* Gradient overlay shimmer */}
            <div className="shimmer-overlay" />

            {/* Content */}
            <div className="menu-content">
                {/* Dog sprite */}
                <div ref={dogRef} className="menu-dog">
                    <img
                        src="./assets/rotations/south.png"
                        alt="Puppy"
                        className="menu-dog-sprite"
                    />
                    <div className="dog-glow" />
                </div>

                {/* Title */}
                <h1 ref={titleRef} className="menu-title">
                    Happy Valentine
                    <span className="title-name">Kirra</span>
                    <span className="title-woof">I Woof U! 🐾</span>
                </h1>

                {/* Subtitle */}
                <p ref={subtitleRef} className="menu-subtitle">
                    A special surprise, just for you 💕
                </p>

                {/* Play Button */}
                <button ref={buttonRef} className="play-button" onClick={onPlay}>
                    <span className="play-icon">🐶</span>
                    <span>Play With Me!</span>
                </button>
            </div>

            {/* Bottom paw prints */}
            <div className="paw-prints">
                {['🐾', '🐾', '🐾'].map((paw, i) => (
                    <span key={i} className="paw" style={{ animationDelay: `${i * 0.3}s` }}>
                        {paw}
                    </span>
                ))}
            </div>
        </div>
    )
}
