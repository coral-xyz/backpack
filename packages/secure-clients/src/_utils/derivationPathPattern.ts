import type { Blockchain } from "@coral-xyz/common";

const capitalized = (word: string) =>
  word.charAt(0).toUpperCase() + word.slice(1);

const derivationPathPatternRegex = /^m?\/?(([0-9]+|x)'?)(\/([0-9]+|x)'?)*$/;

export function normalizeDerivationPathPattern(
  blockchain: Blockchain,
  pattern: string,
  pathPrefix: string,
  requireHardening: boolean
): {
  derivationPathPatternError?: string;
  derivationPathPattern?: string;
} {
  if (pattern.endsWith("/")) {
    pattern = pattern.slice(0, -1);
  }
  pattern = pattern.replace(/['`]/g, "'");

  if (!derivationPathPatternRegex.test(pattern)) {
    if (!pattern.startsWith(pathPrefix)) {
      return {
        derivationPathPatternError: `Error: ${capitalized(
          blockchain
        )} derivation paths start with: ${pathPrefix}`,
      };
    }
    return { derivationPathPatternError: `Error: Invalid derivation path` };
  }
  const path = pattern.split("/");

  if (!pattern.startsWith("m")) {
    // case /44/
    if (pattern.startsWith("/")) {
      path.shift();
    }
    const prefix = pathPrefix.split("/");
    if (pathPrefix.endsWith("/")) {
      prefix.pop();
    }
    path.unshift(...prefix);
  }
  const hardenedPath = path.map((segment: string) => {
    if (segment !== "m" && !segment.endsWith("'")) {
      return segment + "'";
    }
    return segment;
  });

  const normalizedPattern = requireHardening
    ? hardenedPath.join("/")
    : path.join("/");

  if (!normalizedPattern.startsWith(pathPrefix)) {
    return {
      derivationPathPatternError: `Error: ${capitalized(
        blockchain
      )} derivation paths start with: ${pathPrefix}`,
    };
  }

  return {
    derivationPathPattern: normalizedPattern,
  };
}

export function iterateDerivationPathPattern(
  pattern: string,
  interations: number,
  iterator: string = "x"
): string[] {
  const regex = new RegExp(iterator, "g");
  return [...Array(interations).keys()].map((i) =>
    pattern.replace(regex, String(i))
  );
}
