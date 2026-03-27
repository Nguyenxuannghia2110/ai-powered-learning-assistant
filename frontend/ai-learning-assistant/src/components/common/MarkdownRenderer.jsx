import React from "react";

const MarkdownRenderer = ({ content = "" }) => {
  const lines = content.split("\n");

  return (
    <div className="prose prose-slate max-w-none text-sm md:text-base leading-relaxed space-y-2">
      {lines.map((line, idx) => {
        /* ===== HEADERS ===== */
        if (line.startsWith("### ")) {
          return (
            <h3 key={idx} className="text-lg font-semibold mt-4">
              {line.replace("### ", "")}
            </h3>
          );
        }

        if (line.startsWith("## ")) {
          return (
            <h2
              key={idx}
              className="text-xl font-bold mt-6 border-b pb-1"
            >
              {line.replace("## ", "")}
            </h2>
          );
        }

        if (line.startsWith("# ")) {
          return (
            <h1 key={idx} className="text-2xl font-bold mt-8">
              {line.replace("# ", "")}
            </h1>
          );
        }

        /* ===== BLOCKQUOTE ===== */
        if (line.startsWith("> ")) {
          return (
            <blockquote
              key={idx}
              className="border-l-4 border-indigo-500 pl-4 italic bg-indigo-50 rounded-r py-1"
            >
              {line.replace("> ", "")}
            </blockquote>
          );
        }

        /* ===== LIST ===== */
        if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
          return (
            <li key={idx} className="ml-5 list-disc">
              {line.trim().slice(2)}
            </li>
          );
        }

        /* ===== BOLD ===== */
        const parts = line.split(/(\*\*.*?\*\*)/g);
        const formatted = parts.map((part, i) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return (
              <strong key={i} className="font-semibold text-indigo-700">
                {part.slice(2, -2)}
              </strong>
            );
          }
          return part;
        });

        /* ===== EMPTY LINE ===== */
        if (line.trim() === "") {
          return <div key={idx} className="h-2" />;
        }

        return <p key={idx}>{formatted}</p>;
      })}
    </div>
  );
};

export default MarkdownRenderer;
