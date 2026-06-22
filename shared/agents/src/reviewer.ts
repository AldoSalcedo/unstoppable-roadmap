#!/usr/bin/env tsx
/**
 * reviewer.ts — Pedagogical code reviewer for each week of the Unstoppable Roadmap
 *
 * Usage:
 *   pnpm review week-01-typescript          # review a specific week
 *   pnpm review week-01-typescript --hints  # hints-only mode (no spoilers)
 *   pnpm review                             # lists available weeks
 */

import { query, type SDKMessage } from "@anthropic-ai/claude-agent-sdk";
import { execSync } from "child_process";
import { existsSync, readdirSync, readFileSync } from "fs";
import { join, resolve } from "path";

// ============================================================================
// CONFIG
// ============================================================================

const MONOREPO_ROOT = resolve(import.meta.dirname, "../../../");
const WEEKS_DIR = join(MONOREPO_ROOT, "weeks");

// ============================================================================
// HELPERS
// ============================================================================

function listWeeks(): string[] {
  return readdirSync(WEEKS_DIR).filter((d) =>
    d.startsWith("week-") && existsSync(join(WEEKS_DIR, d, "src"))
  );
}

function readFileIfExists(path: string): string {
  return existsSync(path) ? readFileSync(path, "utf-8") : "";
}

function runTsc(weekDir: string): string {
  try {
    execSync("pnpm exec tsc --noEmit 2>&1", { cwd: weekDir, stdio: "pipe" });
    return "";
  } catch (e: unknown) {
    const err = e as { stdout?: Buffer };
    return err.stdout?.toString() ?? "";
  }
}

function collectSrcFiles(weekDir: string): Record<string, string> {
  const srcDir = join(weekDir, "src");
  const files: Record<string, string> = {};

  function walk(dir: string) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.name.endsWith(".ts")) {
        const rel = full.replace(weekDir + "/", "");
        files[rel] = readFileSync(full, "utf-8");
      }
    }
  }

  walk(srcDir);

  // also include type tests
  const testDir = join(weekDir, "tests");
  if (existsSync(testDir)) {
    for (const f of readdirSync(testDir)) {
      if (f.endsWith(".ts")) {
        files[`tests/${f}`] = readFileSync(join(testDir, f), "utf-8");
      }
    }
  }

  return files;
}

function findIncompleteExercises(files: Record<string, string>): string[] {
  const stubs: string[] = [];
  for (const [path, content] of Object.entries(files)) {
    const lines = content.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i] ?? "";
      if (
        line.includes("// TODO") ||
        line.includes("throw new Error('Not implemented')") ||
        line.includes("throw new Error(\"Not implemented\")") ||
        line.includes("// TODO: Implementar") ||
        (line.includes("???") && line.includes("//"))
      ) {
        stubs.push(`  ${path}:${i + 1} → ${line.trim()}`);
      }
    }
  }
  return stubs;
}

// ============================================================================
// PROMPTS
// ============================================================================

function buildSystemPrompt(hintsOnly: boolean): string {
  return `Eres un mentor de TypeScript para un ingeniero senior en transición a Healthcare Software Engineer.

Tu objetivo es dar FEEDBACK PEDAGÓGICO, no soluciones. El aprendizaje viene del esfuerzo propio.

REGLAS ABSOLUTAS:
- NUNCA completes un ejercicio por el usuario
- NUNCA escribas la implementación final
- SÍ explica el concepto que está siendo evaluado
- SÍ da una pista que desbloquee al usuario sin revelar la respuesta
- SÍ conecta el concepto con aplicaciones reales en healthcare cuando sea relevante
- SÍ señala errores de compilación y explica POR QUÉ ocurren (no cómo corregirlos directamente)
- Responde siempre en español
${hintsOnly ? "\nMODO HINTS: Solo da pistas cortas (1-2 oraciones por ejercicio), sin explicaciones largas." : ""}`;
}

