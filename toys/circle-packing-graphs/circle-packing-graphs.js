function createCircleGraph(canvasId) {
    /* Initializations */

    const canvas = document.getElementById(canvasId)
    const ctx = canvas.getContext('2d', { alpha: false })
    
    let circles = []
    let blockedCircles = []

    let color = 'black'
    let bgColor = 'white'

    /* Utility functions */
    
    const clear = () => {
        ctx.fillStyle = bgColor
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.fillStyle = bgColor
        ctx.strokeStyle = color
        ctx.fillRect(5, 5, 300, 70)
        ctx.strokeRect(5, 5, 300, 70)
    }

    const beginDrawBatch = () => {
        ctx.fillStyle = bgColor
        ctx.strokeStyle = color
        ctx.lineWidth = 2
        ctx.beginPath()
    }

    const draw = ({ x, y, r }, erase) => {
        ctx.fillStyle = bgColor
        ctx.strokeStyle = color
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(x, y, r, 0, 2 * Math.PI)

        if (erase) {
            ctx.fill()
        } else {
            ctx.stroke()
        }
    }

    const grow = (circle, amount) => ({
        ...circle,
        r: circle.r + amount
    })

    const distance = (circle1, circle2) => Math.sqrt(Math.pow(circle1.x - circle2.x, 2) + Math.pow(circle1.y - circle2.y, 2))

    const blocked = circle => {
        const { x, y, r } = circle

        if (x + r > canvas.width || y + r > canvas.height || x - r < 0 || y - r < 0) {
            return true
        }

        return !!circles
            .concat(blockedCircles)
            .filter(other => other !== circle)
            .find(other => distance(circle, other) < r + other.r)
    }

    /* Initial draw */

    clear()

    /* Update function */

    let func = x => 0
    let x = 0
    let circular = false
    const update = dt => {
        x += circular ? 2 * dt : 5 * dt
        if ((!circular && x * 50 > canvas.width) || (circular && x * 41 > 380)) {
            return true
        }

        for (let i = 0; i < 20; i ++) {
            let circle = {
                x: 0,
                y: 0,
                r: 2
            }

            if (circular) {
                const radius = canvas.width / 4 + func(x * 5) * canvas.width / 8
                const cx = canvas.width / 2
                const cy = canvas.height / 2
                const radians = x * 41 * Math.PI / 180

                circle.x = cx + radius * Math.cos(radians) + Math.random() * 25
                circle.y = cy + radius * Math.sin(radians) + Math.random() * 25
            } else {
                circle.x = x * 50 + Math.random() * 25
                circle.y = canvas.height / 2 + func(x) * canvas.height / 4 + Math.random() * 25
            }

            if (!blocked(circle)) {
                circles.push(circle)
            }
        }

        const newBlockedCircles = circles.filter(blocked)
        blockedCircles = blockedCircles.concat(newBlockedCircles)
        circles = circles.filter(circle => !newBlockedCircles.includes(circle))

        circles.forEach(circle => draw(circle, true))
        circles = circles.map(circle => grow(circle, 20 * dt))
        circles.forEach(circle => draw(circle, false))

        return false
    }

    /* Main loop */

    let lastTime
    let stopped = false
    let lastRequest
    let stringFunc = 'y = 0'
    const animationLoop = currentTime => {
        if (!lastTime) {
            lastTime = currentTime
        }
        const dt = (currentTime - lastTime) / 1000
        lastTime = currentTime

        const finished = update(dt)

        if (!finished && !stopped) {
            lastRequest = requestAnimationFrame(animationLoop)
        }

        ctx.fillStyle = 'white'
        ctx.strokeStyle = 'black'
        ctx.fillRect(5, 5, 300, 70)
        ctx.strokeRect(5, 5, 300, 70)
        ctx.fillStyle = 'black'
        ctx.font = '30px Arial'
        ctx.fillText(stringFunc, 20, 50, 270)
    }

    /* Controls */

    const controls = {}

    controls.stop = () => {
        stopped = true
        
        if (lastRequest) {
            cancelAnimationFrame(lastRequest)
            lastRequest = null
        }
    }

    controls.start = () => {
        controls.stop()

        clear()

        x = 0
        stopped = false
        lastTime = null
        circles = []
        blockedCircles = []
        lastRequest = requestAnimationFrame(animationLoop) 
    }
    
    controls.setFunction = (newFunc, asString) => { 
        func = newFunc 
        stringFunc = asString
    }

    controls.setCircular = newCircular => {
        circular = newCircular
    }

    controls.setColor = newColor => {
        color = newColor
    }

    controls.setBgColor = newColor => {
        bgColor = newColor
    }

    controls.run = (newFunc, asString, options) => {
        controls.setFunction(newFunc, asString)
        controls.setCircular(options?.circular ?? false)
        controls.setColor(options?.color ?? 'black')
        controls.setBgColor(options?.bgColor ?? 'white')
        controls.start()
    }

    return controls
}
