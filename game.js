// import * as THREE from "./lib/three" // i was just using this to get some auto-completion for my VS Code
import { colors, settings } from "./defaults.js"

var scene = new THREE.Scene()

var width = window.innerWidth
var height = window.innerHeight
var aspectRatio = width / height

var camera = new THREE.PerspectiveCamera(70, aspectRatio)

var renderer = new THREE.WebGLRenderer({ antialias: true })

var mode = "studio"

// renderer.setSize(width, height)
// document.body.appendChild(renderer.domElement)
document.getElementById("main").appendChild(renderer.domElement)
renderer.domElement.id = "game"

camera.position.z = 10

var controls = new THREE.PointerLockControls(camera, document.body)

var keys = []

document.getElementById("game").addEventListener("click", () => {
    controls.lock()
})

controls.addEventListener("lock", () => {
    console.log("mouse pointer locked")
})

controls.addEventListener("unlock", () => {
    console.log("mouse pointer unlocked")
})

document.addEventListener("keydown", function(e){
    keys.push(e.key)
})

document.addEventListener("keyup", function(e){
    keys = keys.filter(key => !key === e.key)
})

class Block {
    constructor(x, y, z) {
        let geometry = new THREE.BoxGeometry(4,1,2)
        let material = new THREE.MeshBasicMaterial({ color: colors.mediumStoneGrey })
        this.object = new THREE.Mesh(geometry, material)
        this.object.position.set(x, y, z)
        scene.add(this.object)
        this.anchored = true
        this.mass = 1
        this.pullByGravity = 0
        this.collision = true
        
    }
}

var blocks = []

window.addEventListener("resize", () => {
    width = window.innerWidth
    height = window.innerHeight
    aspectRatio = width / height
    camera.aspect = aspectRatio
    camera.updateProjectionMatrix()
    // renderer.setSize(width, height)
})

function update() {
    if (keys.includes("w")) controls.moveForward(settings.movementSpeed)
    if (keys.includes("s")) controls.moveForward(-1 * settings.movementSpeed)
    if (keys.includes("a")) controls.moveRight(-1 * settings.movementSpeed)
    if (keys.includes("d")) controls.moveRight(settings.movementSpeed)
    if (keys.includes("e")) camera.position.y += settings.movementSpeed
    if (keys.includes("q")) camera.position.y -= settings.movementSpeed
    if (keys.includes("f")) camera.position.set(blocks[1].object.position.x, blocks[1].object.position.y, blocks[1].object.position.z + 10)
    if (keys.includes("x")) mode = "run"

    if (mode === "run") {
        blocks.forEach((block) => {
            if (!block.anchored) {
                block.object.position.y -= block.mass + block.pullByGravity
                block.pullByGravity += 0.01

                blocks.forEach((e) => {
                    if ((block.object.position.y / block.object.scale.y) < (e.object.position.y / e.object.scale.y) && e.collision === true && block.collision === true) {
                        block.object.position.y = (e.object.position.y / e.object.scale.y) + block.object.scale.y
                    }
                })
            }
        })
    }
}

function render() {
    renderer.render(scene, camera)
}

function gameLoop() {
    requestAnimationFrame(gameLoop)
    update()
    render()
}

function renderDefaults() {
    blocks.forEach((block) => {
        scene.remove(block.object)
        blocks = blocks.filter(b => !b === block)
    })
    
    // Adding blocks
    blocks.push(new Block(0,0,0))
    blocks.push(new Block(0,500,0))
    blocks.push(new Block(0,-5, 0))

    // Applying properties
    blocks[1].anchored = false
}

renderDefaults()

// UI Functions

document.querySelector("nav.main .home .run").addEventListener("click", () => {
    if (mode === "run") {
        mode = "studio"
        document.querySelector("nav.main .home .run").innerHTML = "<i class=\"fa-solid fa-play\"></i>"
        renderDefaults()
    } else {
        mode = "run"
        document.querySelector("nav.main .home .run").innerHTML = "<i class=\"fa-solid fa-pause\"></i>"
    }
})

gameLoop()
