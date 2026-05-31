import { test, expect } from "bun:test"
import { circuitJsonToStep } from "../../../lib/index"
import { importStepWithOcct } from "../../utils/occt/importer"
import circuitJson from "./basics07.json"

test("basics07: fallback box for component with model_step_url when includeExternalMeshes is false", async () => {
  const stepText = await circuitJsonToStep(circuitJson as any, {
    includeComponents: true,
    productName: "TestPCB_fallback_box",
  })

  expect(stepText).toContain("ISO-10303-21")
  expect(stepText).toContain("END-ISO-10303-21")
  expect(stepText).toContain("TestPCB_fallback_box")
  expect(stepText).toContain("MANIFOLD_SOLID_BREP")

  const faceCount = (stepText.match(/ADVANCED_FACE/g) || []).length
  expect(faceCount).toBeGreaterThan(6)

  const outputPath = "debug-output/basics07.step"
  await Bun.write(outputPath, stepText)
  console.log("✓ STEP file with fallback box generated successfully")
  console.log(`  - ADVANCED_FACE count: ${faceCount}`)
  console.log(`  - STEP text length: ${stepText.length} bytes`)
  console.log(`  - Output: ${outputPath}`)

  const occtResult = await importStepWithOcct(stepText)
  expect(occtResult.success).toBe(true)
  expect(occtResult.meshes.length).toBeGreaterThan(0)

  const [firstMesh] = occtResult.meshes
  expect(firstMesh.attributes.position.array.length).toBeGreaterThan(0)
  expect(firstMesh.index.array.length).toBeGreaterThan(0)

  console.log("✓ STEP file successfully validated with occt-import-js")

  await expect(stepText).toMatchStepSnapshot(import.meta.path, "basics07")
}, 30000)
