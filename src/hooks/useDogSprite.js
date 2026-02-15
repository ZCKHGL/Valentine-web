import { useState, useEffect, useRef, useCallback } from 'react'

const ROTATION_ORDER = [
    'south', 'south-west', 'west', 'north-west',
    'north', 'north-east', 'east', 'south-east'
]

const IDLE_FRAME_COUNT = 8
const BARK_FRAME_COUNT = 6
const IDLE_FRAME_INTERVAL = 150
const BARK_FRAME_INTERVAL = 120
const ROTATION_INTERVAL = 100

export default function useDogSprite() {
    const [state, setState] = useState('idle') // idle | rotating | barking
    const [currentFrame, setCurrentFrame] = useState(0)
    const [currentRotation, setCurrentRotation] = useState(0)
    const [spriteUrl, setSpriteUrl] = useState('./assets/animations/idle/south/frame_000.png')
    const timerRef = useRef(null)
    const stateRef = useRef('idle')

    // Preload all images
    useEffect(() => {
        const images = []

        // Preload idle frames
        for (let i = 0; i < IDLE_FRAME_COUNT; i++) {
            const img = new Image()
            img.src = `./assets/animations/idle/south/frame_${String(i).padStart(3, '0')}.png`
            images.push(img)
        }

        // Preload bark frames
        for (let i = 0; i < BARK_FRAME_COUNT; i++) {
            const img = new Image()
            img.src = `./assets/animations/bark/south/frame_${String(i).padStart(3, '0')}.png`
            images.push(img)
        }

        // Preload rotations
        ROTATION_ORDER.forEach(dir => {
            const img = new Image()
            img.src = `./assets/rotations/${dir}.png`
            images.push(img)
        })
    }, [])

    // Idle animation loop
    useEffect(() => {
        if (state !== 'idle') return

        let frame = 0
        const interval = setInterval(() => {
            frame = (frame + 1) % IDLE_FRAME_COUNT
            setCurrentFrame(frame)
            setSpriteUrl(`./assets/animations/idle/south/frame_${String(frame).padStart(3, '0')}.png`)
        }, IDLE_FRAME_INTERVAL)

        return () => clearInterval(interval)
    }, [state])

    // Rotation animation
    useEffect(() => {
        if (state !== 'rotating') return

        let rotIdx = 0
        setSpriteUrl(`./assets/rotations/${ROTATION_ORDER[0]}.png`)

        const interval = setInterval(() => {
            rotIdx++
            if (rotIdx >= ROTATION_ORDER.length) {
                clearInterval(interval)
                setState('barking')
                stateRef.current = 'barking'
                return
            }
            setCurrentRotation(rotIdx)
            setSpriteUrl(`./assets/rotations/${ROTATION_ORDER[rotIdx]}.png`)
        }, ROTATION_INTERVAL)

        return () => clearInterval(interval)
    }, [state])

    // Bark animation
    useEffect(() => {
        if (state !== 'barking') return

        let frame = 0
        setSpriteUrl(`./assets/animations/bark/south/frame_000.png`)

        const interval = setInterval(() => {
            frame++
            if (frame >= BARK_FRAME_COUNT) {
                clearInterval(interval)
                // Stay on last bark frame briefly, then go to idle
                setTimeout(() => {
                    setState('idle')
                    stateRef.current = 'idle'
                }, 600)
                return
            }
            setCurrentFrame(frame)
            setSpriteUrl(`./assets/animations/bark/south/frame_${String(frame).padStart(3, '0')}.png`)
        }, BARK_FRAME_INTERVAL)

        return () => clearInterval(interval)
    }, [state])

    const triggerInteraction = useCallback(() => {
        if (stateRef.current !== 'idle') return false
        setState('rotating')
        stateRef.current = 'rotating'
        return true
    }, [])

    const triggerPet = useCallback(() => {
        if (stateRef.current !== 'idle') return false
        setState('barking')
        stateRef.current = 'barking'
        return true
    }, [])

    return {
        state,
        spriteUrl,
        triggerInteraction,
        triggerPet,
    }
}
