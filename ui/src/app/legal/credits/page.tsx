export const metadata = {
  title: "Credits — LoanDialer",
};

export default function CreditsPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">Credits</h1>
      <p className="text-sm text-muted-foreground mb-6">
        LoanDialer is built on open-source foundations. We are grateful to the
        following projects and their maintainers.
      </p>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Dograh</h2>
          <p className="text-sm text-muted-foreground">
            Voice infrastructure powered by{" "}
            <a
              href="https://github.com/dograh-hq/dograh"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              Dograh
            </a>
            . BSD 2-Clause License, Copyright (c) 2025 Zansat Technologies
            Private Limited. All rights reserved.
          </p>
          <pre className="mt-3 rounded-md border bg-muted/40 p-3 text-xs leading-relaxed whitespace-pre-wrap">
{`BSD 2-Clause License

Copyright (c) 2025, Zansat Technologies Private Limited

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.`}
          </pre>
        </div>
      </section>
    </div>
  );
}