function buildReviewPrompt(
  weekName: string,
  agentsMd: string,
  sprintMd: string,
  files: Record<string, string>,
  stubs: string[],
  tscErrors: string,
  hintsOnly: boolean
): string {
  const filesSummary = Object.entries(files)
    .map(([path, content]) => `\n### ${path}\n\`\`\`typescript\n${content}\n\`\`\``)
    .join("\n");

  const stubsSection =
    stubs.length > 0
      ? `\n## Ejercicios incompletos detectados\n${stubs.join("\n")}`
      : "\n## Estado de ejercicios\nNo se detectaron TODOs pendientes.";

  const tscSection =
    tscErrors.length > 0
      ? `\n## Errores de compilación (tsc --noEmit)\n\`\`\`\n${tscErrors.slice(0, 3000)}\n\`\`\``
      : "\n## Compilación\n✅ Sin errores de compilación.";

  return `# Code Review: ${weekName}

## Contexto del proyecto (AGENTS.md)
${agentsMd || "(No disponible)"}

## Plan del sprint
${sprintMd ? sprintMd.slice(0, 1500) + "..." : "(No disponible)"}

${stubsSection}
${tscSection}

## Archivos fuente
${filesSummary}

---

Por favor realiza una revisión pedagógica completa:
1. Para cada ejercicio incompleto: explica el concepto y da UNA pista concreta
2. Para los errores de compilación: explica la causa raíz (no la solución directa)
3. Para el código implementado: señala si hay algo que podría ser más idiomático en TypeScript estricto
4. Termina con un resumen del estado del día y qué debería enfocarse el usuario a continuación

${hintsOnly ? "Sé conciso: máximo 2-3 líneas por punto." : ""}`;
}

// ============================================================================
// STREAM HANDLER
// ============================================================================

async function streamReview(prompt: string, systemPrompt: string): Promise<void> {
  let turnCount = 0;

  for await (const message of query({
    prompt,
    options: {
      allowedTools: [],          // reviewer reads files from the prompt, no extra tools needed
      permissionMode: "default",
      maxTurns: 1,               // single-shot review, no tool loop needed
      systemPrompt,
    },
  }) as AsyncIterable<SDKMessage>) {
    if (message.type === "assistant") {
      turnCount++;
      for (const block of message.message.content) {
        if ("text" in block && typeof block.text === "string") {
          process.stdout.write(block.text);
        }
      }
    }

    if (message.type === "result") {
      const cost = message.total_cost_usd;
      console.log(
        `\n\n---\n✅ Revisión completa | Costo: $${cost !== undefined ? cost.toFixed(4) : "N/A"} USD`
      );
    }
  }

  if (turnCount === 0) {
    console.error("No se recibió respuesta del agente.");
  }
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const hintsOnly = args.includes("--hints");
  const weekArg = args.find((a) => !a.startsWith("--"));

  const availableWeeks = listWeeks();

  if (!weekArg) {
    console.log("📚 Semanas disponibles:\n");
    for (const w of availableWeeks) {
      console.log(`  • ${w}`);
    }
    console.log(
      '\nUso: pnpm review <week-name> [--hints]\nEjemplo: pnpm review week-01-typescript'
    );
    process.exit(0);
  }

  const matchedWeek = availableWeeks.find(
    (w) => w === weekArg || w.startsWith(weekArg)
  );

  if (!matchedWeek) {
    console.error(`❌ Semana "${weekArg}" no encontrada. Semanas disponibles:`);
    for (const w of availableWeeks) console.error(`  • ${w}`);
    process.exit(1);
  }

  const weekDir = join(WEEKS_DIR, matchedWeek);

  console.log(`\n🔍 Revisando ${matchedWeek}...\n`);

  // Gather context
  const agentsMd = readFileIfExists(join(weekDir, "AGENTS.md"));
  const sprintMd =
    readFileIfExists(join(weekDir, "sprint-typescript-week1.md")) ||
    readFileIfExists(join(weekDir, `sprint-${matchedWeek}.md`));

  // Gather source files
  const files = collectSrcFiles(weekDir);
  console.log(`  📁 Archivos encontrados: ${Object.keys(files).join(", ")}\n`);

  // Find stubs
  const stubs = findIncompleteExercises(files);
  console.log(
    stubs.length > 0
      ? `  ⚠️  ${stubs.length} ejercicios incompletos detectados\n`
      : `  ✅ Sin ejercicios incompletos detectados\n`
  );

  // Run tsc
  process.stdout.write("  🔧 Ejecutando tsc...");
  const tscErrors = runTsc(weekDir);
  console.log(tscErrors ? ` ${tscErrors.split("\n").length} errores\n` : " ✅\n");

  // Build prompts
  const systemPrompt = buildSystemPrompt(hintsOnly);
  const reviewPrompt = buildReviewPrompt(
    matchedWeek,
    agentsMd,
    sprintMd,
    files,
    stubs,
    tscErrors,
    hintsOnly
  );

  console.log("─".repeat(60));
  console.log("📝 Iniciando revisión pedagógica...\n");

  await streamReview(reviewPrompt, systemPrompt);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
