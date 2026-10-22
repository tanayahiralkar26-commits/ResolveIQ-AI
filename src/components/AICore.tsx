
import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import "./AICore.css";

export type CoreActivity = "idle" | "thinking" | "success";

type CoreSceneProps = {
    activity: CoreActivity;
};

function CoreScene({ activity }: CoreSceneProps) {
    const groupRef = useRef<THREE.Group>(null);
    const ringRef = useRef<THREE.Mesh>(null);
    const secondRingRef = useRef<THREE.Mesh>(null);
    const coreRef = useRef<THREE.Mesh>(null);

    useFrame((state, delta) => {
        const group = groupRef.current;
        const ring = ringRef.current;
        const secondRing = secondRingRef.current;
        const core = coreRef.current;

        if (group) {
            const speed = activity === "thinking" ? 1.2 : 0.3;

            group.rotation.y += delta * speed;
            group.rotation.x = THREE.MathUtils.damp(
                group.rotation.x,
                state.pointer.y * 0.25,
                3,
                delta
            );
            group.rotation.z = THREE.MathUtils.damp(
                group.rotation.z,
                -state.pointer.x * 0.25,
                3,
                delta
            );
            group.position.x = THREE.MathUtils.damp(
                group.position.x,
                state.pointer.x * 0.12,
                3,
                delta
            );
            group.position.y = THREE.MathUtils.damp(
                group.position.y,
                state.pointer.y * 0.12,
                3,
                delta
            );
        }

        if (ring) {
            ring.rotation.x += delta * 0.25;
            ring.rotation.y += delta * 0.4;
        }

        if (secondRing) {
            secondRing.rotation.x -= delta * 0.2;
            secondRing.rotation.z += delta * 0.3;
        }

        if (core) {
            const pulse =
                1 + Math.sin(state.clock.elapsedTime * 2.5) * 0.035;

            core.scale.setScalar(pulse);
        }
    });

    const coreColor =
        activity === "success" ? "#65ffd1" : "#9c7cff";

    const glowColor =
        activity === "thinking" ? "#55eaff" : coreColor;

    return (
        <>
            <ambientLight intensity={0.8} />

            <pointLight
                position={[3, 2, 3]}
                intensity={15}
                color={glowColor}
            />

            <pointLight
                position={[-3, -2, -2]}
                intensity={8}
                color="#376dff"
            />

            <group ref={groupRef}>
                <Float speed={1.5} floatIntensity={0.25}>
                    {/* Main glowing AI core */}
                    <mesh ref={coreRef}>
                        <icosahedronGeometry args={[0.8, 4]} />
                        <meshStandardMaterial
                            color={coreColor}
                            emissive={glowColor}
                            emissiveIntensity={2}
                            metalness={0.5}
                            roughness={0.2}
                            wireframe
                        />
                    </mesh>

                    {/* Inner energy sphere */}
                    <mesh scale={0.48}>
                        <icosahedronGeometry args={[1, 2]} />
                        <meshBasicMaterial
                            color="#b9f7ff"
                            wireframe
                            transparent
                            opacity={0.75}
                        />
                    </mesh>

                    {/* Outer orbit ring */}
                    <mesh ref={ringRef} rotation={[1, 0.3, 0.2]}>
                        <torusGeometry args={[1.2, 0.012, 8, 100]} />
                        <meshBasicMaterial color="#55eaff" />
                    </mesh>

                    {/* Second orbit ring */}
                    <mesh
                        ref={secondRingRef}
                        rotation={[0.5, 1, 0.8]}
                    >
                        <torusGeometry args={[1.4, 0.009, 8, 100]} />
                        <meshBasicMaterial
                            color="#9c7cff"
                            transparent
                            opacity={0.8}
                        />
                    </mesh>

                    {/* Bright central nucleus */}
                    <mesh scale={0.16}>
                        <octahedronGeometry args={[1, 1]} />
                        <meshBasicMaterial color="#ffffff" />
                    </mesh>
                </Float>
            </group>

            <Sparkles
                count={70}
                scale={3.5}
                size={2}
                speed={activity === "thinking" ? 1.5 : 0.5}
                color={glowColor}
            />
        </>
    );
}

type AICoreProps = {
    activity?: CoreActivity;
};

export default function AICore({
    activity = "idle",
}: AICoreProps) {
    return (
        <div className={`ai-core ai-core--${activity}`}>
            <div className="ai-core__halo" />

            <Canvas
                camera={{ position: [0, 0, 4], fov: 45 }}
                dpr={[1, 1.5]}
                gl={{ antialias: true, alpha: true }}
            >
                <CoreScene activity={activity} />
            </Canvas>

            <div className="ai-core__label">
                <span className="ai-core__status-dot" />
                {activity === "thinking"
                    ? "PROCESSING"
                    : activity === "success"
                        ? "ACTION READY"
                        : "CORE ONLINE"}
            </div>
        </div>
    );
}
