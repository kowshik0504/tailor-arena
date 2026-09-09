const fs = require('fs');

let code = fs.readFileSync('src/routes/admin.verifications.tsx', 'utf8');

// 1. Update Doc type
code = code.replace(
  /type Doc = { label: string; icon: any; status: "Verified" \| "Pending" \| "Flagged" \| "Changes Requested" };/,
  'type Doc = { label: string; icon: any; status: "Verified" | "Pending" | "Flagged" | "Changes Requested"; url?: string; };'
);

// 2. Add viewingDocUrl state
code = code.replace(
  /const \[showConfirm, setShowConfirm\] = useState\(false\);/,
  'const [showConfirm, setShowConfirm] = useState(false);\n  const [viewingDocUrl, setViewingDocUrl] = useState<string | null>(null);'
);

// 3. Update fetchPending docs array mapping
code = code.replace(
  /docs: \[.*?\]/s,
  `docs: [
          { label: "Government ID", icon: IdCard, status: t.documents?.govtId ? "Pending" : "Flagged", url: t.documents?.govtId },
          { label: "Tailor photo", icon: Camera, status: t.documents?.tailorPhoto ? "Pending" : "Flagged", url: t.documents?.tailorPhoto },
          { label: "Machine photo", icon: Wrench, status: t.documents?.machinePhoto ? "Pending" : "Flagged", url: t.documents?.machinePhoto }
        ]`
);

// 4. Update the Document Mockups
code = code.replace(
  /\{\/\* Document Mockups \*\/\}.*?\{\/\* Action Area \*\/\}/s,
  `{/* Document Mockups */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {selectedTailor.docs.map(doc => (
                  <div key={doc.label} className="p-4 rounded-xl border border-gold/20 bg-white shadow-sm flex flex-col items-center justify-center text-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-gold/10 flex items-center justify-center text-gold-deep">
                      <doc.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-navy">{doc.label}</p>
                      <p className="text-[10px] text-mocha">{doc.status}</p>
                    </div>
                    {doc.url ? (
                      <Button onClick={() => setViewingDocUrl(doc.url || "")} variant="outline" size="sm" className="h-7 text-xs rounded-full mt-2">View Image</Button>
                    ) : (
                      <Badge variant="outline" className="border-rose-200 text-rose-700 bg-rose-50 mt-2">Missing</Badge>
                    )}
                  </div>
                ))}
              </div>

              {/* Action Area */}`
);

// 5. Add viewing modal at the end of the Verification Modal
code = code.replace(
  /(\s+)<\/Card>\s+<\/div>\s+\)\}\s+<\/PageShell>/,
  `$1</Card>
        </div>
      )}

      {/* VIEW IMAGE OVERLAY */}
      {viewingDocUrl && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-navy/90 backdrop-blur-md p-4 animate-in fade-in duration-200" onClick={() => setViewingDocUrl(null)}>
          <div className="relative max-w-4xl max-h-[90vh] w-full flex flex-col items-center">
            <Button variant="ghost" size="icon" onClick={() => setViewingDocUrl(null)} className="absolute -top-12 right-0 rounded-full text-white hover:bg-white/20">
              <X className="h-6 w-6" />
            </Button>
            <img src={viewingDocUrl.startsWith('http') ? viewingDocUrl : 'http://localhost:5000/' + viewingDocUrl} alt="Document" className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl border border-white/20" />
          </div>
        </div>
      )}
    </PageShell>`
);

fs.writeFileSync('src/routes/admin.verifications.tsx', code);
console.log('Successfully updated admin.verifications.tsx');
