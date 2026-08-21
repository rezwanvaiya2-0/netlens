import { codeToHtml } from "shiki";

export type CodeLanguage =
  | "bash"
  | "shell"
  | "perl"
  | "yaml"
  | "yml"
  | "text"
  | "plaintext"
  | "diff";

export async function highlightCode(
  code: string,
  lang: CodeLanguage,
): Promise<string> {
  try {
    return await codeToHtml(code, {
      lang,
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
    });
  } catch {
    return await codeToHtml(code, {
      lang: "text",
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
    });
  }
}
