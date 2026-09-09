const fs = require('fs');

let code = fs.readFileSync('src/routes/admin.verifications.tsx', 'utf8');

// 1. Add isAadharVerified to Item type
code = code.replace(
  /docs: Doc\[\];\n  \};\n/,
  'docs: Doc[];\n    isAadharVerified?: boolean;\n  };\n'
);

// 2. Map isAadharVerified from API
code = code.replace(
  /status: t\.status === "changes_requested".*?\n/,
  `status: t.status === "changes_requested" ? "Changes Requested" : t.status === "approved" ? "Approved" : "Pending",\n          isAadharVerified: t.isAadharVerified,\n`
);

// 3. Add handleVerifyAadhar function
const handleVerifyCode = `
    const handleVerifyAadhar = async (id: string) => {
      try {
        await api.put(\`/admin/verify-aadhar/\` + id);
        fetchPending();
        alert("Aadhaar verified successfully via DigiLocker API");
      } catch (err) {
        console.error(err);
        alert("Failed to verify Aadhaar");
      }
    };

    const handleVerify = async`;
code = code.replace(/const handleVerify = async/, handleVerifyCode);

// 4. Update the Government ID mapping to match dummy UI if it is Govt ID
const renderDocCode = `
                  {selectedTailor.docs.map(doc => {
                    if (doc.label === "Government ID") {
                      return (
                        <div key={doc.label} className="p-4 rounded-xl border border-gold/20 bg-white shadow-sm flex flex-col items-center justify-center text-center gap-3 relative">
                          <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                            <ShieldAlert className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-navy">Govt ID (Aadhar)</p>
                            <p className="text-[10px] text-mocha">Verified via DigiLocker API</p>
                          </div>
                          {selectedTailor.isAadharVerified ? (
                            <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50 mt-2">Valid</Badge>
                          ) : (
                            <div className="flex gap-2 w-full mt-2">
                              {doc.url && <Button onClick={() => setViewingDocUrl(doc.url || "")} variant="outline" size="sm" className="flex-1 h-7 text-[10px] rounded-full">View</Button>}
                              <Button onClick={() => handleVerifyAadhar(selectedTailor.id)} size="sm" className="flex-1 h-7 text-[10px] rounded-full bg-blue-600 text-white hover:bg-blue-700">Validate</Button>
                            </div>
                          )}
                        </div>
                      );
                    }
                    return (
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
                  )})}
`;
code = code.replace(/\{selectedTailor\.docs\.map\(doc => \([\s\S]*?\)\)\}/, renderDocCode.trim());

fs.writeFileSync('src/routes/admin.verifications.tsx', code);
console.log('Updated admin.verifications.tsx');
